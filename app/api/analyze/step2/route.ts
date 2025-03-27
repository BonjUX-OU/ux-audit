import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import Report from "@/models/Report";
import dbConnect from "@/lib/dbConnect";

export const revalidate = 0;
export const maxDuration = 45;

const API_KEY = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({ apiKey: API_KEY });

// Define the compare schema exactly as before
const CompareSchema = z.object({
  same: z.boolean(),
});

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { url, truncatedHTML, screenshot } = await request.json();
    if (!url || !truncatedHTML || !screenshot) {
      return NextResponse.json(
        { message: "Missing required data" },
        { status: 400 }
      );
    }

    const existingReport = await Report.findOne({ url });
    if (existingReport) {
      const oldTruncatedHTML = existingReport.snapshotHtml.substring(0, 15000);

      const compareSystemInstruction = `
        You are a web design expert. 
        Compare these two HTML snippets and screenshots to see if they represent 
        the same user experience (same structure, same content).
        Minor text differences or random IDs may be noise.
        
        Return valid JSON with schema:
        { "same": boolean }
      `;
      const compareUserContent = [
        {
          type: "text",
          text: `OLD HTML snippet (truncated): ${oldTruncatedHTML}`,
        },
        {
          type: "text",
          text: `NEW HTML snippet (truncated): ${truncatedHTML}`,
        },
        {
          type: "image_url",
          image_url: { url: `data:image/png;base64,${screenshot}` },
        },
      ];

      const compareResponse = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: compareSystemInstruction },
          { role: "user", content: compareUserContent as any },
        ],
        response_format: zodResponseFormat(CompareSchema, "comparison"),
        temperature: 0.0,
        max_tokens: 1000,
      });

      const compareParsed = compareResponse.choices[0]?.message?.parsed;
      if (compareParsed && compareParsed.same === true) {
        // Return existing analysis if pages are effectively the same.
        return NextResponse.json({
          same: true,
          reportId: existingReport._id,
          analysis: {
            heuristics: existingReport.heuristics,
            scores: existingReport.scores,
          },
          snapshotHtml: existingReport.snapshotHtml,
          message: "Returning existing analysis (pages are effectively same).",
        });
      }
    }
    // If no existing report or pages differ, indicate so.
    return NextResponse.json({
      same: false,
      message: "Page is different or no existing report.",
    });
  } catch (error: any) {
    console.error("Error in step2:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
