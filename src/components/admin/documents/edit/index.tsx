"use client";

import { extractTextFromPDF } from "@/lib/extractTextFromPDF";
import { supabase } from "@/lib/supabaseClient";
import { encode } from "gpt-tokenizer";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaEdit,
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

interface DocumentData {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  file_type: string;
  file_size: number;
  is_public: boolean;
  uploader_name: string;
  created_at: string;
  updated_at: string;
}

interface EditDocumentProps {
  documentId: string;
}

export const EditDocument = ({ documentId }: EditDocumentProps) => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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
  const [originalDocument, setOriginalDocument] = useState<DocumentData | null>(
    null
  );
  const [hasFileChanged, setHasFileChanged] = useState(false);
  const [hasChunkSettingsChanged, setHasChunkSettingsChanged] = useState(false);

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

  const [originalChunkSettings, setOriginalChunkSettings] = useState({
    enableChunking: true,
    chunkSize: 800,
    chunkOverlap: 100,
  });

  // Calculate change percentages for UI display
  const getChangePercentages = () => {
    const chunkSizeChangePercent =
      Math.abs(
        (formData.chunkSize - originalChunkSettings.chunkSize) /
          originalChunkSettings.chunkSize
      ) * 100;

    const overlapChangePercent =
      Math.abs(
        (formData.chunkOverlap - originalChunkSettings.chunkOverlap) /
          Math.max(originalChunkSettings.chunkOverlap, 1)
      ) * 100;

    return {
      chunkSize: chunkSizeChangePercent,
      overlap: overlapChangePercent,
    };
  };

  // Get change type description for UI
  const getChangeTypeDescription = () => {
    if (hasFileChanged) {
      return {
        type: "file_change",
        description: "File mới",
        action: "Sẽ tạo lại chunks hoàn toàn",
        icon: "📄",
        color: "text-yellow-300",
      };
    } else if (hasChunkSettingsChanged) {
      return {
        type: "significant_change",
        description: "Thay đổi đáng kể",
        action: "Sẽ tính lại chunks",
        icon: "⚙️",
        color: "text-orange-300",
      };
    } else {
      return {
        type: "minor_change",
        description: "Thay đổi nhỏ",
        action: "Chỉ cập nhật metadata",
        icon: "📝",
        color: "text-green-300",
      };
    }
  };

  /** ========== LOAD DOCUMENT DATA ========== */
  useEffect(() => {
    if (!documentId) {
      setError("Không tìm thấy ID tài liệu.");
      setLoading(false);
      return;
    }

    const loadDocument = async () => {
      try {
        const { data, error } = await supabase
          .from("resources")
          .select("*")
          .eq("id", documentId)
          .single();

        if (error) {
          throw error;
        }

        setOriginalDocument(data as DocumentData);
        setFormData({
          title: (data as any).title || "",
          description: (data as any).description || "",
          category: (data as any).category || "",
          file: null,
          is_public: (data as any).is_public || false,
          enableChunking: true, // Default to true for editing
          chunkSize: 800,
          chunkOverlap: 100,
        });

        // Load existing chunk settings if available
        const { data: chunksData } = await supabase
          .from("resource_chunks")
          .select("chunk_size, overlap")
          .eq("resource_id", documentId)
          .limit(1)
          .single();

        if (chunksData) {
          setFormData((prev) => ({
            ...prev,
            chunkSize: (chunksData as any).chunk_size || 800,
            chunkOverlap: (chunksData as any).overlap || 100,
          }));
          setOriginalChunkSettings({
            enableChunking: true,
            chunkSize: (chunksData as any).chunk_size || 800,
            chunkOverlap: (chunksData as any).overlap || 100,
          });
        }

        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin tài liệu.");
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId]);

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
    setHasFileChanged(true);
    setError("");

    // Extract text ngay khi chọn file để có thể dùng cho AI generation
    try {
      const text = await extractTextFromPDF(file);
      setExtractedText(text);
    } catch (err) {
      console.error("Error extracting text:", err);
      setExtractedText("");
    }
  };

  useEffect(() => {
    const {
      enableChunking: oldEnable,
      chunkSize: oldSize,
      chunkOverlap: oldOverlap,
    } = originalChunkSettings || {};

    const newEnable = !!formData.enableChunking;
    const newSize = Number(formData.chunkSize);
    const newOverlap = Number(formData.chunkOverlap);

    // ====== Guard cơ bản ======
    if (
      !Number.isFinite(newSize) ||
      !Number.isFinite(newOverlap) ||
      !Number.isFinite(oldSize) ||
      !Number.isFinite(oldOverlap)
    ) {
      setHasChunkSettingsChanged(false);
      return;
    }

    // Clamp & validate
    const MIN_SIZE = 50; // tuỳ dự án, tránh size quá nhỏ
    const MIN_OVERLAP = 0;
    const size = Math.max(newSize, MIN_SIZE);
    const overlap = Math.max(newOverlap, MIN_OVERLAP);

    // overlap phải < size
    if (overlap >= size) {
      setHasChunkSettingsChanged(false);
      return;
    }

    // Nếu trước & sau đều tắt chunking -> không cần re-build
    if (!oldEnable && !newEnable) {
      setHasChunkSettingsChanged(false);
      return;
    }

    // Nếu chuyển enable thay đổi trạng thái -> chắc chắn cần re-build
    if (oldEnable !== newEnable) {
      setHasChunkSettingsChanged(true);
      return;
    }

    // ====== Symmetric relative change (%), ổn định hơn ======
    const symRel = (a: number, b: number) => {
      const denom = (Math.abs(a) + Math.abs(b)) / 2 || 1; // chống 0
      return (Math.abs(a - b) / denom) * 100;
    };

    const chunkSizeChangePct = symRel(size, oldSize);
    const overlapChangePct = symRel(overlap, oldOverlap);

    // ====== Ngưỡng động theo kích thước tài liệu ======
    const CHUNK_SIZE_THRESHOLD = 15; // %
    const OVERLAP_THRESHOLD = 25; // %

    // Ngưỡng tuyệt đối tỉ lệ theo size cũ (co giãn theo quy mô)
    const ABS_SIZE_THRESH = Math.max(0.25 * oldSize, 150); // max(25% old, 150 tokens)
    const ABS_OVERL_THRESH = Math.max(0.4 * oldOverlap, 50); // max(40% old, 50 tokens)

    const absSizeDiff = Math.abs(size - oldSize);
    const absOverlapDiff = Math.abs(overlap - oldOverlap);

    const needsRebuild =
      chunkSizeChangePct > CHUNK_SIZE_THRESHOLD ||
      overlapChangePct > OVERLAP_THRESHOLD ||
      absSizeDiff > ABS_SIZE_THRESH ||
      absOverlapDiff > ABS_OVERL_THRESH;

    setHasChunkSettingsChanged(needsRebuild);
  }, [
    formData.enableChunking,
    formData.chunkSize,
    formData.chunkOverlap,
    originalChunkSettings?.enableChunking,
    originalChunkSettings?.chunkSize,
    originalChunkSettings?.chunkOverlap,
  ]);

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
    const res = await fetch("/api/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error("Failed to create embedding for a chunk");
    const data = await res.json();
    if (!data?.embedding || !Array.isArray(data.embedding)) {
      throw new Error("Invalid embedding response");
    }
    return data.embedding as number[];
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

    // 25KB per chunk
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
    return sumVectors(vectors);
  };

  /** ========== DELETE OLD CHUNKS ========== */
  const deleteOldChunks = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from("resource_chunks")
        .delete()
        .eq("resource_id", resourceId);

      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  /** ========== UPDATE CHUNK METADATA (SMALL CHANGES) ========== */
  const updateChunkMetadata = async (resourceId: string) => {
    try {
      // Update all existing chunks with new metadata
      const { error } = await (supabase as any)
        .from("resource_chunks")
        .update({
          chunk_size: formData.chunkSize,
          overlap: formData.chunkOverlap,
        })
        .eq("resource_id", resourceId);

      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  /** ========== PROCESS FILE CHUNKS (FROM CREATE COMPONENT) ========== */
  const processFileChunks = async (
    resourceId: string,
    file: File,
    chunkSize: number,
    chunkOverlap: number,
    existingText?: string
  ) => {
    try {
      // 1️⃣ Sử dụng text có sẵn hoặc trích text từ file
      let text = existingText;
      if (!text) {
        text = await extractTextFromPDF(file);
      }

      // Validate text content
      if (!text || text.length < 20) {
        throw new Error("File không có nội dung hoặc quá ngắn để xử lý");
      }

      // 2️⃣ Tokenize
      const tokens = encode(text);
      const totalTokens = tokens.length;

      // 3️⃣ Giới hạn an toàn
      const maxTokens = 50000;
      const usedTokens = tokens.slice(0, maxTokens);

      // 4️⃣ Giới hạn overlap an toàn
      const safeOverlap = Math.max(0, Math.min(chunkOverlap, chunkSize - 1));

      // 5️⃣ Chia chunks không bị lặp
      const chunks: { text: string; tokenCount: number }[] = [];

      for (
        let start = 0;
        start < usedTokens.length;
        start += chunkSize - safeOverlap
      ) {
        const end = Math.min(start + chunkSize, usedTokens.length);
        const chunkTokens = usedTokens.slice(start, end);
        const chunkText = decodeTokens(chunkTokens);

        // Loại bỏ trùng lặp text với chunk trước
        if (chunks.length > 0 && chunkText === chunks[chunks.length - 1].text) {
          continue;
        }

        chunks.push({ text: chunkText.trim(), tokenCount: chunkTokens.length });

        if (chunks.length >= 200) {
          break;
        }
      }

      // 6️⃣ Lưu từng chunk kèm embedding
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        const embedding = await createEmbedding(c.text);

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
          // Skip on error
        }

        setChunkingProgress(Math.round(((i + 1) / chunks.length) * 100));
      }
    } catch (err) {
      throw err;
    }
  };

  /** ========== RECALCULATE CHUNKS WITH EXISTING TEXT ========== */
  const recalculateChunks = async (resourceId: string, text: string) => {
    try {
      // Delete old chunks first
      await deleteOldChunks(resourceId);

      // Use existing extracted text
      if (!text || text.length < 20) {
        return;
      }

      // Create a temporary file object for processing
      const tempFile = new File([text], "temp.txt", { type: "text/plain" });

      // Use the same processFileChunks function với text đã có sẵn
      await processFileChunks(
        resourceId,
        tempFile,
        formData.chunkSize,
        formData.chunkOverlap,
        text // Truyền text đã có sẵn
      );
    } catch (err) {
      throw err;
    }
  };

  /** Helper: decode token[] -> string */
  const decodeTokens = (tokens: number[]) => {
    try {
      const { decode } = require("gpt-tokenizer");
      return decode(tokens);
    } catch (error) {
      return tokens.map((token) => String.fromCharCode(token)).join("");
    }
  };

  /** ========== SUBMIT FORM ========== */
  /** ========== SUBMIT FORM (with smart full rebuild when chunk config changes) ========== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return setError("Vui lòng nhập tiêu đề.");
    if (!documentId) return setError("Không tìm thấy ID tài liệu.");

    try {
      setError("");
      setSuccess("");
      setUploading(true);
      setUploadProgress(0);
      setChunkingProgress(0);

      let fileData = null;
      let newEmbedding = null;
      let textForEmbedding = extractedText; // có thể reuse nếu đã extract trước đó

      /** 📂 1. Upload file mới (nếu có) */
      if (hasFileChanged && formData.file) {
        const interval = setInterval(() => {
          setUploadProgress((p) => (p >= 90 ? 90 : p + 10));
        }, 200);

        fileData = await uploadFile(formData.file);

        // Sử dụng text đã extract khi chọn file
        textForEmbedding = extractedText;

        // Validate text trước khi tạo embedding
        if (!textForEmbedding || textForEmbedding.trim().length < 20) {
          throw new Error(
            "Không thể trích xuất nội dung từ file. Vui lòng kiểm tra định dạng file."
          );
        }

        // Tạo embedding theo cơ chế 25KB/chunk và cộng vector
        newEmbedding = await buildResourceEmbedding(textForEmbedding.trim());
        if (!newEmbedding) throw new Error("Không thể tạo embedding mới.");

        clearInterval(interval);
        setUploadProgress(100);
      }

      /** 🧠 2. Cập nhật thông tin cơ bản tài liệu */
      const updateData: Record<string, any> = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        category: formData.category || null,
        is_public: formData.is_public,
      };

      if (fileData) {
        Object.assign(updateData, {
          file_url: fileData.file_url,
          file_type: fileData.file_type,
          file_size: fileData.file_size,
        });
      }

      if (newEmbedding) {
        updateData.embedding = newEmbedding;
      }

      const { error: updateError } = await (supabase as any)
        .from("resources")
        .update(updateData)
        .eq("id", documentId);

      if (updateError) throw updateError;

      /** 🔁 3. Chunk logic — rebuild thông minh */
      if (formData.enableChunking) {
        if (hasFileChanged || hasChunkSettingsChanged) {
          // ✅ Nếu file mới hoặc chunk config thay đổi đáng kể → xoá chunk cũ, build lại
          await deleteOldChunks(documentId);

          // Lấy text để xử lý chunk
          if (!textForEmbedding) {
            if (formData.file) {
              // Sử dụng text đã extract ở bước trước
              textForEmbedding = extractedText;
            } else {
              // Nếu không có file mới → lấy text từ bản cũ đã extract hoặc fetch từ DB
              const { data: resource } = await supabase
                .from("resources")
                .select("file_url")
                .eq("id", documentId)
                .single();

              if ((resource as any)?.file_url) {
                const res = await fetch((resource as any).file_url as string);
                const blob = await res.blob();
                const file = new File([blob], "original.pdf", {
                  type: blob.type,
                });
                textForEmbedding = await extractTextFromPDF(file);
              }
            }
          }

          // Dùng text hiện có để xử lý lại chunk
          if (textForEmbedding && textForEmbedding.trim().length > 0) {
            const tempFile = new File([textForEmbedding], "temp.txt", {
              type: "text/plain",
            });

            await processFileChunks(
              documentId,
              tempFile,
              formData.chunkSize,
              formData.chunkOverlap,
              textForEmbedding // Truyền text đã có sẵn
            );
          }

          setChunkingProgress(100);
        } else {
          // ⚙️ Không đổi gì nhiều → chỉ cập nhật metadata
          await updateChunkMetadata(documentId);
        }
      }

      /** ✅ 4. Kết thúc */
      setSuccess("Tài liệu đã được cập nhật thành công!");
      setTimeout(() => router.push("/admin/documents"), 1500);
    } catch (err: any) {
      setError("Lỗi khi cập nhật tài liệu. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setChunkingProgress(0);
    }
  };

  /** ========== AI GENERATION ========== */
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
      // Handle error silently
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
      // Handle error silently
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
      setError("Lỗi khi tạo nội dung AI. Vui lòng thử lại.");
    }
  };

  /** ========== UI HELPERS ========== */
  const getFileTypeIcon = (ext: string | null) =>
    (ext && fileTypeIcons[ext as keyof typeof fileTypeIcons]) ||
    fileTypeIcons.default;

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Đang tải thông tin tài liệu...</p>
        </div>
      </div>
    );
  }

  if (!originalDocument) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl">Không tìm thấy tài liệu</p>
          <button
            onClick={() => router.push("/admin/documents")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-4xl font-bold text-white">
              Chỉnh Sửa Tài liệu
            </h1>
          </div>
          <p className="text-gray-300">Cập nhật thông tin tài liệu</p>
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
                  File{" "}
                  {hasFileChanged && (
                    <span className="text-yellow-400">(Đã thay đổi)</span>
                  )}
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#3b82f6]/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    className="hidden"
                    id="file-upload"
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
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                            {(() => {
                              const FileIcon = getFileTypeIcon(
                                originalDocument.file_type
                              );
                              return (
                                <FileIcon className="w-5 h-5 text-white" />
                              );
                            })()}
                          </div>
                          <div className="text-left">
                            <p className="text-white font-medium">
                              {originalDocument.file_url.split("/").pop()}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {formatFileSize(originalDocument.file_size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUpload className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">
                            Chọn file mới để thay thế
                          </span>
                        </div>
                        <span className="text-gray-500 text-xs">
                          PDF, DOC, XLS, JPG, PNG (Max 100MB)
                        </span>
                      </div>
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
                  {hasChunkSettingsChanged && (
                    <span className="text-yellow-400 text-sm">
                      (Đã thay đổi)
                    </span>
                  )}
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
                    </div>

                    {/* Smart Chunking Info */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-400 text-xs">🧠</span>
                        </div>
                        <div>
                          <p className="text-blue-300 text-sm font-medium mb-1">
                            Smart Chunking Analysis
                          </p>
                          <div className="space-y-2 text-xs text-blue-200">
                            {(() => {
                              const changeInfo = getChangeTypeDescription();
                              return (
                                <p>
                                  <span className={changeInfo.color}>
                                    {changeInfo.icon}{" "}
                                    <strong>{changeInfo.description}:</strong>
                                  </span>{" "}
                                  {changeInfo.action}
                                </p>
                              );
                            })()}
                            <div className="mt-2 p-2 bg-blue-600/20 rounded text-xs">
                              <p className="text-blue-100 font-medium mb-1">
                                Phân tích thay đổi:
                              </p>
                              {(() => {
                                const changes = getChangePercentages();
                                return (
                                  <div className="space-y-1 text-blue-200">
                                    <div className="flex justify-between">
                                      <span>Chunk size:</span>
                                      <span
                                        className={`font-medium ${
                                          changes.chunkSize > 20
                                            ? "text-yellow-300"
                                            : "text-green-300"
                                        }`}
                                      >
                                        {changes.chunkSize.toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Overlap:</span>
                                      <span
                                        className={`font-medium ${
                                          changes.overlap > 30
                                            ? "text-yellow-300"
                                            : "text-green-300"
                                        }`}
                                      >
                                        {changes.overlap.toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="mt-2 pt-1 border-t border-blue-500/30">
                                      <p className="text-blue-100 text-xs">
                                        {(() => {
                                          const changeInfo =
                                            getChangeTypeDescription();
                                          return `${changeInfo.icon} ${changeInfo.action}`;
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
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
                    <span>Đang cập nhật...</span>
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
                    <span>Đang xử lý chunks...</span>
                    <span>{chunkingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${chunkingProgress}%` }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs">
                    {hasFileChanged
                      ? "Đang xử lý file mới và tạo chunks..."
                      : hasChunkSettingsChanged
                      ? "Đang tính toán lại chunks với settings mới..."
                      : "Đang cập nhật metadata chunks..."}
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
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <FaEdit className="w-4 h-4" />
                      Cập nhật tài liệu
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
