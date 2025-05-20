import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

export const revalidate = 0;
export const maxDuration = 45;

const API_KEY = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({ apiKey: API_KEY });

// Define the analysis schema exactly as before
const AnalysisSchema = z.object({
  heuristics: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      issues: z.array(
        z.object({
          issue_id: z.string(),
          description: z.string(),
          solution: z.string(),
          occurrences: z.array(
            z.object({
              id: z.string(),
              selector: z.string(),
            })
          ),
        })
      ),
    })
  ),
  scores: z.array(
    z.object({
      id: z.number(),
      score: z.number(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const { truncatedHTML, screenshot, rawHTML } = await request.json();
    if (!truncatedHTML || !screenshot || !rawHTML) {
      return NextResponse.json({ message: "Missing required data" }, { status: 400 });
    }

    const analysisSystemInstruction = `
      You are a web design expert specializing in usability and user experience. 
      Analyze the webpage based on Nielsen's 10 heuristics and provide structured JSON output.
      Follow these rules:
      - Identify usability issues for each heuristic.
      - Label each issue with a unique ID, link them to a heuristic (ex: "1.1, 1.2, etc"), and each occurrence with a unique sub-id (ex: 1.1.1, 1.1.2).
      - Provide a CSS selector if possible for each occurrence.
      - Return valid JSON per the given schema.
    `;

    const analysisUserContent = [
      { type: "text", text: `HTML snippet: ${truncatedHTML}` },
      {
        type: "image_url",
        image_url: { url: `data:image/png;base64,${screenshot}` },
      },
    ];

    const analysisResponse = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: analysisSystemInstruction },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { role: "user", content: analysisUserContent as any },
      ],
      response_format: zodResponseFormat(AnalysisSchema, "analysis"),
      temperature: 0.0,
      max_tokens: 16384,
      top_p: 0.5,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    const parsedAnalysis = analysisResponse.choices[0].message.parsed;
    if (!parsedAnalysis) {
      return NextResponse.json({ message: "Failed to parse analysis from GPT" }, { status: 500 });
    }

    return NextResponse.json({
      analysis: parsedAnalysis,
      snapshotHtml: rawHTML,
      message: "New analysis generated successfully.",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error in step3:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
