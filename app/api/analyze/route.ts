import { NextResponse } from "next/server";
// Use globalThis.TransformStream (works in Node 18+)
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

import Report from "@/models/Report";
import dbConnect from "@/lib/dbConnect";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let puppeteerModule: any = puppeteer;
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  puppeteerModule = require("puppeteer");
}

const API_KEY = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({ apiKey: API_KEY });

// Steps indices:
// 0 -> Searching website
// 1 -> Taking screenshot
// 2 -> Copying website HTML
// 3 -> Analyzing with GPT
// 4 -> GPT writes new CSS code to highlight issues
// 5 -> GPT generates final analysis & storing report

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sseEvent(writer: WritableStreamDefaultWriter<Uint8Array>, data: any) {
  const text = `data: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  writer.write(encoder.encode(text));
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const { readable, writable } = new globalThis.TransformStream();
  const writer = writable.getWriter();

  const response = new NextResponse(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });

  let browser: Browser | null = null;

  try {
    await dbConnect();
    const { url, sector, pageType, ownerId, projectId } = await request.json();

    // STEP 0: Searching website...
    sseEvent(writer, {
      event: "step-update",
      stepIndex: 0,
      status: "in-progress",
    });
    if (!url || !/^https?:\/\/.+/.test(url)) {
      throw new Error("Invalid URL provided");
    }
    // Artificial delay so the spinner shows
    await delay(300);
    sseEvent(writer, { event: "step-update", stepIndex: 0, status: "done" });

    // STEP 1: Taking screenshot
    sseEvent(writer, {
      event: "step-update",
      stepIndex: 1,
      status: "in-progress",
    });
    browser = await puppeteerModule.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.NODE_ENV === "development" ? undefined : await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    if (!browser) {
      throw new Error("Failed to launch browser");
    }
    await delay(300);
    sseEvent(writer, { event: "step-update", stepIndex: 1, status: "done" });

    // STEP 2: Copying website HTML
    sseEvent(writer, {
      event: "step-update",
      stepIndex: 2,
      status: "in-progress",
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const screenshotBase64 = Buffer.from(screenshotBuffer).toString("base64");
    const rawHTML = await page.content();
    const truncatedHTML = rawHTML.substring(0, 15000);
    await delay(300);
    sseEvent(writer, { event: "step-update", stepIndex: 2, status: "done" });

    // STEP 3: Analyzing with GPT
    sseEvent(writer, {
      event: "step-update",
      stepIndex: 3,
      status: "in-progress",
    });
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
    const analysisSystemInstruction = `
      You are a web design expert focusing on Nielsen's heuristics.
      Analyze the snippet for usability issues and produce JSON in this schema:
      {
        "heuristics": [ { "id": number, "name": string, "issues": [ ... ] } ],
        "scores": [ { "id": number, "score": number } ]
      }
      Each issue must have unique occurrence IDs with CSS selectors if possible.
    `;
    const analysisResponse = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: analysisSystemInstruction },
        {
          role: "user",
          content: [
            { type: "text", text: `HTML snippet: ${truncatedHTML}` },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${screenshotBase64}` },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(AnalysisSchema, "analysis"),
      temperature: 0.0,
      max_tokens: 2000,
    });
    const parsedAnalysis = analysisResponse.choices[0].message.parsed;
    if (!parsedAnalysis) {
      throw new Error("GPT analysis returned invalid data");
    }
    await delay(300);
    sseEvent(writer, { event: "step-update", stepIndex: 3, status: "done" });

    // STEP 4: GPT writes new CSS code to highlight issues
    sseEvent(writer, {
      event: "step-update",
      stepIndex: 4,
      status: "in-progress",
    });
    const highlightCss = `
      /* Example highlight for issues */
      .highlight-issue { outline: 2px dashed red; }
    `;
    await delay(300);
    sseEvent(writer, { event: "step-update", stepIndex: 4, status: "done" });

    // STEP 5: GPT generates final analysis & storing report
    sseEvent(writer, {
      event: "step-update",
      stepIndex: 5,
      status: "in-progress",
    });
    let overallScore = 0;
    if (parsedAnalysis.scores?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overallScore = parsedAnalysis.scores.reduce((acc: number, s: any) => acc + Number(s.score), 0);
    }
    const newReport = new Report({
      owner: ownerId,
      project: projectId,
      url,
      scores: parsedAnalysis.scores,
      screenshot: screenshotBase64,
      sector,
      pageType,
      heuristics: parsedAnalysis.heuristics,
      overallScore,
      snapshotHtml: rawHTML,
      highlightCss,
    });
    await newReport.save();
    await delay(300);
    sseEvent(writer, { event: "step-update", stepIndex: 5, status: "done" });

    sseEvent(writer, { event: "final", reportId: newReport._id });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Analysis error:", err);
    sseEvent(writer, { event: "error", message: err.message, stepIndex: 0 });
  } finally {
    if (browser) {
      await browser.close();
    }
    writer.close();
  }

  return response;
}
