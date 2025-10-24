"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaEdit,
  FaEye,
  FaHeart,
  FaPlus,
  FaSearch,
  FaTrash,
  FaUser,
} from "react-icons/fa";

export const News = () => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error fetching news:", error);
        // Use mock data if database error
        setNews([
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            title: "Workshop React Native - Xây dựng ứng dụng mobile",
            slug: "workshop-react-native-xay-dung-ung-dung-mobile",
            summary:
              "Học cách xây dựng ứng dụng mobile đa nền tảng với React Native...",
            content: "Nội dung chi tiết về workshop React Native...",
            thumbnail_url: null,
            is_published: true,
            published_at: "2024-12-15T10:00:00Z",
            views: 245,
            likes: 32,
            created_at: "2024-12-15T10:00:00Z",
            updated_at: "2024-12-15T10:00:00Z",
            tags: ["Workshop", "Mobile"],
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            title: "Cuộc thi Hackathon Innovation Challenge 2024",
            slug: "cuoc-thi-hackathon-innovation-challenge-2024",
            summary:
              "Cuộc thi lập trình 48h với chủ đề 'Giải pháp số cho giáo dục'...",
            content: "Nội dung chi tiết về cuộc thi Hackathon...",
            thumbnail_url: null,
            is_published: true,
            published_at: "2024-12-14T15:30:00Z",
            views: 189,
            likes: 28,
            created_at: "2024-12-14T15:30:00Z",
            updated_at: "2024-12-14T15:30:00Z",
            tags: ["Competition", "Hackathon"],
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440003",
            title: "Seminar AI & Machine Learning 2024",
            slug: "seminar-ai-machine-learning-2024",
            summary:
              "Buổi seminar về trí tuệ nhân tạo và học máy với các chuyên gia hàng đầu...",
            content: "Nội dung chi tiết về seminar AI...",
            thumbnail_url: null,
            is_published: false,
            published_at: null,
            views: 0,
            likes: 0,
            created_at: "2024-12-13T09:15:00Z",
            updated_at: "2024-12-13T09:15:00Z",
            tags: ["Seminar", "AI"],
          },
        ]);
        return;
      }

      setNews(data || []);
    } catch (error) {
      console.log("Error fetching news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        const { error } = await supabase.from("news").delete().eq("id", id);

        if (error) {
          console.log("Error deleting news:", error);
          alert("Lỗi khi xóa bài viết");
          return;
        }

        setNews(news.filter((item) => item.id !== id));
        alert("Xóa bài viết thành công");
      } catch (error) {
        console.log("Error deleting news:", error);
        alert("Lỗi khi xóa bài viết");
      }
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const updateData: any = { is_published: !currentStatus };

      // Nếu đang publish, set published_at
      if (!currentStatus) {
        updateData.published_at = new Date().toISOString();
      } else {
        updateData.published_at = null;
      }

      const { error } = await (supabase as any)
        .from("news")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.log("Error updating news:", error);
        alert("Lỗi khi cập nhật trạng thái");
        return;
      }

      setNews((prevNews) =>
        prevNews.map((item: any) =>
          item.id === id
            ? {
                ...item,
                is_published: !currentStatus,
                published_at: updateData.published_at,
              }
            : item
        )
      );
    } catch (error) {
      console.log("Error updating news:", error);
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "published" && item.is_published) ||
      (filterStatus === "draft" && !item.is_published);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Quản lý Tin tức
          </h1>
          <p className="text-white/80 text-lg">
            Quản lý và chỉnh sửa các bài viết tin tức
          </p>
        </div>
        <Link
          href="/admin/news/create"
          className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center"
        >
          <FaPlus className="w-5 h-5 mr-2" />
          Tạo tin tức mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          >
            <option value="all">Tất cả</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          >
            <option value="created_at">Ngày tạo</option>
            <option value="title">Tiêu đề</option>
            <option value="views">Lượt xem</option>
            <option value="likes">Lượt thích</option>
          </select>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Tiêu đề
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Tác giả
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Thống kê
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredNews.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-white font-medium line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-white/60 text-sm line-clamp-1 mt-1">
                        {item.summary}
                      </p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FaUser className="w-4 h-4 text-white/60 mr-2" />
                      <span className="text-white">Admin</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        handleTogglePublish(item.id, item.is_published)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        item.is_published
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                      }`}
                    >
                      {item.is_published ? "Đã xuất bản" : "Bản nháp"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4 text-sm text-white/80">
                      <div className="flex items-center">
                        <FaEye className="w-3 h-3 mr-1" />
                        {item.views || 0}
                      </div>
                      <div className="flex items-center">
                        <FaHeart className="w-3 h-3 mr-1" />
                        {item.likes || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-white/80 text-sm">
                      <FaCalendarAlt className="w-3 h-3 mr-2" />
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString(
                            "vi-VN"
                          )
                        : new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/news/${item.id}/edit`}
                        className="p-2 text-[#60a5fa] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <FaEdit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-white/80">
          Hiển thị {filteredNews.length} trong tổng số {news.length} bài viết
        </p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
            Trước
          </button>
          <button className="px-3 py-2 bg-[#3b82f6] text-white rounded-lg">
            1
          </button>
          <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};
