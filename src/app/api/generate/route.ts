// app/api/google/generate/route.ts
import { NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const MODEL = "gemini-2.5-flash";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt.trim() }] }],
          generationConfig: { temperature: 0.7, topP: 0.95, topK: 40 },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to generate text" },
        { status: res.status }
      );
    }

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    return NextResponse.json({ output });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error", message: String(err) },
      { status: 500 }
    );
  }
}
