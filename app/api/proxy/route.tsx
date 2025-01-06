// app/api/proxy/route.ts
import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";

let puppeteerModule: any = puppeteer;
if (process.env.NODE_ENV === "development") {
  puppeteerModule = require("puppeteer");
}

/**
 * Script injected into the proxied page.
 * Outlines elements in red, places a label, and
 * sends bounding box + issueId to the parent on hover.
 */
function highlightScript() {
  window.addEventListener("message", (event) => {
    if (!event.data) return;

    if (event.data.type === "HIGHLIGHT") {
      const highlights = event.data.highlights || [];
      highlights.forEach((h: { selector: any; label: string | null }) => {
        document.querySelectorAll(h.selector).forEach((el) => {
          // Outline in red
          el.style.outline = "3px solid red";
          el.style.position = "relative";

          // Create a label at top-left
          const labelSpan = document.createElement("span");
          labelSpan.textContent = h.label; // e.g. "1.1"
          labelSpan.style.position = "absolute";
          labelSpan.style.top = "0";
          labelSpan.style.left = "0";
          labelSpan.style.background = "red";
          labelSpan.style.color = "white";
          labelSpan.style.padding = "2px 4px";
          labelSpan.style.fontSize = "12px";
          labelSpan.style.zIndex = "9999";
          labelSpan.style.cursor = "default";

          // Hover => post bounding rect + issueId
          labelSpan.onmouseover = (e) => {
            e.stopPropagation();
            const rect = labelSpan.getBoundingClientRect();
            window.parent.postMessage(
              {
                type: "ISSUE_MOUSEENTER",
                issueId: h.label,
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

          // Mouseout => send ISSUE_MOUSELEAVE
          labelSpan.onmouseout = (e) => {
            e.stopPropagation();
            window.parent.postMessage({ type: "ISSUE_MOUSELEAVE" }, "*");
          };

          // Append label
          el.appendChild(labelSpan);
        });
      });
    }
  });
}

export async function GET(request: Request) {
  let browser: Browser | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");
    if (!targetUrl) {
      return new NextResponse("Missing 'url' param", { status: 400 });
    }
    if (!/^https?:\/\/.+/.test(targetUrl)) {
      return new NextResponse("Invalid URL", { status: 400 });
    }

    // Launch Puppeteer
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
    await page.goto(targetUrl, { waitUntil: "networkidle2" });

    // Inject the highlight script
    await page.addScriptTag({
      content: `(${highlightScript.toString()})()`,
    });

    // Convert relative URLs to absolute
    await page.evaluate((baseUrl) => {
      function toAbsoluteUrl(relativeUrl: string) {
        try {
          return new URL(relativeUrl, baseUrl).href;
        } catch {
          return relativeUrl;
        }
      }
      const attrsToFix = ["href", "src", "srcset"];
      attrsToFix.forEach((attr) => {
        document.querySelectorAll(`[${attr}]`).forEach((el) => {
          const oldVal = el.getAttribute(attr);
          if (oldVal) {
            el.setAttribute(attr, toAbsoluteUrl(oldVal));
          }
        });
      });
    }, targetUrl);

    // Return final HTML
    const content = await page.content();
    return new NextResponse(content, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
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
