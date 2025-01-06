// app/api/combinedAnalyze/route.ts

import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";

import OpenAI from "openai";

export const maxDuration = 45;
const API_KEY = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({ apiKey: API_KEY });

/**
 * Data structure the GPT will return, as a JSON string.
 * We'll parse it on the front-end.
 */
interface GPTIssue {
  issue_id: string;
  description: string;
  solution: string;
  selector?: string; // critical for highlighting
}

interface Heuristic {
  id: number;
  name: string;
  issues: GPTIssue[];
}

interface AnalysisResult {
  heuristics: Heuristic[];
}

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
    // Validate URL
    if (!url || !/^https?:\/\/.+/.test(url)) {
      return new NextResponse("Invalid URL", { status: 400 });
    }

    // Launch Puppeteer with appropriate settings
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

    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2" });

    // Capture screenshot
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const screenshotBase64 = Buffer.from(screenshotBuffer).toString("base64");
    // HTML
    const rawHTML = await page.content();
    // For GPT, we may want to truncate if the HTML is huge
    const truncatedHTML = rawHTML.substring(0, 15000); // e.g. 15k chars

    // 3. Prepare GPT prompt
    /**
     * We'll do a single prompt that includes both:
     * - The screenshot as an image_url
     * - The truncated HTML
     *
     * GPT (model) sees the screenshot as "an image" plus the HTML snippet.
     */
    const systemInstruction = `
      You are a web design expert specializing in usability and user experience designed to output JSON
      Your analysis should be based on Nielsen's 10 heuristics. 
      You will receive BOTH:
        1) A screenshot of the webpage (for visual cues).
        2) A snippet of HTML (for structural info).

      Combine both for a comprehensive analysis.
       Instructions:
      1. Evaluate the webpage based on Nielsen's 10 heuristics.
      2. For each of the 10 heuristics, identify and list the specific issues found on the webpage.
      3. Label each issue with a numeric scheme indicating the heuristic number followed by the issue number (e.g., "1.0", "1.1", "1.2" for the first heuristic).
      4. Provide a short solution suggestion for each issue (e.g., how to fix or mitigate it).
      5. Be as critical and specific as possible, and note exactly where or how the issue occurs on the page. For example:
         “Issue 1.1: The user does not see progress when submitting the form at the top of the page. 
          Solution: Add a loading spinner or progress bar to clarify submission status.”
      6. The issues identified should be reasonable and relevant to what the webpage is trying to achieve.
      7. Results should be the same for the same unaltered webpage.
      8. The analysis should be based on evaluations that can be done from the screenshot and HTML snippet provided. For example, you can't evaluate the loading speed of the page.
      9. Make sure the anysis covers the entirety of the webpage.


      OUTPUT must be valid JSON with this structure:

      {
        "heuristics": [
          {
            "id": 1,
            "name": "Visibility of System Status",
            "issues": [
              {
                "issue_id": "1.0",
                "description": "User does not see the progress of their submission when submitting the form.",
                "solution": "...",
                "selector": "..." 
              },
              {
                "issue_id": "1.1",
                "description": "Another distinct issue for this heuristic.",
                "solution": "...",
                "selector": "..." 
              }
            ]
          },
          ...
          {
            "id": 10,
            "name": "Help and Documentation",
            "issues": []
          }
        ]
      }

      - For each issue, try to provide a CSS selector in the "selector" field if relevant.
      - Provide as many real issues as make sense from BOTH the screenshot and HTML clues.Find as many issues as possible for each heuristic. You can list multiple issues per heuristic if applicable. Infact, if there is an orpportunity to list more than one issue, strictly do so - target at least 8 or more only when applicable. 
      - If no issues are found for a heuristic, the "issues" array should be empty.There is no need to force an issue if none exist.
      - All 10 heuristics are included (even if issues = []).
      - No additional fields or formatting besides the JSON structure specified.
      
    `;

    // We'll pass the truncated HTML in user content, plus the screenshot as "image_url"
    // The "model" sees the image as well.
    const userContent: any[] = [
      {
        type: "text",
        text: `
        Here is a snippet of the webpage's HTML (truncated if large):
        ${truncatedHTML}
        `,
      },
      {
        type: "image_url",
        image_url: {
          // We'll embed the screenshot in base64
          url: `data:image/png;base64,${screenshotBase64}`,
        },
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-3.5-turbo"
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userContent as any },
      ],
      temperature: 0.0,
      max_tokens: 16384,
      top_p: 0.5,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    const aiContent = response.choices[0].message?.content || "";

    // Return JSON: { screenshotBase64, analysis: stringified GPT output }
    // We'll parse the GPT output on the front-end.
    return NextResponse.json({
      screenshot: screenshotBase64, // So the front-end can show the snapshot
      analysis: aiContent, // The raw GPT JSON string
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
