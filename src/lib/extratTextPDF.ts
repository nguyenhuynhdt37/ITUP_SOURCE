"use client";

import * as pdfjsLib from "pdfjs-dist/webpack";

/**
 * 📄 Trích xuất text tiếng Việt từ file PDF (chạy ở client)
 * - Nhận trực tiếp File từ input
 * - Tự ghép chữ bị tách rời (do PDF spacing)
 * - Giữ dấu tiếng Việt chuẩn NFC
 */
export async function extractTextFromPDFClient(file: File): Promise<string> {
  // Đọc file PDF và sao chép buffer để tránh lỗi “ArrayBuffer detached”
  const arrayBuffer = await file.arrayBuffer();
  const bufferCopy = arrayBuffer.slice(0);

  // Khởi tạo document PDF.js
  const pdf = await pdfjsLib.getDocument({ data: bufferCopy }).promise;
  let fullText = "";

  // Duyệt từng trang để trích text
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Xử lý spacing: ghép chữ cái liền kề nhau
    let lastX = 0;
    let lastY = 0;
    let pageText = "";

    for (const item of textContent.items as any[]) {
      const str = item.str ?? "";
      const transform = item.transform;
      const x = transform[4];
      const y = transform[5];
      const distance = Math.abs(x - lastX);
      const lineChange = Math.abs(y - lastY) > 10;

      if (lineChange) pageText += "\n";
      else if (distance > 4) pageText += " ";

      pageText += str;
      lastX = x;
      lastY = y;
    }

    fullText += pageText + "\n\n";
  }

  // // Chuẩn hóa tiếng Việt + lọc ký tự lạ
  // const cleanText = fullText
  //   .normalize("NFC")
  //   .replace(/(\p{L})\s+(\p{L})/gu, "$1$2") // gộp ký tự tách bởi khoảng trắng ảo
  //   .replace(/[^\wÀ-ỹ\s.,?!:;()\-–—]/g, " ") // loại ký tự rác
  //   .replace(/\s{2,}/g, " ") // bỏ khoảng trắng thừa
  //   .replace(/\n{2,}/g, "\n\n") // giữ đoạn hợp lý
  //   .trim();

  return fullText;
}
