// app/api/highlight/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

/**
 * Data structures
 */
interface Issue {
  issue_id: string;
  description: string;
  solution: string;
  selector?: string;
}

interface Heuristic {
  id: number;
  name: string;
  issues: Issue[];
}

interface AnalysisResult {
  heuristics: Heuristic[];
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}

export async function POST(request: Request) {
  try {
    const { html, analysis } = (await request.json()) as {
      html: string;
      analysis: AnalysisResult;
    };

    if (!html || !analysis) {
      return NextResponse.json(
        { error: "Missing html or analysis" },
        { status: 400 }
      );
    }

    // 1. Load the HTML with Cheerio
    const $ = cheerio.load(html);

    // 2. For each issue that has a selector, highlight the matched element(s)
    //    We'll inline a simple red outline or background to indicate the highlight.
    analysis.heuristics.forEach((h) => {
      h.issues.forEach((issue) => {
        if (issue.selector) {
          // For each matched element, add a highlight style or a CSS class
          $(issue.selector).each((_, el) => {
            // Example inline style
            $(el).attr(
              "style",
              ($(el).attr("style") ?? "") +
                "; outline: 3px solid red; position: relative; " +
                "margin: 2px; "
            );

            // Optionally, we might place a small label or tooltip
            // e.g., insert a small <span> as a label
            const label = `<span style="position:absolute; top:0; left:0; background:red; color:white; padding:2px 5px; font-size:12px; z-index:9999;">${issue.issue_id}</span>`;
            $(el).prepend(label);
          });
        }
      });
    });

    // 3. Return the modified HTML
    const highlightedHTML = $.html();

    return NextResponse.json({ highlightedHTML });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
