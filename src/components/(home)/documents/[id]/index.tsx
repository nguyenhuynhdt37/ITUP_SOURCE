"use client";

import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaDownload,
  FaFileAlt,
  FaFilePdf,
  FaFolder,
  FaTag,
  FaUser,
} from "react-icons/fa";

const FlipBookViewer = dynamic(
  () => import("@/components/shared/pdf-flip-viewer/index"),
  { ssr: false }
);

interface Document {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  thumbnail_url?: string;
  category?: string;
  page_count?: number;
  uploader_id?: string;
  uploader_name?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
}

const DocumentDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string>("");

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (params?.id) {
      fetchDocument();
      incrementViews();
    }
  }, [params?.id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const documentId = params?.id as string;
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("id", documentId)
        .eq("is_public", true)
        .single();

      if (error) {
        console.log("Supabase error:", error);
        // Use mock data if database error
        setDocument({
          id: params?.id as string,
          title: "Tài liệu hướng dẫn học React",
          description:
            "Tài liệu hướng dẫn chi tiết về React từ cơ bản đến nâng cao, bao gồm các concepts quan trọng như hooks, state management, và performance optimization.",
          file_url: "/sample.pdf",
          file_type: "pdf",
          file_size: 2500000,
          thumbnail_url: "/api/placeholder/400/250",
          category: "Lập trình",
          page_count: 50,
          uploader_name: "IT UP",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_public: true,
        });
      } else {
        setDocument(data);
      }
    } catch (error) {
      console.log("Error fetching document:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      const documentId = params?.id as string;
      // Just log the view increment - RPC function may not exist yet
      console.log("Incrementing views for document:", documentId);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      // Log download - RPC function may not exist yet
      console.log("Downloading document:", document.id);

      // Trigger download
      const link = window.document.createElement("a");
      link.href = document.file_url;
      link.download = document.title;
      link.click();
    } catch (error) {
      console.log("Error downloading:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Đang tải tài liệu...
          </h1>
          <p className="text-blue-200">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaFileAlt className="w-8 h-8 text-white/40" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Không tìm thấy tài liệu
          </h1>
          <p className="text-blue-200 mb-6">
            Tài liệu này không tồn tại hoặc đã bị xóa.
          </p>
          <Link
            href="/documents"
            className="inline-flex items-center px-6 py-3 bg-[#3b82f6] hover:bg-[#1e40af] text-white rounded-xl transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] text-white">
      {/* Header Section */}
      <section className="relative bg-gradient-to-r from-[#000033] via-[#000033] to-[#000033] text-white py-16 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#3b82f6]/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-[#3b82f6]/20 rounded-full animate-bounce"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/documents"
              className="inline-flex items-center text-white/80 hover:text-white transition-colors duration-200 group"
            >
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Quay lại danh sách tài liệu</span>
            </Link>
          </div>

          {/* Title and Meta */}
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-[#3b82f6] to-white bg-clip-text text-transparent">
                {document.title}
              </span>
            </h1>

            {document.description && (
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                {document.description}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap gap-6 text-white/70">
              <div className="flex items-center">
                <FaUser className="w-4 h-4 mr-2" />
                <span className="font-medium">
                  {document.uploader_name || "IT UP"}
                </span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="w-4 h-4 mr-2" />
                <span>{formatDate(document.created_at)}</span>
              </div>
              {document.page_count && (
                <div className="flex items-center">
                  <FaFilePdf className="w-4 h-4 mr-2" />
                  <span>{document.page_count} trang</span>
                </div>
              )}
            </div>

            {/* Category Tag */}
            {document.category && (
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-medium hover:bg-white/20 transition-colors duration-200">
                  <FaTag className="w-3 h-3 mr-2" />
                  {document.category}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Document Info Section */}
      <section className="py-8 bg-gradient-to-r from-[#2d2d66] to-[#2d2d66]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center mb-2">
                <FaFolder className="w-5 h-5 text-[#3b82f6] mr-2" />
                <span className="text-white/70 text-sm font-medium">
                  Danh mục
                </span>
              </div>
              <p className="text-white font-bold text-lg">
                {document.category || "Chưa phân loại"}
              </p>
            </div>

            {/* File Type */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center mb-2">
                <FaFilePdf className="w-5 h-5 text-[#3b82f6] mr-2" />
                <span className="text-white/70 text-sm font-medium">
                  Loại file
                </span>
              </div>
              <p className="text-white font-bold text-lg">
                {document.file_type.split("/")[1]?.toUpperCase() || "PDF"}
              </p>
            </div>

            {/* File Size */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center mb-2">
                <FaFileAlt className="w-5 h-5 text-[#3b82f6] mr-2" />
                <span className="text-white/70 text-sm font-medium">
                  Kích thước
                </span>
              </div>
              <p className="text-white font-bold text-lg">
                {formatFileSize(document.file_size)}
              </p>
            </div>

            {/* Download Button */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex items-center justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center px-6 py-3 bg-[#3b82f6] hover:bg-[#1e40af] text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Tải xuống
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PDF Viewer Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* PDF Viewer Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Xem trước tài liệu
              </h2>
              <p className="text-white/70">
                Sử dụng các nút điều khiển bên dưới để lật trang
              </p>
            </div>

            {/* FlipBook Display */}
            {isClient && document.file_url && (
              <div className="mt-8">
                {pdfLoading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Đang tải PDF...
                    </h4>
                    <p className="text-white/70">Vui lòng chờ trong giây lát</p>
                  </div>
                )}

                {!pdfLoading && !pdfError && (
                  <div className="flex justify-center">
                    <div className="w-full max-w-6xl">
                      <FlipBookViewer file={document.file_url} />
                    </div>
                  </div>
                )}

                {pdfError && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaFilePdf className="w-8 h-8 text-red-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Lỗi tải PDF
                    </h4>
                    <p className="text-white/70 mb-6">{pdfError}</p>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center px-6 py-3 bg-[#3b82f6] hover:bg-[#1e40af] text-white rounded-xl transition-colors duration-200"
                    >
                      <FaDownload className="mr-2" />
                      Tải xuống thay thế
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Fallback for non-PDF files */}
            {isClient && !document.file_url.toLowerCase().includes(".pdf") && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileAlt className="w-8 h-8 text-[#3b82f6]" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Không thể xem trước
                </h4>
                <p className="text-white/70 mb-6">
                  File này không hỗ trợ xem trước trực tiếp. Vui lòng tải xuống
                  để xem.
                </p>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-6 py-3 bg-[#3b82f6] hover:bg-[#1e40af] text-white rounded-xl transition-colors duration-200"
                >
                  <FaDownload className="mr-2" />
                  Tải xuống
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      {document.description && (
        <section className="py-12 bg-gradient-to-r from-[#2d2d66] to-[#2d2d66]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
              <h2 className="text-3xl font-bold mb-6 text-white">
                Mô tả chi tiết
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/90 text-lg leading-relaxed">
                  {document.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Action Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Tài liệu hữu ích?
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Tải xuống để sử dụng offline hoặc chia sẻ với bạn bè
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-8 py-4 bg-white text-[#3b82f6] hover:bg-gray-100 rounded-xl transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FaDownload className="mr-3" />
                Tải xuống ngay
              </button>
              <Link
                href="/documents"
                className="inline-flex items-center px-8 py-4 bg-white/10 border-2 border-white text-white hover:bg-white/20 rounded-xl transition-all duration-200 font-bold text-lg"
              >
                <FaFolder className="mr-3" />
                Xem thêm tài liệu
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentDetail;
