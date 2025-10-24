export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Thiếu file PDF" }, { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());

    // 🧠 Gọi engine WASM của unpdf
    const result = await extractText(buffer, { mergePages: true });

    // Nếu engine không trả JSON hợp lệ
    if (!result || typeof result.text !== "string") {
      return NextResponse.json(
        { error: "Không thể trích xuất nội dung PDF (unpdf lỗi nội bộ)." },
        { status: 500 }
      );
    }

    const cleanText = result.text
      .normalize("NFC")
      .replace(/\u0000/g, "")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanText || cleanText.length < 10) {
      return NextResponse.json({
        text: "",
        note: "📄 PDF có thể là ảnh scan, không có text layer để trích xuất.",
      });
    }

    return NextResponse.json({
      pages: result.totalPages ?? null,
      text: cleanText,
    });
  } catch (err: any) {
    // ✅ Kiểm soát mọi lỗi, tránh throw text ra ngoài
    const msg =
      err?.message?.startsWith("Internal Server Error") ||
      err?.message?.includes("Unexpected token")
        ? "Engine unpdf gặp lỗi nội bộ khi đọc file (thường do PDF nặng hoặc lỗi cấu trúc)."
        : err?.message;

    console.error("❌ PDF extraction error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
