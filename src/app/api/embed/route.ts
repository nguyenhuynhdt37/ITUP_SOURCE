// src/app/api/embed/route.ts
import { createEmbeddingServer } from "@/lib/googleEmbed.server";
import { NextResponse } from "next/server";

const EMBED_MODEL = "gemini-embedding-001";
const EMBED_DIM = 3072;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const embedding = await createEmbeddingServer(text);

    return NextResponse.json({
      model: EMBED_MODEL,
      dimension: embedding.length,
      embedding,
    });
  } catch (error: any) {
    console.error("❌ Embedding error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
