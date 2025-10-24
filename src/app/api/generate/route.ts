// ✅ /app/api/google/generate/route.ts
import { callGemini } from "@/lib/callGoogleModel.server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const output = await callGemini(prompt);

    return NextResponse.json({ output });
  } catch (err: any) {
    console.error("❌ /api/google/generate error:", err);
    return NextResponse.json(
      { error: "Internal server error", message: String(err) },
      { status: 500 }
    );
  }
}
