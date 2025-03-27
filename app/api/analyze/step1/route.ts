import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import type { Browser } from "puppeteer-core";

export const revalidate = 0;
export const maxDuration = 45;

let puppeteerModule: any = puppeteer;
if (process.env.NODE_ENV === "development") {
  puppeteerModule = require("puppeteer");
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || !/^https?:\/\/.+/.test(url)) {
      return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
    }

    // Launch Puppeteer with same configuration as before
    const browser: Browser = await puppeteerModule.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.NODE_ENV === "development"
          ? undefined
          : await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2" });

    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const screenshotBase64 = Buffer.from(screenshotBuffer).toString("base64");
    const rawHTML = await page.content();
    const truncatedHTML = rawHTML.substring(0, 15000);

    await browser.close();

    return NextResponse.json({
      screenshot: screenshotBase64,
      rawHTML,
      truncatedHTML,
      message: "Step 1 completed: Webpage data fetched.",
    });
  } catch (error: any) {
    console.error("Error in step1:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
