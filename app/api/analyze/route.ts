//api/analyze/route.ts
import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

import Report from "@/models/Report"; // Adjust to your model path
import dbConnect from "@/lib/dbConnect";
// -- Basic config
export const maxDuration = 45;
export const revalidate = 0;
const API_KEY = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({ apiKey: API_KEY });

let puppeteerModule: any = puppeteer;
if (process.env.NODE_ENV === "development") {
  puppeteerModule = require("puppeteer");
}

// -- Zod Schemas for analysis result
interface Occurrence {
  id: string;
  selector: string;
}

interface GPTIssue {
  issue_id: string;
  description: string;
  solution: string;
  occurrences: Occurrence[];
}

interface Heuristic {
  id: number;
  name: string;
  issues: GPTIssue[];
}

interface HeuristicScore {
  id: number;
  score: number;
}

interface AnalysisResult {
  heuristics: Heuristic[];
  scores: HeuristicScore[];
}

const AnalysisSchema = z.object({
  heuristics: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      issues: z.array(
        z.object({
          issue_id: z.string(),
          description: z.string(),
          solution: z.string(),
          occurrences: z.array(
            z.object({
              id: z.string(),
              selector: z.string(),
            })
          ),
        })
      ),
    })
  ),
  scores: z.array(
    z.object({
      id: z.number(),
      score: z.number(),
    })
  ),
});

// -- A separate schema for the "comparison" step
// We expect GPT to return { same: true } or { same: false }
const CompareSchema = z.object({
  same: z.boolean(),
});

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}

export async function POST(request: Request) {
  let browser: Browser | null = null;

  try {
    await dbConnect();
    const { url } = await request.json();

    // 1) Validate URL
    if (!url || !/^https?:\/\/.+/.test(url)) {
      return new NextResponse("Invalid URL", { status: 400 });
    }

    // 2) Launch Puppeteer
    browser = await puppeteerModule.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.NODE_ENV === "development"
          ? undefined
          : await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    if (!browser) {
      return new NextResponse("Failed to launch browser", { status: 500 });
    }

    // 3) Fetch new page HTML & screenshot
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2" });

    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const screenshotBase64 = Buffer.from(screenshotBuffer).toString("base64");
    const rawHTML = await page.content();
    const truncatedHTML = rawHTML.substring(0, 15000);

    // 4) Check if an old report exists
    const existingReport = await Report.findOne({ url });
    if (existingReport) {
      // We have some old data
      const oldTruncatedHTML = existingReport.snapshotHtml.substring(0, 15000);

      // 4a) We'll ask GPT if the old snapshot vs. new snapshot
      // is effectively the same from a usability perspective

      // We prepare user content for "comparison" call:
      const compareSystemInstruction = `
        You are a web design expert. 
        Compare these two HTML snippets and screenshots to see if they represent 
        the same user experience (same structure, same content).
        Consider minor text differences or random IDs as potential noise.
        
        Return valid JSON with the schema:
        {
          "same": boolean
        }
        
        - "same"=true if they are effectively the same from a UX standpoint
        - "same"=false if they differ enough to warrant re-analysis
      `;
      const compareUserContent = [
        {
          type: "text",
          text: `OLD HTML snippet (truncated): ${oldTruncatedHTML}`,
        },
        {
          type: "text",
          text: `NEW HTML snippet (truncated): ${truncatedHTML}`,
        },
        {
          type: "image_url",
          image_url: { url: `data:image/png;base64,${screenshotBase64}` },
        },
      ];

      // 4b) We do a GPT call for "compare"
      const compareResponse = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: compareSystemInstruction },
          { role: "user", content: compareUserContent as any },
        ],
        response_format: zodResponseFormat(CompareSchema, "comparison"),
        temperature: 0.0,
        max_tokens: 1000,
      });

      const compareParsed = compareResponse.choices[0].message.parsed;
      if (compareParsed && compareParsed.same === true) {
        // 4c) If GPT says "same," return old analysis
        return NextResponse.json({
          screenshot: screenshotBase64,
          analysis: {
            heuristics: existingReport.heuristics,
            scores: existingReport.scores,
          },
          snapshotHtml: existingReport.snapshotHtml,
          message:
            "GPT comparison concluded they are effectively the same. Returning existing analysis.",
        });
      }
      // else fall through to do a new analysis
    }

    // 5) If no existing report or GPT says "different," do a new analysis
    const analysisSystemInstruction = `
      You are a web design expert specializing in usability and user experience. 
      Analyze the webpage based on Nielsen's 10 heuristics and provide structured JSON output.
      Follow these rules:
      - Identify usability issues for each heuristic.
      - Label each issue with a heuristic number followed by an issue number (i.e., "1.1, 1.2 ,1.3" for every occurence of the issue in different parts of the page)and an occurence number for everytime it occurs.For example if we have issue 4.1 "Inconsistent button styles across the page." each occurence of this issue should be labeled as 4.1.1, 4.1.2, 4.1.3, etc.
      - Provide a CSS selector if possible for each issue occurrence correctly labeled. So this means that each selector is an occurrence of the issue and each should have a unique occurrence ID.
      - Ensure valid JSON output adhering to the provided schema.
    `;

    const analysisUserContent = [
      { type: "text", text: `HTML snippet: ${truncatedHTML}` },
      {
        type: "image_url",
        image_url: { url: `data:image/png;base64,${screenshotBase64}` },
      },
    ];

    const analysisResponse = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: analysisSystemInstruction },
        { role: "user", content: analysisUserContent as any },
      ],
      response_format: zodResponseFormat(AnalysisSchema, "analysis"),
      temperature: 0.0,
      max_tokens: 16384,
      top_p: 0.5,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    // 6) Parse the new analysis
    const parsedAnalysis = analysisResponse.choices[0].message.parsed;
    if (!parsedAnalysis) {
      return new NextResponse("Failed to parse analysis result", {
        status: 500,
      });
    }

    // 7) Return final new analysis (not saving to DB)
    return NextResponse.json({
      screenshot: screenshotBase64,
      analysis: parsedAnalysis,
      snapshotHtml: rawHTML,
      message:
        "GPT indicates the page differs or no existing report. Returned new analysis.",
    });
  } catch (error: any) {
    console.error("Error in analysis route:", error);
    return new NextResponse(error.message || "Internal Server Error", {
      status: 500,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
