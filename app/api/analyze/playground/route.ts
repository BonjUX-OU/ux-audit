import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export const maxDuration = 60;

// `api/analyze/playground`
export async function POST(request: Request) {
  try {
    // const { url } = await request.json();
    // if (!url || !/^https?:\/\/.+/.test(url)) {
    //   return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
    // }

    console.log("starting axios req");

    const rawHTML = await axios.get("https://turkishairlines.com");

    console.log("axios response", rawHTML.data);

    const cheerioRes = cheerio.load(rawHTML.data);

    console.log("cheerio", cheerioRes);

    return NextResponse.json({
      rawHTML,
      cheerioRes,
      message: "Step 1 completed: Webpage data fetched.",
    });
  } catch (error: any) {
    console.error("Error in step1:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
