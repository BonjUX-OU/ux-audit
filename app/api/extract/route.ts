// app/api/extract/route.ts
import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";

export const maxDuration = 45;

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
    // Could adjust timeouts, emulate devices, etc.
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract fully rendered HTML
    const rawHTML = await page.content();

    return NextResponse.json({ html: rawHTML });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
