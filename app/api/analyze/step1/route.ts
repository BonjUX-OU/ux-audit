import { NextResponse } from "next/server";

export const revalidate = 0;
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || !/^https?:\/\/.+/.test(url)) {
      return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
    }

    const axios = require("axios");
    const token = "444c249b6572421aa3c5b10696207b5cc62e82ad62a";
    const targetUrl = encodeURIComponent(url);
    const render = "true";
    const superParam = "true";
    const blockResources = "false";
    const config = {
      method: "GET",
      url: `https://api.scrape.do/?token=${token}&url=${targetUrl}&render=${render}&blockResources=${blockResources}`,
      headers: {},
    };
    axios(config)
      .then(function (response: { data: any }) {
        console.log(response.data);
      })
      .catch(function (error: any) {
        console.log(error);
      });

    return NextResponse.json({
      screenshot: "screenshotBase64",
      rawHTML: "",
      message: "Step 1 completed: Webpage data fetched.",
    });
  } catch (error: any) {
    console.error("Error in step1:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
