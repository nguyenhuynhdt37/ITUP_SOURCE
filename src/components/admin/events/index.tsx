"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaEdit,
  FaEye,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaStop,
  FaTrash,
  FaUsers,
} from "react-icons/fa";

export const EventsList = () => {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setEvents(data || []);
      } catch (error) {
        console.log("Error loading events:", error);
        setError("Không thể tải danh sách sự kiện");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Filter events with Vietnam timezone
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || event.event_type === filterType;

    // Get current time in Vietnam timezone for filtering
    const now = new Date();
    const vietnamTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "upcoming" &&
        new Date(event.start_time) > vietnamTime) ||
      (filterStatus === "past" && new Date(event.end_time) < vietnamTime) ||
      (filterStatus === "cancelled" && event.is_cancelled);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus]);

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) {
        throw error;
      }

      setEvents(events.filter((event) => event.id !== eventId));
    } catch (error) {
      console.log("Error deleting event:", error);
      alert("Lỗi khi xóa sự kiện");
    }
  };

  // Handle toggle public status
  const handleTogglePublic = async (
    eventId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await (supabase as any)
        .from("events")
        .update({ is_public: !currentStatus })
        .eq("id", eventId);

      if (error) {
        throw error;
      }

      setEvents(
        events.map((event) =>
          event.id === eventId ? { ...event, is_public: !currentStatus } : event
        )
      );
    } catch (error) {
      console.log("Error updating event:", error);
      alert("Lỗi khi cập nhật trạng thái sự kiện");
    }
  };

  // Handle end event early with Vietnam timezone
  const handleEndEventEarly = async (eventId: string, eventTitle: string) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn kết thúc sự kiện "${eventTitle}" ngay bây giờ?`
      )
    ) {
      return;
    }

    try {
      // Get current time in Vietnam timezone and convert to UTC for database
      const now = new Date();
      const vietnamTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      );
      const vietnamTimeISO = vietnamTime.toISOString();

      const { error } = await (supabase as any)
        .from("events")
        .update({
          end_time: vietnamTimeISO,
          updated_at: vietnamTimeISO,
        })
        .eq("id", eventId);

      if (error) {
        throw error;
      }

      setEvents(
        events.map((event) =>
          event.id === eventId
            ? { ...event, end_time: vietnamTimeISO, updated_at: vietnamTimeISO }
            : event
        )
      );

      alert("Sự kiện đã được kết thúc sớm!");
    } catch (error) {
      console.log("Error ending event early:", error);
      alert("Lỗi khi kết thúc sự kiện sớm");
    }
  };

  // Format date with Vietnam timezone
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  // Get event status with Vietnam timezone
  const getEventStatus = (event: any) => {
    // Get current time in Vietnam timezone
    const now = new Date();
    const vietnamTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );

    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);

    if (event.is_cancelled) {
      return { text: "Đã hủy", color: "text-red-400", canEndEarly: false };
    }
    if (vietnamTime < startTime) {
      return {
        text: "Sắp diễn ra",
        color: "text-blue-400",
        canEndEarly: false,
      };
    }
    if (vietnamTime >= startTime && vietnamTime <= endTime) {
      return {
        text: "Đang diễn ra",
        color: "text-green-400",
        canEndEarly: true,
      };
    }
    return { text: "Đã kết thúc", color: "text-gray-400", canEndEarly: false };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80">Đang tải danh sách sự kiện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-xl">
                <FaCalendarAlt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Quản lý sự kiện
                </h1>
                <p className="text-white/80 text-lg">
                  Tổ chức, quản lý và theo dõi các sự kiện của câu lạc bộ
                </p>
              </div>
            </div>
            <Link
              href="/admin/events/create"
              className="px-6 py-3 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Tạo sự kiện
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4 group-focus-within:text-[#3b82f6] transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] placeholder-white/50 transition-all duration-300 hover:bg-white/15"
              />
            </div>

            {/* Event Type Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
              >
                <option value="all">Tất cả loại</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Meeting">Meeting</option>
                <option value="Competition">Competition</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="past">Đã kết thúc</option>
                <option value="cancelled">Đã hủy</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Results Count & Pagination Info */}
            <div className="flex items-center justify-between">
              <div className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white px-4 py-2 rounded-xl font-semibold">
                {filteredEvents.length} sự kiện
              </div>
              {totalPages > 1 && (
                <div className="text-white/70 text-sm">
                  Trang {currentPage} / {totalPages}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Events List */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {filteredEvents.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaCalendarAlt className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Chưa có sự kiện nào
            </h3>
            <p className="text-white/70 mb-8 text-lg">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Không tìm thấy sự kiện phù hợp với tiêu chí tìm kiếm"
                : "Hãy tạo sự kiện đầu tiên để bắt đầu"}
            </p>
            {!searchTerm && filterType === "all" && filterStatus === "all" && (
              <Link
                href="/admin/events/create"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
              >
                <FaPlus className="w-5 h-5" />
                Tạo sự kiện đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedEvents.map((event) => {
              const status = getEventStatus(event);
              return (
                <div
                  key={event.id}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group"
                >
                  {/* Event Card - Horizontal Layout */}
                  <div className="flex gap-6">
                    {/* Event Banner */}
                    {event.banner_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={event.banner_url}
                          alt={event.title}
                          className="w-32 h-24 object-cover rounded-xl shadow-lg"
                        />
                      </div>
                    )}

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      {/* Event Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/events/${event.id}`}
                            className="text-xl font-bold text-white mb-2 line-clamp-2 hover:text-[#3b82f6] transition-colors duration-300 cursor-pointer"
                          >
                            {event.title}
                          </Link>
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color} bg-white/20 backdrop-blur-sm`}
                            >
                              {status.text}
                            </span>
                            <span className="text-white/70 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
                              {event.event_type}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110"
                            title="Chỉnh sửa"
                          >
                            <FaEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300 hover:scale-110"
                            title="Xóa"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-3 mb-4">
                        {event.description && (
                          <p className="text-white/80 text-sm line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-white/70 text-sm bg-white/5 rounded-lg p-2">
                            <FaClock className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />
                            <span className="font-medium truncate">
                              {formatDate(event.start_time)} -{" "}
                              {formatDate(event.end_time)}
                            </span>
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-2 text-white/70 text-sm bg-white/5 rounded-lg p-2">
                              <FaMapMarkerAlt className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />
                              <span className="font-medium truncate">
                                {event.location}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-white/70 text-sm bg-white/5 rounded-lg p-2">
                            <FaUsers className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />
                            <span className="font-medium">
                              {event.registered_count || 0}/{event.capacity}{" "}
                              người
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleTogglePublic(event.id, event.is_public)
                        }
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                          event.is_public
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                        }`}
                      >
                        {event.is_public ? "Công khai" : "Riêng tư"}
                      </button>

                      {status.canEndEarly && (
                        <button
                          onClick={() =>
                            handleEndEventEarly(event.id, event.title)
                          }
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all duration-300 flex items-center gap-2 hover:scale-105"
                          title="Kết thúc sự kiện sớm"
                        >
                          <FaStop className="w-3 h-3" />
                          Kết thúc sớm
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="p-3 text-white/60 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
                        title="Chỉnh sửa"
                      >
                        <FaEdit className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/events/${event.id}`}
                        className="p-3 text-white/60 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
                        title="Xem chi tiết"
                      >
                        <FaEye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  title="Trang trước"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 2) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNumber = totalPages - 2 + i;
                    } else {
                      pageNumber = currentPage - 1 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          currentPage === pageNumber
                            ? "bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white"
                            : "text-white/70 hover:text-white hover:bg-white/20"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  title="Trang sau"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Page Info */}
              <div className="text-center text-white/60 text-sm mt-3">
                Hiển thị {startIndex + 1}-
                {Math.min(endIndex, filteredEvents.length)} trong{" "}
                {filteredEvents.length} sự kiện
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;
