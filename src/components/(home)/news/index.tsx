"use client";

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaBookmark,
  FaCalendarAlt,
  FaChevronRight,
  FaEye,
  FaHeart,
  FaNewspaper,
  FaSearch,
  FaUser,
} from "react-icons/fa";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  thumbnail_url?: string;
  tags: string[];
  author_id?: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  is_published: boolean;
  views: number;
  likes: number;
}

const News = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("published_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);

  const NEWS_PER_PAGE = 4;

  useEffect(() => {
    fetchNews();
    // Load user's interactions from localStorage
    const liked = JSON.parse(localStorage.getItem("likedArticles") || "[]");
    const bookmarked = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setLikedArticles(liked);
    setBookmarkedArticles(bookmarked);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) {
        console.log("Supabase error:", error);

        // Handle different types of database errors
        const isTableNotExist =
          error.code === "PGRST116" ||
          error.message?.includes('relation "news" does not exist') ||
          error.message?.includes("relation news does not exist") ||
          error.code === "42P01";

        const isPermissionError =
          error.code === "42501" ||
          error.message?.includes("permission denied") ||
          error.message?.includes("insufficient privileges");

        if (isTableNotExist || isPermissionError) {
          console.log("Database access issue, using mock data");
          const mockNews: NewsArticle[] = [
            {
              id: "mock-1",
              title:
                'Câu lạc bộ IT UP tổ chức workshop "Lập trình Web hiện đại"',
              slug: "cau-lac-bo-it-up-to-chuc-workshop-lap-trinh-web-hien-dai",
              summary:
                "Workshop hướng dẫn các công nghệ web mới nhất như React, Next.js và TypeScript. Sự kiện thu hút hơn 50 sinh viên tham gia.",
              content: "Nội dung chi tiết về workshop...",
              thumbnail_url: "/api/placeholder/400/250",
              tags: ["Workshop", "Web Development", "React"],
              author_name: "IT UP",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              published_at: new Date().toISOString(),
              is_published: true,
              views: 156,
              likes: 23,
            },
            {
              id: "mock-2",
              title: 'Cuộc thi Hackathon "Innovation Challenge 2024"',
              slug: "cuoc-thi-hackathon-innovation-challenge-2024",
              summary:
                'Cuộc thi lập trình 48h với chủ đề "Giải pháp số cho giáo dục". Tổng giải thưởng lên đến 50 triệu đồng.',
              content: "Nội dung chi tiết về hackathon...",
              thumbnail_url: "/api/placeholder/400/250",
              tags: ["Competition", "Hackathon", "Innovation"],
              author_name: "IT UP",
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              published_at: new Date(Date.now() - 86400000).toISOString(),
              is_published: true,
              views: 89,
              likes: 15,
            },
            {
              id: "mock-3",
              title: "Chương trình mentoring cho sinh viên năm nhất",
              slug: "chuong-trinh-mentoring-cho-sinh-vien-nam-nhat",
              summary:
                "Kết nối sinh viên mới với các anh chị có kinh nghiệm trong lĩnh vực IT. Chương trình diễn ra trong 3 tháng.",
              content: "Nội dung chi tiết về chương trình mentoring...",
              thumbnail_url: "/api/placeholder/400/250",
              tags: ["Mentoring", "Education", "Support"],
              author_name: "IT UP",
              created_at: new Date(Date.now() - 172800000).toISOString(),
              updated_at: new Date(Date.now() - 172800000).toISOString(),
              published_at: new Date(Date.now() - 172800000).toISOString(),
              is_published: true,
              views: 67,
              likes: 12,
            },
          ];
          setNews(mockNews);

          // Extract unique tags from mock data
          const allTags = mockNews.flatMap((article) => article.tags || []);
          const uniqueTags = [...new Set(allTags)].filter(Boolean);
          setAvailableTags(uniqueTags);
          return;
        }

        throw error;
      }

      const typedData: NewsArticle[] = (data as NewsArticle[]) || [];
      setNews(typedData);

      // Extract unique tags
      if (typedData.length) {
        const allTags = typedData.flatMap((article) => article.tags || []);
        const uniqueTags = [...new Set(allTags)].filter(Boolean);
        setAvailableTags(uniqueTags);
      }
    } catch (error) {
      console.log("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag =
      filterTag === "Tất cả" || article.tags.includes(filterTag);

    return matchesSearch && matchesTag;
  });

  // Sort news based on selected criteria
  const sortedNews = [...filteredNews].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "published_at":
        aValue = new Date(a.published_at || a.created_at).getTime();
        bValue = new Date(b.published_at || b.created_at).getTime();
        break;
      case "views":
        aValue = a.views || 0;
        bValue = b.views || 0;
        break;
      case "likes":
        aValue = a.likes || 0;
        bValue = b.likes || 0;
        break;
      default:
        aValue = new Date(a.published_at || a.created_at).getTime();
        bValue = new Date(b.published_at || b.created_at).getTime();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Calculate pagination
  const totalFilteredNews = sortedNews.length;
  const totalPagesCount = Math.ceil(totalFilteredNews / NEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
  const endIndex = startIndex + NEWS_PER_PAGE;
  const paginatedNews = sortedNews.slice(startIndex, endIndex);

  // Update total pages when filtered news change
  useEffect(() => {
    setTotalPages(totalPagesCount);
    if (currentPage > totalPagesCount && totalPagesCount > 0) {
      setCurrentPage(1);
    }
  }, [totalPagesCount, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLike = (articleId: string) => {
    const isLiked = likedArticles.includes(articleId);
    let updatedLikes;

    if (isLiked) {
      updatedLikes = likedArticles.filter((id) => id !== articleId);
    } else {
      updatedLikes = [...likedArticles, articleId];
    }

    setLikedArticles(updatedLikes);
    localStorage.setItem("likedArticles", JSON.stringify(updatedLikes));
  };

  const handleBookmark = (articleId: string) => {
    const isBookmarked = bookmarkedArticles.includes(articleId);
    let updatedBookmarks;

    if (isBookmarked) {
      updatedBookmarks = bookmarkedArticles.filter((id) => id !== articleId);
    } else {
      updatedBookmarks = [...bookmarkedArticles, articleId];
    }

    setBookmarkedArticles(updatedBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Đang tải tin tức...
          </h1>
          <p className="text-blue-200">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] text-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#000033] via-[#000033] to-[#000033] text-white py-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#3b82f6]/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-[#3b82f6]/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl group-hover:scale-105 transition-transform duration-300 border border-white/20">
                  <FaNewspaper className="w-16 h-16 text-[#3b82f6]" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-[#3b82f6] to-white bg-clip-text text-transparent">
                Tin tức
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl mb-12 text-[#3b82f6] max-w-4xl mx-auto leading-relaxed">
              Cập nhật những hoạt động, sự kiện và tin tức mới nhất từ Câu lạc
              bộ IT UP
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="text-4xl font-bold text-[#3b82f6] mb-2">
                  {news.length}
                </div>
                <div className="text-sm font-semibold text-white">Bài viết</div>
              </div>
              <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="text-4xl font-bold text-[#3b82f6] mb-2">
                  {news.reduce((sum, article) => sum + (article.views || 0), 0)}
                </div>
                <div className="text-sm font-semibold text-white">Lượt xem</div>
              </div>
              <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="text-4xl font-bold text-[#3b82f6] mb-2">
                  {availableTags.length}
                </div>
                <div className="text-sm font-semibold text-white">Chủ đề</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gradient-to-r from-[#2d2d66] to-[#2d2d66]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Block */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Tìm kiếm và lọc
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tin tức..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {/* Tag Filter */}
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="Tất cả">Tất cả chủ đề</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="published_at">Ngày xuất bản</option>
                <option value="title">Tiêu đề</option>
                <option value="views">Lượt xem</option>
                <option value="likes">Lượt thích</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* News List - Horizontal Layout */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {paginatedNews.map((article, index) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="block bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group animate-fade-in-up"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail - Left Side */}
                  <div className="relative w-full lg:w-96 h-64 lg:h-auto lg:min-h-[280px] flex-shrink-0 overflow-hidden">
                    {article.thumbnail_url ? (
                      <Image
                        src={article.thumbnail_url}
                        alt={article.title}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 100vw, 384px"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a4d] to-[#000033] flex items-center justify-center">
                        <FaNewspaper className="w-16 h-16 text-white/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                      {article.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-[#3b82f6] text-white px-3 py-1 rounded-full text-xs font-semibold mr-2 shadow-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <FaChevronRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content - Right Side */}
                  <div className="flex-1 p-6 lg:p-8">
                    <div className="flex flex-col h-full">
                      {/* Title */}
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Summary */}
                      {article.summary && (
                        <p className="text-white/80 mb-6 line-clamp-3 text-lg leading-relaxed">
                          {article.summary}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-6 mb-6 text-white/70">
                        <div className="flex items-center">
                          <FaUser className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            {article.author_name || "IT UP"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-4 h-4 mr-2" />
                          <span>
                            {formatDate(
                              article.published_at || article.created_at
                            )}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaEye className="w-4 h-4 mr-2" />
                          <span>{article.views || 0} lượt xem</span>
                        </div>
                        <div className="flex items-center">
                          <FaHeart className="w-4 h-4 mr-2" />
                          <span>{article.likes || 0} lượt thích</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleLike(article.id);
                              }}
                              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                                likedArticles.includes(article.id)
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                              }`}
                            >
                              <FaHeart className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                {likedArticles.includes(article.id)
                                  ? "Đã thích"
                                  : "Thích"}
                              </span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleBookmark(article.id);
                              }}
                              className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                                bookmarkedArticles.includes(article.id)
                                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                              }`}
                            >
                              <FaBookmark className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">
                                {bookmarkedArticles.includes(article.id)
                                  ? "Đã lưu"
                                  : "Lưu"}
                              </span>
                            </button>
                          </div>
                          <div className="flex items-center text-sm text-white/60">
                            <div className="w-2 h-2 bg-[#3b82f6] rounded-full mr-2"></div>
                            {Math.ceil((article.content?.length || 0) / 1000)}{" "}
                            phút đọc
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-[#3b82f6] font-semibold hover:text-[#1e40af] transition-colors group-hover:translate-x-1 duration-300">
                            Đọc chi tiết
                            <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {sortedNews.length === 0 && (
            <div className="text-center py-12">
              <FaNewspaper className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Không tìm thấy tin tức
              </h3>
              <p className="text-white/70">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPagesCount > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Trước
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPagesCount }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-white text-[#000033]"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPagesCount}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Sau
              </button>
            </div>
          )}

          {/* Pagination Info */}
          {sortedNews.length > 0 && (
            <div className="text-center mt-6">
              <p className="text-white/70 text-sm">
                Hiển thị {startIndex + 1}-
                {Math.min(endIndex, totalFilteredNews)} trong{" "}
                {totalFilteredNews} bài viết
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default News;
