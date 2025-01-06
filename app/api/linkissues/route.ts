// app/api/link-issues/route.ts

import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";

/**
 * Example interfaces.
 * The AI output is "analysis" with heuristics.
 * Potentially, each issue might have a "selector" field if you prompt GPT to guess.
 */

interface GPTIssue {
  issue_id: string;
  description: string;
  solution: string;
  selector?: string; // the AI or user might define a CSS selector
}

interface Heuristic {
  id: number;
  name: string;
  issues: GPTIssue[];
}

interface AnalysisResult {
  heuristics: Heuristic[];
}

interface Annotation {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}

export async function POST(request: Request) {
  let browser: Browser | null = null;
  try {
    const { url, analysis } = (await request.json()) as {
      url: string;
      analysis: AnalysisResult;
    };

    if (!url) {
      return new NextResponse("Missing URL", { status: 400 });
    }
    if (!analysis) {
      return new NextResponse("Missing analysis", { status: 400 });
    }

    // Launch Puppeteer
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.NODE_ENV === "development"
          ? undefined
          : await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // We'll gather bounding boxes for all issues that have a "selector"
    const annotations: Annotation[] = [];

    for (const heuristic of analysis.heuristics) {
      for (const issue of heuristic.issues) {
        if (issue.selector) {
          const el = await page.$(issue.selector);
          if (el) {
            const box = await el.boundingBox();
            if (box) {
              annotations.push({
                x: box.x,
                y: box.y,
                width: box.width,
                height: box.height,
                label: issue.issue_id, // e.g. "1.1", "2.2"
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ annotations });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
