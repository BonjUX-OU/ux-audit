import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

export const maxDuration = 45;
export const revalidate = 0;
const API_KEY = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({ apiKey: API_KEY });

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
  name: string;
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
      name: z.string(),
      score: z.number(),
    })
  ),
});

let puppeteerModule: any = puppeteer;
if (process.env.NODE_ENV === "development") {
  puppeteerModule = require("puppeteer");
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}

export async function POST(request: Request) {
  let browser: Browser | null = null;

  try {
    const { url } = await request.json();
    if (!url || !/^https?:\/\/.+/.test(url)) {
      return new NextResponse("Invalid URL", { status: 400 });
    }

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

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2" });
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const screenshotBase64 = Buffer.from(screenshotBuffer).toString("base64");
    const rawHTML = await page.content();
    const truncatedHTML = rawHTML.substring(0, 15000);
    const fullSnapshot = rawHTML;

    const systemInstruction = `
       You are a web design expert specializing in usability and user experience. 
      Analyze the webpage based on Nielsen's 10 heuristics and provide structured JSON output.
      Follow these rules:
      - Identify usability issues for each heuristic.
      - Label each issue with a heuristic number followed by an issue number and an occurence number for everytime it occurs (i.e., "1.0.1, 1.0.2 ,1.0.3, 1.1.1, 1.1.2 ,1.1.3" for every occurence of the issue in different parts of the page).For example if we have issue 4.1 "Inconsistent button styles across the page." each occurence of this issue should be labeled as 4.1.1, 4.1.2, 4.1.3, etc.
      - Provide a CSS selector if possible for each issue occurrence correctly labeled. So this means that each selector is an occurrence of the issue and each should have a unique occurrence ID.
      - Ensure valid JSON output adhering to the provided schema.
    `;

    const userContent: any[] = [
      { type: "text", text: `HTML snippet: ${truncatedHTML}` },
      {
        type: "image_url",
        image_url: { url: `data:image/png;base64,${screenshotBase64}` },
      },
    ];

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userContent as any },
      ],
      response_format: zodResponseFormat(AnalysisSchema, "analysis"),
      temperature: 0.0,
      max_tokens: 16384,
      top_p: 0.5,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    const parsedResponse = response.choices[0].message.parsed;
    if (!parsedResponse) {
      return new NextResponse("Failed to parse analysis result", {
        status: 500,
      });
    }
    const analysis: AnalysisResult = parsedResponse;

    return NextResponse.json({
      screenshot: screenshotBase64,
      analysis,
      snapshotHtml: fullSnapshot,
    });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(error.message, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
