/**
 * Google AI Utilities – no token limit version
 */
const EMBED_DIM = 3072;

// Tự động lấy URL từ browser hoặc server
const getAPIBase = () => {
  // Trên client side (browser)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Trên server side
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback cho development
  return "http://localhost:3000";
};

/** 🧠 Tạo embedding từ văn bản */
export async function createEmbedding(text: string): Promise<number[]> {
  if (!text?.trim())
    throw new Error("❌ Văn bản trống, không thể tạo embedding");

  try {
    const baseUrl = getAPIBase();
    const url = `${baseUrl.replace(/\/$/, "")}/api/embed`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!res.ok) {
      const raw = await res.text();
      throw new Error(`Embedding API lỗi ${res.status}: ${raw}`);
    }

    const data = await res.json();
    const embedding = data?.embedding;

    if (!Array.isArray(embedding) || embedding.length !== EMBED_DIM) {
      throw new Error(
        `Embedding không hợp lệ (nhận ${
          embedding?.length || 0
        }, cần ${EMBED_DIM})`
      );
    }

    return embedding;
  } catch (e) {
    console.error("💥 Lỗi khi tạo embedding:", e);
    throw e;
  }
}

/** 🤖 Gọi model Google AI */
export async function callGoogleModel(prompt: string): Promise<string> {
  if (!prompt?.trim()) return "";
  try {
    const baseUrl = getAPIBase();
    const url = `${baseUrl.replace(/\/$/, "")}/api/generate`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt.trim(), temperature: 0.7 }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return (
      data?.output?.trim?.() ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() ||
      data?.text?.trim?.() ||
      data?.content?.trim?.() ||
      ""
    );
  } catch (e) {
    console.error("💥 Model:", e);
    return "Xin lỗi, không thể tạo nội dung lúc này. Vui lòng thử lại sau.";
  }
}

/** 🧹 Clean HTML output */
const cleanHTML = (html: string) => {
  if (!html?.trim()) return "";
  let h = html.replace(/^```(html)?|```$/gm, "").trim();
  h = h
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
  h = h.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>");
  return h.startsWith("<p>") || h.startsWith("<h") ? h : `<p>${h}</p>`;
};

/** 🖼️ Preserve media */
const preserveMedia = (c: string) => {
  if (!c?.trim()) return "";
  const imgs = Array.from(c.matchAll(/<img[^>]+src="([^"]+)"/g)).map(
    (m) => m[1]
  );
  const links = Array.from(
    c.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g)
  ).map((m) => `${m[2]} -> ${m[1]}`);
  return (
    c +
    (imgs.length ? `\n\n[IMAGES: ${imgs.join(", ")}]` : "") +
    (links.length ? `\n\n[LINKS: ${links.join(", ")}]` : "")
  );
};

/** 📝 Tóm tắt */
export const generateSummary = async (content: string) =>
  await callGoogleModel(
    `Tóm tắt (2-3 câu, tiếng Việt, trả về plain text):\n${content}`
  );

/** 🏷️ Tags */
export const generateTags = async (content: string) =>
  (
    await callGoogleModel(
      `Tạo 3-5 tags (mỗi dòng 1 tag, tiếng Việt):\n${content}`
    )
  )
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);

/** ✨ Viết lại nội dung hấp dẫn hơn */
export const generateImprovedContent = async (content: string) => {
  const prompt = `Viết lại nội dung sự kiện hay hơn (HTML thuần, giữ nguyên link & ảnh), chỉ trả về nội dung ko bao gồm tag html, ... chỉ trả về thẻ thuần, link ảnh giữ nguyên ko thay đổi:
${preserveMedia(content)}
Trả về HTML hoàn chỉnh:`;
  return cleanHTML(await callGoogleModel(prompt));
};

/** 📰 Tiêu đề gợi ý */
export const generateTitleSuggestions = async (content: string) =>
  (
    await callGoogleModel(
      `Tạo 3 tiêu đề (mỗi dòng 1 tiêu đề, tiếng Việt, 10-50 ký tự):\n${content}`
    )
  )
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);

/** 💡 Viết bài từ ý tưởng */
export async function generateArticleFromIdea(
  idea: string,
  type: "event" | "news" = "event"
) {
  const prompt = `Viết bài ${
    type === "event" ? "sự kiện" : "tin tức"
  } hoàn chỉnh dựa trên ý tưởng: "${idea}"
HTML chuẩn (<h1>, <h2>, <p>...), giữ nguyên cấu trúc, không markdown.`;
  const res = await callGoogleModel(prompt);
  return res?.trim()
    ? cleanHTML(res)
    : `<h1>Bài viết về: ${idea}</h1><p>Không thể tạo nội dung lúc này.</p>`;
}

/** 🎯 Ý tưởng bài viết */
export async function generateArticleIdeas(topic: string, count = 5) {
  const res = await callGoogleModel(
    `Tạo ${count} ý tưởng bài viết về "${topic}" (mỗi dòng 1 ý tưởng, 10–30 từ):`
  );
  return res
    .split("\n")
    .map((i) => i.trim())
    .filter(Boolean)
    .slice(0, count);
}

/** 🔗 Embedding cho content */
export const embedContent = (c: string) => createEmbedding(c);

export function normalizeEmbedding(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return norm === 0 ? vec : vec.map((v) => v / norm);
}
