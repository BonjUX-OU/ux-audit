// app/api/snapshot/route.ts

import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";

// Only import full Puppeteer in development
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
          ? undefined // Use puppeteer's default executable in development
          : await chromium.executablePath(),
      headless: true,
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

    // Return the screenshot
    return NextResponse.json({ screenshot: screenshotBase64 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}
