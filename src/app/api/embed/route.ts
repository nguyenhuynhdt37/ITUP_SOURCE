import { normalizeEmbedding } from "@/lib/promptGemini";
import { NextResponse } from "next/server";

const EMBED_MODEL = "gemini-embedding-001";
const EMBED_DIM = 3072;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const cleanText = text.trim().replace(/\s+/g, " ").slice(0, 9000);
    console.log("📡 Creating embedding via Gemini:", EMBED_MODEL);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text: cleanText }] },
        }),
      }
    );

    const raw = await response.text();
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON response from Google API", raw },
        { status: 502 }
      );
    }

    if (!response.ok || data?.error) {
      return NextResponse.json(
        {
          error: data?.error?.message || "Google API request failed",
          status: response.status,
          raw,
        },
        { status: 502 }
      );
    }

    const embedding = data?.embedding?.values;
    if (!Array.isArray(embedding) || embedding.length !== EMBED_DIM) {
      return NextResponse.json(
        {
          error: "Invalid embedding format or dimension mismatch",
          expected: EMBED_DIM,
          received: Array.isArray(embedding)
            ? embedding.length
            : typeof embedding,
        },
        { status: 500 }
      );
    }

    const normalized = normalizeEmbedding(embedding);
    return NextResponse.json({
      model: EMBED_MODEL,
      dimension: normalized.length,
      embedding: normalized,
    });
  } catch (error) {
    console.error("❌ Embedding error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: String(error) },
      { status: 500 }
    );
  }
}
