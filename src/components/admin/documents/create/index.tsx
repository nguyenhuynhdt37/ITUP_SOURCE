"use client";

import { extractTextFromPDF } from "@/lib/extractTextFromPDF";
import { supabase } from "@/lib/supabaseClient";
import { encode } from "gpt-tokenizer"; // ✅ npm install gpt-tokenizer
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaFileAlt,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaSpinner,
  FaUpload,
} from "react-icons/fa";

const fileTypeIcons = {
  pdf: FaFilePdf,
  doc: FaFileWord,
  docx: FaFileWord,
  xls: FaFileExcel,
  xlsx: FaFileExcel,
  jpg: FaFileImage,
  jpeg: FaFileImage,
  png: FaFileImage,
  gif: FaFileImage,
  default: FaFileAlt,
};

const categories = ["Công Văn", "Hợp đồng", "Giấy phép", "Tài liệu", "Khác"];

export const CreateDocument = () => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [chunkingProgress, setChunkingProgress] = useState(0);
  const [aiGenerating, setAiGenerating] = useState({
    title: false,
    description: false,
  });
  const [extractedText, setExtractedText] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    file: null as File | null,
    is_public: false,
    enableChunking: true,
    chunkSize: 800,
    chunkOverlap: 100,
  });

  /** ========== HANDLE FILE SELECTION ========== */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError("File quá lớn (max 100MB).");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Định dạng file không hỗ trợ.");
      return;
    }

    setFormData({ ...formData, file });
    setError("");

    try {
      const text = await extractPDFText(file);
      setExtractedText(text);
    } catch (err) {
      console.error("Error extracting text:", err);
      setExtractedText("");
    }
  };

  /** ========== UPLOAD FILE TO SUPABASE ========== */
  const uploadFile = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { data, error } = await supabase.storage
      .from("clb-assets")
      .upload(filePath, file);
    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("clb-assets")
      .getPublicUrl(filePath);
    return {
      file_url: urlData.publicUrl,
      file_type: fileExt,
      file_size: file.size,
    };
  };

  /** ========== RESOURCE EMBEDDING HELPERS (split -> embed -> sum) ========== */
  // Split text into chunks with a max byte size (defaults to 25KB)
  const splitText = (text: string, maxBytes = 25000): string[] => {
    const encoder = new TextEncoder();
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start;
      let currentBytes = 0;

      // grow the window until reaching byte limit
      while (end < text.length) {
        const char = text[end];
        const byteLen = encoder.encode(char).length;
        if (currentBytes + byteLen > maxBytes) break;
        currentBytes += byteLen;
        end++;
      }

      if (end === start) {
        // safeguard to avoid infinite loop with very large multi-byte chars
        end = Math.min(start + 1, text.length);
      }

      // try to cut nicely at whitespace/newline within the slice
      let cut = end;
      const slice = text.slice(start, end);
      const lastNewline = slice.lastIndexOf("\n");
      const lastSpace = slice.lastIndexOf(" ");
      const lastBreak = Math.max(lastNewline, lastSpace);
      if (lastBreak >= 0 && lastBreak > slice.length * 0.6) {
        cut = start + lastBreak;
      }

      const chunk = text.slice(start, cut).trim();
      if (chunk) chunks.push(chunk);

      start = cut;
      // skip trailing whitespace at the cut
      while (
        start < text.length &&
        (text[start] === " " || text[start] === "\n")
      )
        start++;
    }

    return chunks;
  };

  const createEmbedding = async (text: string): Promise<number[]> => {
    return await createEmbedding(text);
  };

  const sumVectors = (vectors: number[][]): number[] => {
    if (!vectors.length) return [];
    const dim = vectors[0]?.length || 0;
    const out = new Array(dim).fill(0);
    for (const v of vectors) {
      if (!v || v.length !== dim) continue;
      for (let i = 0; i < dim; i++) out[i] += v[i];
    }
    return out;
  };

  const buildResourceEmbedding = async (
    text: string
  ): Promise<number[] | null> => {
    const cleaned = text?.trim() || "";
    if (!cleaned) return null;

    // 25KB per chunk as requested
    const chunks = splitText(cleaned, 25000);
    const vectors: number[][] = [];
    for (const chunk of chunks) {
      try {
        const emb = await createEmbedding(chunk);
        vectors.push(emb);
      } catch (e) {
        console.error("Chunk embedding failed, skipping chunk:", e);
      }
    }
    if (!vectors.length) return null;
    // Sum vectors as per requirement
    return sumVectors(vectors);
  };

  /** ========== SUBMIT FORM ========== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) return setError("Vui lòng chọn file.");
    if (!formData.title.trim()) return setError("Vui lòng nhập tiêu đề.");
    try {
      setError("");
      setSuccess("");
      setUploading(true);
      setUploadProgress(0);
      setChunkingProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? 90 : p + 10));
      }, 200);

      const fileData = await uploadFile(formData.file);

      clearInterval(interval);
      setUploadProgress(100);

      // Build resource-level embedding by splitting into 25KB chunks and summing vectors
      const resourceEmbeddingValue = await buildResourceEmbedding(
        extractedText.trim()
      );
      // ✅ Insert vào bảng resources
      const { data, error } = await supabase
        .from("resources")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category || null,
          embedding: resourceEmbeddingValue,
          file_url: fileData.file_url,
          file_type: fileData.file_type,
          file_size: fileData.file_size,
          is_public: formData.is_public,
          uploader_name: "Admin", // TODO: replace with session user
        } as any)
        .select();

      if (error) throw error;
      const resourceId = (data?.[0] as any)?.id;

      // ✅ Nếu bật chunking → xử lý text embedding
      if (formData.enableChunking && resourceId) {
        try {
          console.log("🚀 Starting chunking process...");
          await processFileChunks(
            resourceId,
            formData.file,
            formData.chunkSize,
            formData.chunkOverlap
          );
          console.log("✅ Chunking process completed successfully");
        } catch (chunkError) {
          console.error("❌ Chunking process failed:", chunkError);
          setError(
            `Lỗi khi xử lý chunks: ${
              chunkError instanceof Error ? chunkError.message : "Unknown error"
            }`
          );
          return; // Stop the process if chunking fails
        }
      }

      setSuccess("Tài liệu đã được upload thành công!");
      setTimeout(() => router.push("/admin/documents"), 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Lỗi khi upload tài liệu. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setChunkingProgress(0);
    }
  };
  console.log("extractedText", extractedText);

  /** ========== CHUNK + EMBEDDING LOGIC ========== */
  /** ========== CHUNK + EMBEDDING LOGIC (fixed non-duplicate) ========== */
  const processFileChunks = async (
    resourceId: string,
    file: File,
    chunkSize: number,
    chunkOverlap: number
  ) => {
    try {
      console.log("🧩 Chunking file:", file.name);

      // 1️⃣ Trích text từ file
      const text = await extractTextFromPDF(file);

      if (!text || text.length < 20) {
        console.warn("⚠️ Không có nội dung để chunk.");
        return;
      }

      // Validate text content
      if (
        text.includes("Không thể đọc nội dung") ||
        text.includes("Failed to extract")
      ) {
        console.error("❌ Text extraction failed");
        throw new Error(
          "Không thể đọc nội dung file. Vui lòng kiểm tra định dạng file."
        );
      }

      // 2️⃣ Tokenize
      const tokens = encode(text);
      const totalTokens = tokens.length;
      console.log(`📊 Tổng tokens: ${totalTokens}`);
      console.log(`📊 Tokens preview: [${tokens.slice(0, 10).join(", ")}...]`);

      // 3️⃣ Giới hạn an toàn
      const maxTokens = 50000;
      const usedTokens = tokens.slice(0, maxTokens);

      // 4️⃣ Giới hạn overlap an toàn
      const safeOverlap = Math.max(0, Math.min(chunkOverlap, chunkSize - 1));

      // 5️⃣ Chia chunks không bị lặp
      const chunks: { text: string; tokenCount: number }[] = [];
      console.log(
        `🔧 Chunking parameters: size=${chunkSize}, overlap=${safeOverlap}, step=${
          chunkSize - safeOverlap
        }`
      );

      for (
        let start = 0;
        start < usedTokens.length;
        start += chunkSize - safeOverlap
      ) {
        const end = Math.min(start + chunkSize, usedTokens.length);
        const chunkTokens = usedTokens.slice(start, end);
        const chunkText = decodeTokens(chunkTokens);

        console.log(
          `📝 Chunk ${chunks.length + 1}: start=${start}, end=${end}, tokens=${
            chunkTokens.length
          }, text_length=${chunkText.length}`
        );

        // Loại bỏ trùng lặp text với chunk trước
        if (chunks.length > 0 && chunkText === chunks[chunks.length - 1].text) {
          console.warn(`⚠️ Bỏ qua chunk trùng lặp tại index ${chunks.length}`);
          continue;
        }

        chunks.push({ text: chunkText.trim(), tokenCount: chunkTokens.length });

        if (chunks.length >= 200) {
          console.warn("⚠️ Giới hạn tối đa 200 chunks để tránh timeout.");
          break;
        }
      }

      console.log(`🧠 Tổng số chunk thực tế: ${chunks.length}`);

      // 6️⃣ Lưu từng chunk kèm embedding
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        const res = await fetch("/api/embed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: c.text }),
        });

        if (!res.ok) throw new Error(`Embedding API lỗi (${res.status})`);
        const data = await res.json();

        const embedding = data.embedding;
        if (!embedding || !Array.isArray(embedding)) {
          console.warn(`⚠️ Chunk ${i + 1} không có embedding hợp lệ, bỏ qua.`);
          continue;
        }

        const { error: insertError } = await supabase
          .from("resource_chunks")
          .insert({
            resource_id: resourceId,
            chunk_index: i,
            content: c.text,
            embedding,
            chunk_size: chunkSize,
            overlap: safeOverlap,
          } as any);

        if (insertError) {
          console.error(`❌ Lỗi insert chunk ${i + 1}:`, insertError);
        } else {
          console.log(`✅ Chunk ${i + 1}/${chunks.length} inserted`);
        }

        setChunkingProgress(Math.round(((i + 1) / chunks.length) * 100));
      }

      console.log("🎯 Hoàn tất chunking và embedding!");
    } catch (err) {
      console.error("💥 Lỗi chunking:", err);
    }
  };
  /** Helper: decode token[] -> string */
  const decodeTokens = (tokens: number[]) => {
    try {
      // Use gpt-tokenizer decode function
      const { decode } = require("gpt-tokenizer");
      return decode(tokens);
    } catch (error) {
      console.error("Error decoding tokens:", error);
      // Fallback: convert tokens back to text manually
      return tokens.map((token) => String.fromCharCode(token)).join("");
    }
  };

  /** ========== PDF TEXT EXTRACTION ========== */
  const extractPDFText = async (file: File): Promise<string> => {
    if (file.type === "application/pdf") {
      try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/pdf-extract", {
          method: "POST",
          body: form,
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);
        return data.text || data.note || "";
      } catch (err) {
        console.error("PDF extract error:", err);
        return "Không thể đọc nội dung PDF.";
      }
    } else {
      try {
        return await file.text();
      } catch {
        return "Không thể đọc nội dung file.";
      }
    }
  };

  /** ========== AI GENERATION (TITLE & DESCRIPTION) ========== */
  const generateTitle = async () => {
    if (!extractedText) return setError("Vui lòng chọn file trước.");
    try {
      setAiGenerating((p) => ({ ...p, title: true }));
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Tạo tiêu đề ngắn gọn chỉ có chữ không có bất ký ký tự nào khác (≤100 ký tự) cho tài liệu sau:\n${extractedText}`,
        }),
      });
      const data = await res.json();
      if (data.output) {
        setFormData((p) => ({ ...p, title: data.output }));
        setSuccess("AI đã tạo tiêu đề thành công!");
      } else {
        setError("AI không thể tạo tiêu đề. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating((p) => ({ ...p, title: false }));
    }
  };

  const generateDescription = async () => {
    if (!extractedText) return setError("Vui lòng chọn file trước.");
    try {
      setAiGenerating((p) => ({ ...p, description: true }));
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Tạo mô tả ngắn gọn (≤200 ký tự) cho tài liệu sau:\n${extractedText}`,
        }),
      });
      const data = await res.json();
      if (data.output) {
        setFormData((p) => ({ ...p, description: data.output }));
        setSuccess("AI đã tạo mô tả thành công!");
      } else {
        setError("AI không thể tạo mô tả. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating((p) => ({ ...p, description: false }));
    }
  };

  const generateAllAI = async () => {
    if (!extractedText) return setError("Vui lòng chọn file trước.");
    try {
      setError("");
      await Promise.all([generateTitle(), generateDescription()]);
      setSuccess("AI đã tạo tiêu đề và mô tả thành công!");
    } catch (err) {
      console.error("Error generating AI content:", err);
      setError("Lỗi khi tạo nội dung AI. Vui lòng thử lại.");
    }
  };

  /** ========== UI ========== */
  const getFileTypeIcon = (ext: string | null) =>
    (ext && fileTypeIcons[ext as keyof typeof fileTypeIcons]) ||
    fileTypeIcons.default;

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-bold text-white">Tạo Tài liệu Mới</h1>
          </div>
          <p className="text-gray-300">Upload tài liệu mới cho câu lạc bộ</p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1a1a4d]/90 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-300 text-sm font-medium">
                    Tiêu đề *
                  </label>
                  <button
                    type="button"
                    onClick={generateTitle}
                    disabled={!extractedText || aiGenerating.title}
                    className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {aiGenerating.title ? (
                      <>
                        <FaSpinner className="w-3 h-3 animate-spin" />
                        AI...
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        AI Tạo
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  placeholder="Nhập tiêu đề tài liệu"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-300 text-sm font-medium">
                    Mô tả
                  </label>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={!extractedText || aiGenerating.description}
                    className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {aiGenerating.description ? (
                      <>
                        <FaSpinner className="w-3 h-3 animate-spin" />
                        AI...
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        AI Tạo
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  placeholder="Mô tả về tài liệu"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Danh mục
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Generate All Button */}
              {extractedText && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">
                        🤖 AI Assistant
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Tự động tạo tiêu đề và mô tả từ nội dung file
                      </p>
                      {formData.file?.type === "application/pdf" && (
                        <p className="text-green-400 text-xs mt-1">
                          ✅ PDF text extraction sử dụng unpdf (2025 method -
                          Turbopack compatible)
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={generateAllAI}
                      disabled={aiGenerating.title || aiGenerating.description}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {aiGenerating.title || aiGenerating.description ? (
                        <>
                          <FaSpinner className="w-4 h-4 animate-spin" />
                          AI đang tạo...
                        </>
                      ) : (
                        <>
                          <span>🚀</span>
                          Tạo tất cả với AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  File *
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#3b82f6]/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {formData.file ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-lg flex items-center justify-center">
                          {(() => {
                            const FileIcon = getFileTypeIcon(
                              formData.file.name.split(".").pop() || ""
                            );
                            return <FileIcon className="w-5 h-5 text-white" />;
                          })()}
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium">
                            {formData.file.name}
                          </p>
                          <div className="space-y-1">
                            <p className="text-gray-400 text-sm">
                              {formatFileSize(formData.file.size)} / 100MB
                            </p>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] h-1.5 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    (formData.file.size / (100 * 1024 * 1024)) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FaUpload className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-300">
                          Chọn file để upload
                        </span>
                        <span className="text-gray-500 text-sm">
                          PDF, DOC, XLS, JPG, PNG (Max 100MB)
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) =>
                    setFormData({ ...formData, is_public: e.target.checked })
                  }
                  className="w-4 h-4 text-[#3b82f6] bg-white/10 border-white/20 rounded focus:ring-[#3b82f6]"
                />
                <label htmlFor="is_public" className="text-gray-300">
                  Công khai tài liệu
                </label>
              </div>

              {/* Chunking Settings */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="enableChunking"
                    checked={formData.enableChunking}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enableChunking: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#3b82f6] bg-white/10 border-white/20 rounded focus:ring-[#3b82f6]"
                  />
                  <label
                    htmlFor="enableChunking"
                    className="text-white font-medium"
                  >
                    Bật tính năng Chunking (RAG)
                  </label>
                </div>

                {formData.enableChunking && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Kích thước chunk (tokens): {formData.chunkSize}
                      </label>
                      <div className="relative">
                        <input
                          type="range"
                          value={formData.chunkSize}
                          onChange={(e) => {
                            const newChunkSize = parseInt(e.target.value);
                            setFormData({
                              ...formData,
                              chunkSize: newChunkSize,
                              // Auto-adjust overlap if it's too large
                              chunkOverlap: Math.min(
                                formData.chunkOverlap,
                                newChunkSize - 1
                              ),
                            });
                          }}
                          min="100"
                          max="4000"
                          step="50"
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #1e3a8a 0%, #3b82f6 ${
                              ((formData.chunkSize - 100) / (4000 - 100)) * 100
                            }%, #374151 ${
                              ((formData.chunkSize - 100) / (4000 - 100)) * 100
                            }%, #374151 100%)`,
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>100</span>
                          <span className="text-[#3b82f6] font-medium">
                            {formData.chunkSize}
                          </span>
                          <span>4000</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Số lượng token tối đa trong mỗi chunk (100-4000)
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Chunk overlap (tokens): {formData.chunkOverlap}
                      </label>
                      <div className="relative">
                        <input
                          type="range"
                          value={formData.chunkOverlap}
                          onChange={(e) => {
                            const newOverlap = parseInt(e.target.value);
                            const maxOverlap = Math.max(
                              0,
                              formData.chunkSize - 1
                            );
                            setFormData({
                              ...formData,
                              chunkOverlap: Math.min(
                                Math.max(0, newOverlap),
                                maxOverlap
                              ),
                            });
                          }}
                          min="0"
                          max={Math.max(0, formData.chunkSize - 1)}
                          step={Math.max(
                            1,
                            Math.floor((formData.chunkSize - 1) / 20)
                          )}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #1e3a8a 0%, #3b82f6 ${
                              ((formData.chunkOverlap - 0) /
                                (Math.max(0, formData.chunkSize - 1) - 0)) *
                              100
                            }%, #374151 ${
                              ((formData.chunkOverlap - 0) /
                                (Math.max(0, formData.chunkSize - 1) - 0)) *
                              100
                            }%, #374151 100%)`,
                          }}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>0</span>
                          <span className="text-[#3b82f6] font-medium">
                            {formData.chunkOverlap}
                          </span>
                          <span>{Math.max(0, formData.chunkSize - 1)}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Số lượng token chồng lấp giữa các chunk (0-
                        {formData.chunkSize - 1})
                      </p>
                      {formData.chunkOverlap >= formData.chunkSize - 1 && (
                        <p className="text-yellow-400 text-xs mt-1">
                          ⚠️ Overlap quá lớn có thể gây lỗi vòng lặp vô hạn
                        </p>
                      )}
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-400 text-xs">ℹ</span>
                        </div>
                        <div>
                          <p className="text-blue-300 text-sm font-medium mb-1">
                            Chunking cho RAG
                          </p>
                          <p className="text-blue-200 text-sm mb-2">
                            Tính năng này sẽ chia nhỏ tài liệu thành các đoạn
                            nhỏ để tối ưu hóa việc tìm kiếm và trích xuất thông
                            tin bằng AI.
                          </p>
                          <div className="bg-blue-600/20 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-blue-300 font-medium">
                                  Chunk Size:
                                </span>
                                <span className="text-blue-100 ml-1">
                                  {formData.chunkSize} tokens
                                </span>
                              </div>
                              <div>
                                <span className="text-blue-300 font-medium">
                                  Overlap:
                                </span>
                                <span className="text-blue-100 ml-1">
                                  {formData.chunkOverlap} tokens
                                </span>
                              </div>
                            </div>
                            <p className="text-blue-200 text-xs mt-2">
                              Các thông số này sẽ được lưu cùng với mỗi chunk để
                              tối ưu hóa việc tìm kiếm.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Đang upload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Chunking Progress */}
              {chunkingProgress > 0 && chunkingProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Đang xử lý chunks và tạo embeddings...</span>
                    <span>{chunkingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${chunkingProgress}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs">
                    Đang chia nhỏ tài liệu và tạo embeddings để tối ưu hóa tìm
                    kiếm...
                  </p>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200">
                  {success}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading || !formData.file}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Đang upload...
                    </>
                  ) : (
                    <>
                      <FaCheck className="w-4 h-4" />
                      Tạo tài liệu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
