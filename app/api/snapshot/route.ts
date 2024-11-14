// app/api/snapshot/route.ts

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // Validate URL
    if (!url || !/^https?:\/\/.+/.test(url)) {
      return new NextResponse("Invalid URL", { status: 400 });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2" });

    // Capture screenshot
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    // Specify 'base64' encoding
    const screenshotBase64 = Buffer.from(screenshotBuffer).toString("base64");

    // Close browser
    await browser.close();

    // Return the screenshot
    return NextResponse.json({ screenshot: screenshotBase64 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
