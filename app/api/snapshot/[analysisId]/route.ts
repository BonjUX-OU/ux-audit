import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";

/**
 * This script will receive highlight instructions (via postMessage)
 * and outline the target elements. If the selector is invalid, skip it
 * to avoid querySelectorAll() throwing an error.
 */
function highlightScript() {
  window.addEventListener("message", (event) => {
    if (!event.data) return;
    if (event.data.type === "HIGHLIGHT") {
      const highlights = event.data.highlights || [];
      highlights.forEach((h: any) => {
        const label = h.label || "";
        const selector = h.selector || "";

        // If the selector is invalid, querySelectorAll will throw an error
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            el.style.outline = "3px solid red";
            el.style.position = "relative";

            // Create a small label in the top-left corner
            const labelSpan = document.createElement("span");
            labelSpan.textContent = label;
            labelSpan.style.position = "absolute";
            labelSpan.style.top = "0";
            labelSpan.style.left = "0";
            labelSpan.style.background = "red";
            labelSpan.style.color = "white";
            labelSpan.style.padding = "2px 4px";
            labelSpan.style.fontSize = "12px";
            labelSpan.style.zIndex = "9999";
            labelSpan.style.cursor = "default";

            // On hover => let the parent window know
            labelSpan.onmouseover = (e) => {
              e.stopPropagation();
              const rect = labelSpan.getBoundingClientRect();
              window.parent.postMessage(
                {
                  type: "ISSUE_MOUSEENTER",
                  issueId: label,
                  rect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                  },
                },
                "*"
              );
            };
            labelSpan.onmouseout = (e) => {
              e.stopPropagation();
              window.parent.postMessage({ type: "ISSUE_MOUSELEAVE" }, "*");
            };

            el.appendChild(labelSpan);
          });
        } catch (err) {
          console.warn("Invalid selector skipped:", selector, err);
        }
      });
    }
  });
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request: NextRequest, { params }: any) {
  const { analysisId } = params;
  if (!analysisId) {
    return new NextResponse("Analysis ID is required", { status: 400 });
  }

  try {
    await dbConnect();
    const report = await Report.findById(analysisId);
    if (!report) {
      return new NextResponse("Analysis not found", { status: 404 });
    }

    let snapshotHtml = report.snapshotHtml;
    if (!snapshotHtml) {
      return new NextResponse("No snapshot HTML stored", { status: 404 });
    }

    // 1) Remove external scripts that break or cause security errors,
    //    for example _vercel/insights/view. Adjust the regex to match your code.
    //    This is a naive approach that removes entire <script> tags referencing that resource.
    snapshotHtml = snapshotHtml.replace(
      /<script[^>]+src=['"]?[^'"]*_vercel\/insights\/view[^>]*><\/script>/gi,
      ""
    );

    // 2) Insert a <base> tag so relative URLs load with the original domain (if needed).
    //    This only works if your stored HTML is a full <html>...<head>... document
    if (report.url) {
      snapshotHtml = snapshotHtml.replace(
        /<head([^>]*)>/i,
        `<head$1><base href="${report.url}">`
      );
    }

    // 3) Inject the highlight script before </body>
    const injection = `
<script>(${highlightScript.toString()})()</script>
</body>
`;
    snapshotHtml = snapshotHtml.replace("</body>", injection);

    // Return final HTML plus CORS headers
    return new NextResponse(snapshotHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message, { status: 500 });
  }
}
