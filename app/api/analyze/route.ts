// app/api/analyze/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: API_KEY,
});

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}

export async function POST(request: Request) {
  try {
    const { screenshotBase64 } = await request.json();

    // Validate screenshot
    if (!screenshotBase64) {
      return new NextResponse("Screenshot is required", { status: 400 });
    }

    // Prepare the prompt
    const instruction = `
      You are a web design expert specializing in usability and user experience designed to output JSON. Your goal is to use Nielsen's 10 heuristics to analyse websites. For the provided webpage screenshot, perform the following tasks:

      1. Evaluate the webpage based on Nielsen's 10 heuristics.
      2. For each heuristic, provide:
        - A score from 1 to 5 (1 being poor, 5 being excellent).
        - Specific suggestions for improvement, if any.
      For each heuristic, be specific on what the webpage does well and what can be improved.

      The JSON output should follow this format:
      {
        "heuristics": [
          {
            "name": "Visibility of system status",
            "score": 4,
            "suggestions": "Provide real-time feedback on user actions. For example, show a loading spinner when submitting a form."
          },
          // ... include all 10 heuristics
        ]
      }

      Ensure that the output is valid JSON and follows the specified format exactly.
    `;

    // Construct the user content

    // Send the request to OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: instruction,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze the following webpage",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 16384,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });

    const aiContent = response.choices[0].message?.content;

    return new NextResponse(JSON.stringify(aiContent), {
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
