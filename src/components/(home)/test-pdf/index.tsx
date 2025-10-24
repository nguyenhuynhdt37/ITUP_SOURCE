"use client";

import { extractTextFromPDF } from "@/lib/extractTextFromPDF";
import { useState } from "react";
import {
  FaCheck,
  FaDownload,
  FaExclamationTriangle,
  FaEye,
  FaFilePdf,
  FaSpinner,
} from "react-icons/fa";

export const TestPDFComponent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [processingTime, setProcessingTime] = useState<number>(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Reset states
    setError("");
    setSuccess("");
    setExtractedText("");
    setFile(selectedFile);

    if (selectedFile.type !== "application/pdf") {
      setError("Vui lòng chọn file PDF");
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File quá lớn (max 50MB)");
      return;
    }

    try {
      setIsProcessing(true);
      const startTime = Date.now();

      // Extract text from PDF
      const text = await extractTextFromPDF(selectedFile);

      const endTime = Date.now();
      setProcessingTime(endTime - startTime);

      if (text && text.trim()) {
        setExtractedText(text);
        setSuccess(`Trích xuất thành công! Thời gian: ${processingTime}ms`);
      } else {
        setError("Không thể trích xuất text từ PDF này");
      }
    } catch (err) {
      console.error("PDF extraction error:", err);
      setError(
        `Lỗi khi trích xuất PDF: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadText = () => {
    if (!extractedText) return;

    const blob = new Blob([extractedText], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name?.replace(".pdf", "") || "extracted"}_text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!extractedText) return;

    try {
      await navigator.clipboard.writeText(extractedText);
      setSuccess("Đã copy text vào clipboard!");
    } catch (err) {
      setError("Không thể copy text");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 Test PDF Text Extraction
          </h1>
          <p className="text-gray-300 text-lg">
            Kiểm tra chức năng trích xuất text từ file PDF
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Upload Section */}
          <div className="bg-[#1a1a4d]/90 backdrop-blur-lg rounded-2xl border border-white/20 p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaFilePdf className="text-red-500" />
              Upload PDF File
            </h2>

            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#3b82f6]/50 transition-colors">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf"
                className="hidden"
                id="pdf-upload"
                disabled={isProcessing}
              />
              <label
                htmlFor="pdf-upload"
                className={`cursor-pointer flex flex-col items-center gap-4 ${
                  isProcessing ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {file ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <FaFilePdf className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium text-lg">
                        {file.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-gray-500 text-xs">{file.type}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <FaFilePdf className="w-16 h-16 text-gray-400" />
                    <div>
                      <p className="text-gray-300 text-lg mb-2">
                        Chọn file PDF để test
                      </p>
                      <p className="text-gray-500 text-sm">
                        Hỗ trợ file PDF (Max 50MB)
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FaSpinner className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-blue-300">
                    Đang trích xuất text từ PDF...
                  </span>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3">
                <FaExclamationTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3">
                <FaCheck className="w-5 h-5 text-green-400" />
                <span className="text-green-300">{success}</span>
              </div>
            )}
          </div>

          {/* Results Section */}
          {extractedText && (
            <div className="bg-[#1a1a4d]/90 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FaEye className="text-green-500" />
                  Extracted Text
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={downloadText}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                  >
                    <FaDownload className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              {/* Text Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Characters</p>
                  <p className="text-white font-bold text-lg">
                    {extractedText.length.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Words</p>
                  <p className="text-white font-bold text-lg">
                    {extractedText
                      .split(/\s+/)
                      .filter(Boolean)
                      .length.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Lines</p>
                  <p className="text-white font-bold text-lg">
                    {extractedText.split("\n").length.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Processing Time</p>
                  <p className="text-white font-bold text-lg">
                    {processingTime}ms
                  </p>
                </div>
              </div>

              {/* Text Preview */}
              <div className="bg-black/20 rounded-xl p-4 max-h-96 overflow-y-auto">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {extractedText}
                </pre>
              </div>

              {/* Text Preview (Formatted) */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Formatted Text Preview
                </h3>
                <div className="bg-white/5 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <div className="text-gray-300 text-sm leading-relaxed">
                    {extractedText.split("\n").map((line, index) => (
                      <p key={index} className="mb-2">
                        {line || "\u00A0"}{" "}
                        {/* Non-breaking space for empty lines */}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              📋 Hướng dẫn sử dụng
            </h3>
            <div className="text-blue-200 text-sm space-y-2">
              <p>
                • <strong>Upload PDF:</strong> Chọn file PDF để test chức năng
                trích xuất text
              </p>
              <p>
                • <strong>Processing:</strong> Hệ thống sẽ tự động trích xuất
                text từ PDF
              </p>
              <p>
                • <strong>Results:</strong> Xem kết quả text được trích xuất với
                thống kê chi tiết
              </p>
              <p>
                • <strong>Download:</strong> Tải về file text hoặc copy vào
                clipboard
              </p>
              <p>
                • <strong>Supported:</strong> Hỗ trợ PDF với text (không hỗ trợ
                PDF scan/image)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
