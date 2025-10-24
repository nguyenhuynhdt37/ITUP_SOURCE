// ✅ /src/lib/googleModel.ts
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const MODEL = "gemini-2.5-flash";

if (!GOOGLE_API_KEY) {
  console.warn("⚠️ GOOGLE_API_KEY chưa được thiết lập trong .env.local");
}

/**
 * Gọi trực tiếp Google Gemini model, trả về text đã được trim.
 */
export async function callGemini(prompt: string): Promise<string> {
  if (!prompt?.trim()) return "";

  try {
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
      throw new Error(data?.error?.message || "Gemini API error");
    }

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() ||
      data?.output?.trim?.() ||
      ""
    );
  } catch (err: any) {
    console.error("💥 Gemini API error:", err);
    return "Xin lỗi, không thể tạo nội dung lúc này. Vui lòng thử lại sau.";
  }
}
