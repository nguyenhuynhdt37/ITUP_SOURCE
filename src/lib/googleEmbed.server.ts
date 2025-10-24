// src/lib/googleEmbed.server.ts

const EMBED_MODEL = "gemini-embedding-001";
const EMBED_DIM = 3072;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

export async function createEmbeddingServer(text: string): Promise<number[]> {
  if (!text?.trim()) throw new Error("Text is required");

  // 🔹 Làm sạch & cắt ngắn text
  const cleanText = text.trim().replace(/\s+/g, " ");
  const chunks = splitIntoChunks(cleanText, 7000); // chia nhỏ để an toàn
  const vectors: number[][] = [];

  for (const chunk of chunks) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text: chunk }] },
        }),
      }
    );

    const raw = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("⚠️ Invalid JSON from Google:", raw.slice(0, 200));
      throw new Error("Invalid JSON response from Google API");
    }

    if (!response.ok || data?.error) {
      console.error("❌ Google API error:", data?.error || raw);
      throw new Error(data?.error?.message || "Google API request failed");
    }

    const embedding = data?.embedding?.values;
    if (!Array.isArray(embedding) || embedding.length !== EMBED_DIM) {
      throw new Error(
        `Invalid embedding dimension (${embedding?.length ?? "undefined"})`
      );
    }

    vectors.push(normalizeEmbedding(embedding));
  }

  // 🔹 Nếu có nhiều chunk → trung bình vector lại
  if (vectors.length > 1) {
    const merged = new Array(EMBED_DIM).fill(0);
    for (const v of vectors)
      for (let i = 0; i < EMBED_DIM; i++) merged[i] += v[i];
    return normalizeEmbedding(merged.map((x) => x / vectors.length));
  }

  return vectors[0];
}

export function normalizeEmbedding(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return norm === 0 ? vec : vec.map((v) => v / norm);
}

// 👇 helper chia text dài
function splitIntoChunks(text: string, maxLen = 7000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxLen) {
    chunks.push(text.slice(i, i + maxLen));
  }
  return chunks;
}
