"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaClock,
  FaDownload,
  FaEdit,
  FaEye,
  FaFileAlt,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";

interface Document {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  page_count: number | null;
  thumbnail_url: string | null;
  uploader_name: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  chunk_count?: number;
  chunk_size?: number;
  overlap?: number;
}

const categories = [
  "Tài liệu học tập",
  "Báo cáo",
  "Thuyết trình",
  "Hướng dẫn",
  "Khác",
];

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

export const AdminDocuments = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("resources")
        .select(
          `
          *,
          resource_chunks(
            chunk_size,
            overlap
          )
        `
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Process documents with chunking info
        const processedDocuments = data.map((doc: any) => ({
          ...doc,
          chunk_count: doc.resource_chunks?.length || 0,
          chunk_size: doc.resource_chunks?.[0]?.chunk_size || null,
          overlap: doc.resource_chunks?.[0]?.overlap || null,
        }));
        setDocuments(processedDocuments);
      } else {
        console.log("Error fetching documents:", error);
        // Mock data fallback
        setDocuments([
          {
            id: "1",
            title: "Hướng dẫn lập trình Python",
            description:
              "Tài liệu hướng dẫn cơ bản về Python cho người mới bắt đầu",
            category: "Tài liệu học tập",
            file_url: "https://example.com/python-guide.pdf",
            file_type: "pdf",
            file_size: 2048576,
            page_count: 45,
            thumbnail_url:
              "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300",
            uploader_name: "Admin",
            is_public: true,
            created_at: "2024-01-15T10:00:00Z",
            updated_at: "2024-01-15T10:00:00Z",
          },
          {
            id: "2",
            title: "Báo cáo dự án AI",
            description: "Báo cáo chi tiết về dự án ứng dụng AI trong giáo dục",
            category: "Báo cáo",
            file_url: "https://example.com/ai-report.pdf",
            file_type: "pdf",
            file_size: 5242880,
            page_count: 32,
            thumbnail_url:
              "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300",
            uploader_name: "Admin",
            is_public: false,
            created_at: "2024-01-14T15:30:00Z",
            updated_at: "2024-01-14T15:30:00Z",
          },
        ]);
      }
    } catch (error) {
      console.log("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle create document
  const handleCreate = () => {
    router.push("/admin/documents/create");
  };

  // Handle edit document
  const handleEdit = (document: Document) => {
    router.push(`/admin/documents/edit/${document.id}`);
  };

  // Delete document
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    try {
      const { error } = await supabase.from("resources").delete().eq("id", id);

      if (error) {
        throw error;
      }

      setSuccess("Tài liệu đã được xóa thành công!");
      fetchDocuments();
    } catch (error) {
      console.log("Error deleting document:", error);
      setError("Lỗi khi xóa tài liệu. Vui lòng thử lại.");
    }
  };

  // Toggle public status
  const handleTogglePublic = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("resources")
        .update({ is_public: !currentStatus })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setSuccess(
        `Tài liệu đã được ${!currentStatus ? "công khai" : "ẩn"} thành công!`
      );
      fetchDocuments();
    } catch (error) {
      console.log("Error toggling public status:", error);
      setError("Lỗi khi cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  // Get file type icon
  const getFileTypeIcon = (fileType: string | null) => {
    if (!fileType) return fileTypeIcons.default;
    const icon = fileTypeIcons[fileType as keyof typeof fileTypeIcons];
    return icon || fileTypeIcons.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Quản lý Tài liệu
          </h1>
          <p className="text-gray-300">
            Upload và quản lý tài liệu của câu lạc bộ
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Tổng tài liệu</p>
                <p className="text-3xl font-bold text-white">
                  {documents.length}
                </p>
              </div>
              <FaFileAlt className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Công khai</p>
                <p className="text-3xl font-bold text-white">
                  {documents.filter((doc) => doc.is_public).length}
                </p>
              </div>
              <FaEye className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Riêng tư</p>
                <p className="text-3xl font-bold text-white">
                  {documents.filter((doc) => !doc.is_public).length}
                </p>
              </div>
              <FaClock className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Dung lượng</p>
                <p className="text-3xl font-bold text-white">
                  {formatFileSize(
                    documents.reduce(
                      (sum, doc) => sum + (doc.file_size || 0),
                      0
                    )
                  )}
                </p>
              </div>
              <FaDownload className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Upload Tài liệu
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200">
            {success}
          </div>
        )}

        {/* Documents Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">
                      Tài liệu
                    </th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">
                      Danh mục
                    </th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">
                      Kích thước
                    </th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">
                      Chunking
                    </th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-left text-gray-300 font-medium">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => {
                    const FileIcon = getFileTypeIcon(doc.file_type);
                    return (
                      <tr
                        key={doc.id}
                        className="border-t border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-lg flex items-center justify-center">
                              <FileIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {doc.title}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {doc.description || "Không có mô tả"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-[#1e3a8a]/20 text-[#60a5fa] rounded-full text-sm">
                            {doc.category || "Chưa phân loại"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="px-6 py-4">
                          {(doc.chunk_count || 0) > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-400 text-sm font-medium">
                                  {doc.chunk_count || 0} chunks
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                Size: {doc.chunk_size || "N/A"} | Overlap:{" "}
                                {doc.overlap || "N/A"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              Chưa chunking
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleTogglePublic(doc.id, doc.is_public)
                            }
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              doc.is_public
                                ? "bg-green-500/20 text-green-300"
                                : "bg-gray-500/20 text-gray-300"
                            }`}
                          >
                            {doc.is_public ? "Công khai" : "Riêng tư"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                doc.file_url &&
                                window.open(doc.file_url, "_blank")
                              }
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title="Xem tài liệu"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(doc)}
                              className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                doc.file_url &&
                                window.open(doc.file_url, "_blank")
                              }
                              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="Tải xuống"
                            >
                              <FaDownload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Xóa tài liệu"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
