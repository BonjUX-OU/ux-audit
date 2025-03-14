import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";

/**
 * This script is injected into the snapshot HTML.
 * - We handle a "SET_SCALE" message to zoom out the entire page if needed.
 * - We handle drag-to-select logic, using scaled coords for elementFromPoint.
 */
function highlightScript() {
  // If the parent is narrower than 1200 px, we scale down
  let currentScale = 1.0; // default no zoom-out
  let editMode = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let overlay: HTMLDivElement | null = null;

  // Make the content always sized for 1200 px, then scale
  // (You could set the body width to 1200 if you prefer.)
  function applyScaleFactor(scale: number) {
    currentScale = scale;
    const html = document.documentElement;
    html.style.transformOrigin = "top left";
    html.style.transform = `scale(${currentScale})`;
    // Force the layout to 1200 px so we see the "desktop" layout
    html.style.width = "1200px";
    // If you want to ensure no leftover horizontal scrolbars in the iFrame doc:
    html.style.overflowX = "hidden";
  }

  // Build a unique CSS path for the found element
  function getUniqueSelector(element: HTMLElement | null): string {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }
    if (element.id) {
      return `#${CSS.escape(element.id)}`;
    }
    const parent = element.parentElement;
    if (!parent) {
      return element.tagName.toLowerCase();
    }
    const siblings = Array.from(parent.children).filter(
      (node) => node.tagName === element.tagName
    );
    const index = siblings.indexOf(element) + 1;
    const tagName = element.tagName.toLowerCase();
    const nth = index > 1 ? `${tagName}:nth-of-type(${index})` : tagName;
    const parentSelector = getUniqueSelector(parent);
    if (!parentSelector || parentSelector === "html") {
      return `html > ${nth}`;
    } else {
      return `${parentSelector} > ${nth}`;
    }
  }

  function removeOverlay() {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      overlay = null;
    }
  }

  function handleMouseDown(e: MouseEvent) {
    if (!editMode) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.left = `${startX}px`;
    overlay.style.top = `${startY}px`;
    overlay.style.width = "0px";
    overlay.style.height = "0px";
    overlay.style.background = "rgba(0, 0, 255, 0.3)";
    overlay.style.border = "2px dashed blue";
    overlay.style.zIndex = "10000";
    document.body.appendChild(overlay);

    e.preventDefault();
  }

  function handleMouseMove(e: MouseEvent) {
    if (!editMode || !isDragging || !overlay) return;
    const currentX = e.clientX;
    const currentY = e.clientY;
    const rectLeft = Math.min(startX, currentX);
    const rectTop = Math.min(startY, currentY);
    const rectWidth = Math.abs(startX - currentX);
    const rectHeight = Math.abs(startY - currentY);
    overlay.style.left = `${rectLeft}px`;
    overlay.style.top = `${rectTop}px`;
    overlay.style.width = `${rectWidth}px`;
    overlay.style.height = `${rectHeight}px`;
    e.preventDefault();
  }

  function handleMouseUp(e: MouseEvent) {
    if (!editMode || !isDragging || !overlay) return;
    isDragging = false;
    const rect = overlay.getBoundingClientRect();
    removeOverlay();

    // The user is seeing a scaled doc.
    // If currentScale=0.5, then the doc is half size,
    // but the pointer coords are at the "visual" scale.
    // We must invert the scale when calling elementFromPoint.
    const centerX = (rect.left + rect.width / 2) / currentScale;
    const centerY = (rect.top + rect.height / 2) / currentScale;

    const el = document.elementFromPoint(centerX, centerY) as HTMLElement;
    if (el) {
      const uniqueSelector = getUniqueSelector(el);
      window.parent.postMessage(
        { type: "ELEMENT_SELECTED", selector: uniqueSelector },
        "*"
      );
    }
    e.preventDefault();
  }

  window.addEventListener("message", (event) => {
    if (!event.data) return;
    const { type } = event.data;

    if (type === "SET_SCALE") {
      // The parent told us to scale the doc
      const scale = event.data.scale || 1.0;
      applyScaleFactor(scale);
    } else if (type === "HIGHLIGHT") {
      // Possibly highlight known issues
      const highlights = event.data.highlights || [];
      highlights.forEach((h: any) => {
        const label = h.label || "";
        const selector = h.selector || "";
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            (el as HTMLElement).style.outline = "3px solid red";
            (el as HTMLElement).style.position = "relative";

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
            (el as HTMLElement).appendChild(labelSpan);
          });
        } catch (err) {
          console.warn("Invalid selector skipped:", selector, err);
        }
      });
    } else if (type === "TOGGLE_EDIT_MODE") {
      editMode = event.data.edit;
      if (editMode) {
        document.addEventListener("mousedown", handleMouseDown, true);
        document.addEventListener("mousemove", handleMouseMove, true);
        document.addEventListener("mouseup", handleMouseUp, true);
      } else {
        document.removeEventListener("mousedown", handleMouseDown, true);
        document.removeEventListener("mousemove", handleMouseMove, true);
        document.removeEventListener("mouseup", handleMouseUp, true);
      }
    }
  });
}

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

    // Remove external scripts that might break the page
    snapshotHtml = snapshotHtml.replace(
      /<script[^>]+src=['"]?[^'"]*_vercel\/insights\/view[^>]*><\/script>/gi,
      ""
    );

    // Remove or rewrite <meta name="viewport"> to avoid forced mobile scaling
    snapshotHtml = snapshotHtml.replace(
      /<meta[^>]+name=["']viewport["'][^>]*>/gi,
      ""
    );

    // Insert a <base> tag so relative URLs load properly
    if (report.url) {
      snapshotHtml = snapshotHtml.replace(
        /<head([^>]*)>/i,
        `<head$1><base href="${report.url}">`
      );
    }

    // Inject highlight/drag script before </body>
    const injection = `
<script>(${highlightScript.toString()})()</script>
</body>
`;
    snapshotHtml = snapshotHtml.replace("</body>", injection);

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
