// app/api/snapshot/[analysisId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";

/**
 * A small JavaScript function that the final page will run.
 * It listens for `postMessage({ type: "HIGHLIGHT", highlights: [...] })`
 * and outlines elements, adds a label, etc.
 */
function highlightScript() {
  window.addEventListener("message", (event) => {
    if (!event.data) return;
    if (event.data.type === "HIGHLIGHT") {
      const highlights = event.data.highlights || [];
      highlights.forEach((h: { label: any; selector: any }) => {
        const label = h.label;
        document.querySelectorAll(h.selector).forEach((el) => {
          el.style.outline = "3px solid red";
          el.style.position = "relative";

          // Create a label in the top-left corner
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

          // On hover => post parent
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
      });
    }
  });
}

export async function GET(request: NextRequest, { params }: any) {
  let { analysisId } = params;
  if (!analysisId) {
    return new NextResponse("Analysis ID is required", { status: 400 });
  }

  try {
    await dbConnect();
    // find the analysis
    const report = await Report.findById(analysisId);
    if (!report) {
      return new NextResponse("Analysis not found", { status: 404 });
    }

    let snapshotHtml = report.snapshotHtml;
    if (!snapshotHtml) {
      return new NextResponse("No snapshot HTML stored", { status: 404 });
    }

    // 1) We inject the highlight script before </body>
    const injection = `
<script>(${highlightScript.toString()})()</script>
</body>
`;
    snapshotHtml = snapshotHtml.replace("</body>", injection);

    // 2) Return it as HTML
    return new NextResponse(snapshotHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message, { status: 500 });
  }
}
