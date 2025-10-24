"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaEye,
  FaFileAlt,
  FaFilePdf,
  FaSearch,
  FaSort,
  FaSpinner,
  FaTag,
  FaUser,
} from "react-icons/fa";

interface Document {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  author_name: string;
  tags: string[];
  views: number;
  downloads: number;
  is_public: boolean;
}

const Documents = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterTag, setFilterTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const itemsPerPage = 12;

  useEffect(() => {
    fetchDocuments();
    fetchTags();
  }, [searchTerm, sortBy, sortOrder, filterTag, currentPage]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("resources")
        .select("*", { count: "exact" })
        .eq("is_public", true);

      // Search filter
      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      // Tag filter
      if (filterTag) {
        query = query.contains("tags", [filterTag]);
      }

      // Sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setDocuments(data || []);
      setTotalDocs(count || 0);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const { data } = await supabase
        .from("resources")
        .select("tags")
        .eq("is_public", true)
        .not("tags", "is", null);

      if (data) {
        const allTags = data
          .flatMap((doc: any) => doc.tags || [])
          .filter((tag: string) => tag && tag.trim() !== "");
        const uniqueTags = [...new Set(allTags)];
        setAllTags(uniqueTags);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDocuments();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleTagFilter = (tag: string) => {
    setFilterTag(filterTag === tag ? "" : tag);
    setCurrentPage(1);
  };

  const handlePreview = (doc: Document) => {
    setSelectedDoc(doc);
    setShowPreview(true);
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Track download
      await (supabase as any)
        .from("resources")
        .update({ downloads: (doc.downloads || 0) + 1 })
        .eq("id", doc.id);

      // Open download link
      window.open(doc.file_url, "_blank");
    } catch (err) {
      console.error("Error tracking download:", err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading && documents.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#1a1a4d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3b82f6] mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Đang tải tài liệu...
          </h2>
          <p className="text-[#3b82f6]">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#1a1a4d] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-2xl mb-6 shadow-2xl">
            <FaBookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-white via-[#3b82f6] to-white bg-clip-text text-transparent">
              Thư viện tài liệu
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#3b82f6] max-w-4xl mx-auto leading-relaxed">
            Khám phá bộ sưu tập tài liệu phong phú của Câu lạc bộ IT UP
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3b82f6] w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm tài liệu..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-200"
                />
              </div>
            </form>

            {/* Sort */}
            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order as "asc" | "desc");
                  }}
                  className="appearance-none bg-white/10 border border-white/20 rounded-xl px-4 py-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-200"
                >
                  <option value="created_at-desc">Mới nhất</option>
                  <option value="created_at-asc">Cũ nhất</option>
                  <option value="title-asc">Tên A-Z</option>
                  <option value="title-desc">Tên Z-A</option>
                  <option value="views-desc">Lượt xem nhiều</option>
                  <option value="downloads-desc">Lượt tải nhiều</option>
                </select>
                <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3b82f6] w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <FaTag className="w-4 h-4 text-[#3b82f6]" />
                <span className="text-white font-medium">Lọc theo tag:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTagFilter("")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterTag === ""
                      ? "bg-[#3b82f6] text-white"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  Tất cả
                </button>
                {allTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filterTag === tag
                        ? "bg-[#3b82f6] text-white"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaFileAlt className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{totalDocs}</h3>
            <p className="text-white/80">Tài liệu</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaEye className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {documents
                .reduce((sum, doc) => sum + (doc.views || 0), 0)
                .toLocaleString()}
            </h3>
            <p className="text-white/80">Lượt xem</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaDownload className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {documents
                .reduce((sum, doc) => sum + (doc.downloads || 0), 0)
                .toLocaleString()}
            </h3>
            <p className="text-white/80">Lượt tải</p>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="w-8 h-8 text-[#3b82f6] animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFilePdf className="w-12 h-12 text-[#3b82f6]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Không tìm thấy tài liệu
            </h3>
            <p className="text-white/80 text-lg">
              {searchTerm || filterTag
                ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
                : "Chưa có tài liệu nào được chia sẻ"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                >
                  {/* Document Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <FaFilePdf className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="p-2 text-white/60 hover:text-[#3b82f6] hover:bg-white/10 rounded-lg transition-all duration-200"
                        title="Xem trước"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-white/60 hover:text-green-400 hover:bg-white/10 rounded-lg transition-all duration-200"
                        title="Tải xuống"
                      >
                        <FaDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Document Info */}
                  <h3
                    className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#3b82f6] transition-colors cursor-pointer"
                    onClick={() => router.push(`/documents/${doc.id}`)}
                  >
                    {doc.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {doc.description}
                  </p>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {doc.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#3b82f6]/20 text-[#3b82f6] rounded-full text-xs border border-[#3b82f6]/30"
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 2 && (
                        <span className="px-2 py-1 bg-white/10 text-white/60 rounded-full text-xs">
                          +{doc.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                    <div className="flex items-center gap-1">
                      <FaEye className="w-3 h-3" />
                      <span>{doc.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaDownload className="w-3 h-3" />
                      <span>{doc.downloads || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaFileAlt className="w-3 h-3" />
                      <span>{formatFileSize(doc.file_size || 0)}</span>
                    </div>
                  </div>

                  {/* Author and Date */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                      <FaUser className="w-3 h-3" />
                      <span>{doc.author_name || "IT UP"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="w-4 h-4" />
                  Trước
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                          currentPage === page
                            ? "bg-[#3b82f6] text-white"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Documents;
