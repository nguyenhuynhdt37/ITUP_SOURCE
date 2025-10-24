"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FaBookmark,
  FaCalendarAlt,
  FaClock,
  FaExternalLinkAlt,
  FaHeart,
  FaMapMarkerAlt,
  FaSearch,
  FaShare,
  FaSort,
  FaTag,
  FaUsers,
} from "react-icons/fa";

interface Event {
  id: string;
  title: string;
  description: string;
  content: string;
  banner_url: string;
  location: string;
  start_time: string;
  end_time: string;
  event_type: string;
  organizer_name: string;
  capacity: number;
  registered_count: number;
  registration_url: string;
  is_public: boolean;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("start_time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Set<string>>(
    new Set()
  );
  const [timeLeft, setTimeLeft] = useState<{
    [key: string]: {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    };
  }>({});

  // Event types
  const eventTypes = [
    { value: "all", label: "Tất cả", icon: FaTag, color: "bg-gray-500" },
    { value: "Workshop", label: "Workshop", icon: FaTag, color: "bg-blue-500" },
    { value: "Seminar", label: "Seminar", icon: FaTag, color: "bg-green-500" },
    { value: "Meeting", label: "Meeting", icon: FaTag, color: "bg-blue-500" },
    {
      value: "Competition",
      label: "Competition",
      icon: FaTag,
      color: "bg-green-500",
    },
    { value: "Other", label: "Other", icon: FaTag, color: "bg-gray-500" },
  ];

  // Sort options
  const sortOptions = [
    { value: "start_time", label: "Thời gian" },
    { value: "title", label: "Tiêu đề" },
    { value: "capacity", label: "Sức chứa" },
    { value: "registered_count", label: "Đã đăng ký" },
  ];

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_public", true)
        .eq("is_cancelled", false)
        .order("start_time", { ascending: true });

      if (error) {
        console.log("Error fetching events:", error);
        // Use mock data if database error
        setEvents(getMockEvents());
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.log("Error fetching events:", error);
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const getMockEvents = (): Event[] => [
    {
      id: "1",
      title: "Workshop: Làm quen với Trí tuệ Nhân tạo cùng Gemini",
      description:
        "Buổi học nhập môn về AI và công cụ Gemini do CLB ITUP tổ chức dành cho sinh viên yêu thích công nghệ.",
      content:
        '<p>CLB ITUP phối hợp cùng Google Developer Group Vinh tổ chức workshop <b>"Làm quen với Trí tuệ Nhân tạo cùng Gemini"</b>. Sinh viên sẽ được trải nghiệm tạo chatbot, sinh ảnh, và nhúng embedding vào ứng dụng thực tế. Hướng dẫn bởi <b>Nguyễn Xuân Huỳnh</b> – Phó Chủ nhiệm CLB.</p>',
      banner_url:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
      location: "Phòng 205, Nhà A1 – Đại học Vinh",
      start_time: "2025-11-02T08:00:00+07:00",
      end_time: "2025-11-02T10:30:00+07:00",
      event_type: "Workshop",
      organizer_name: "Nguyễn Xuân Huỳnh",
      capacity: 120,
      registered_count: 85,
      registration_url: "https://forms.gle/itup-gemini-ai",
      is_public: true,
      is_cancelled: false,
      created_at: "2025-10-01T00:00:00+07:00",
      updated_at: "2025-10-01T00:00:00+07:00",
    },
    {
      id: "2",
      title: "Cuộc thi Code for Future 2025 – Vòng Bán kết",
      description:
        "Cuộc thi lập trình đổi mới sáng tạo do CLB ITUP tổ chức bước vào vòng bán kết với 12 đội thi.",
      content:
        "<p><b>Code for Future 2025</b> là cuộc thi lập trình thường niên của CLB ITUP. Vòng bán kết sẽ diễn ra trực tiếp tại <b>Phòng Hội thảo A0</b> với sự tham gia của 12 đội xuất sắc nhất.</p>",
      banner_url:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800",
      location: "Phòng Hội thảo A0 – Đại học Vinh",
      start_time: "2025-11-15T08:00:00+07:00",
      end_time: "2025-11-15T11:30:00+07:00",
      event_type: "Competition",
      organizer_name: "Đặng Ngọc Anh",
      capacity: 200,
      registered_count: 150,
      registration_url: "https://forms.gle/itup-codefuture",
      is_public: true,
      is_cancelled: false,
      created_at: "2025-10-01T00:00:00+07:00",
      updated_at: "2025-10-01T00:00:00+07:00",
    },
    {
      id: "3",
      title: "Giao lưu CLB ITUP & CLB AI Đại học Bách Khoa",
      description:
        'Sự kiện giao lưu học thuật về chủ đề "AI trong giáo dục" giữa sinh viên hai trường.',
      content:
        "<p>CLB ITUP sẽ tổ chức buổi <b>giao lưu trực tuyến</b> với CLB AI – Đại học Bách Khoa Hà Nội. Chủ đề xoay quanh ứng dụng AI trong học tập, giảng dạy và nghiên cứu khoa học.</p>",
      banner_url:
        "https://images.unsplash.com/photo-1603570417038-215912dffa8e?w=800",
      location: "Google Meet – Link gửi qua email đăng ký",
      start_time: "2025-11-20T19:00:00+07:00",
      end_time: "2025-11-20T21:00:00+07:00",
      event_type: "Seminar",
      organizer_name: "Hoàng Thị Đoan",
      capacity: 150,
      registered_count: 120,
      registration_url: "https://forms.gle/itup-aitalk",
      is_public: true,
      is_cancelled: false,
      created_at: "2025-10-01T00:00:00+07:00",
      updated_at: "2025-10-01T00:00:00+07:00",
    },
    {
      id: "4",
      title: "Buổi hướng dẫn Resume & Portfolio cho sinh viên CNTT",
      description:
        "Buổi mentoring giúp sinh viên viết CV chuyên nghiệp và xây dựng portfolio cá nhân ấn tượng.",
      content:
        '<p>Chương trình <b>"Resume & Portfolio"</b> hướng dẫn cách tạo CV kỹ thuật, trình bày dự án và sử dụng GitHub Pages hoặc Notion để giới thiệu bản thân.</p>',
      banner_url:
        "https://images.unsplash.com/photo-1554774853-d50f6c003e2a?w=800",
      location: "Phòng 206 – Nhà A1, Đại học Vinh",
      start_time: "2025-11-27T14:00:00+07:00",
      end_time: "2025-11-27T16:00:00+07:00",
      event_type: "Workshop",
      organizer_name: "Võ Tạ Đức",
      capacity: 100,
      registered_count: 75,
      registration_url: "https://forms.gle/itup-resume",
      is_public: true,
      is_cancelled: false,
      created_at: "2025-10-01T00:00:00+07:00",
      updated_at: "2025-10-01T00:00:00+07:00",
    },
    {
      id: "5",
      title: "ITUP Year End Party 2025 – Tổng kết và trao giải",
      description:
        "Buổi tổng kết hoạt động năm và trao học bổng CLB ITUP Talent cho các thành viên xuất sắc.",
      content:
        "<p>CLB ITUP tổ chức <b>Year End Party 2025</b> nhằm tổng kết hoạt động, vinh danh các cá nhân tiêu biểu và thảo luận kế hoạch năm mới.</p>",
      banner_url:
        "https://images.unsplash.com/photo-1515162305280-9bcec0a17f7a?w=800",
      location: "Hội trường lớn A0 – Đại học Vinh",
      start_time: "2025-12-28T18:00:00+07:00",
      end_time: "2025-12-28T21:00:00+07:00",
      event_type: "Meeting",
      organizer_name: "Đặng Ngọc Anh",
      capacity: 250,
      registered_count: 200,
      registration_url: "https://forms.gle/itup-party2025",
      is_public: true,
      is_cancelled: false,
      created_at: "2025-10-01T00:00:00+07:00",
      updated_at: "2025-10-01T00:00:00+07:00",
    },
  ];

  // Load liked and bookmarked events from localStorage
  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedEvents") || "[]");
    const bookmarked = JSON.parse(
      localStorage.getItem("bookmarkedEvents") || "[]"
    );
    setLikedEvents(new Set(liked));
    setBookmarkedEvents(new Set(bookmarked));
  }, []);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const newTimeLeft: {
        [key: string]: {
          days: number;
          hours: number;
          minutes: number;
          seconds: number;
        };
      } = {};

      events.forEach((event) => {
        const now = new Date().getTime();
        const startTime = new Date(event.start_time).getTime();
        const timeDiff = startTime - now;

        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

          newTimeLeft[event.id] = { days, hours, minutes, seconds };
        } else {
          newTimeLeft[event.id] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
      });

      setTimeLeft(newTimeLeft);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [events]);

  // Filter and sort events
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "all" || event.event_type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case "start_time":
          aValue = new Date(a.start_time).getTime();
          bValue = new Date(b.start_time).getTime();
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "capacity":
          aValue = a.capacity;
          bValue = b.capacity;
          break;
        case "registered_count":
          aValue = a.registered_count;
          bValue = b.registered_count;
          break;
        default:
          return 0;
      }

      if (sortBy === "title") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

  // Pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // Handle like
  const handleLike = (eventId: string) => {
    const newLikedEvents = new Set(likedEvents);
    if (newLikedEvents.has(eventId)) {
      newLikedEvents.delete(eventId);
    } else {
      newLikedEvents.add(eventId);
    }
    setLikedEvents(newLikedEvents);
    localStorage.setItem("likedEvents", JSON.stringify([...newLikedEvents]));
  };

  // Handle bookmark
  const handleBookmark = (eventId: string) => {
    const newBookmarkedEvents = new Set(bookmarkedEvents);
    if (newBookmarkedEvents.has(eventId)) {
      newBookmarkedEvents.delete(eventId);
    } else {
      newBookmarkedEvents.add(eventId);
    }
    setBookmarkedEvents(newBookmarkedEvents);
    localStorage.setItem(
      "bookmarkedEvents",
      JSON.stringify([...newBookmarkedEvents])
    );
  };

  // Handle share
  const handleShare = (event: Event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link đã được sao chép!");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Workshop: "bg-blue-500",
      Seminar: "bg-green-500",
      Meeting: "bg-blue-500",
      Competition: "bg-green-500",
      Other: "bg-gray-500",
    };
    return colors[type] || "bg-gray-500";
  };

  // Get registration status
  const getRegistrationStatus = (event: Event) => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);

    if (now < startTime) {
      return "upcoming";
    } else if (now >= startTime && now <= endTime) {
      return "ongoing";
    } else {
      return "ended";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Đang tải sự kiện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Sự Kiện IT UP
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Khám phá các sự kiện, workshop và cuộc thi thú vị do CLB IT UP tổ
            chức
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Event Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {eventTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                  className="bg-gray-800"
                >
                  {type.label}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-gray-800"
                >
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white hover:bg-white/30 transition-colors flex items-center justify-center space-x-2"
            >
              <FaSort />
              <span>{sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}</span>
            </button>
          </div>
        </div>

        {/* Events Horizontal List */}
        <div className="space-y-6">
          {currentEvents.map((event) => {
            const status = getRegistrationStatus(event);
            const isLiked = likedEvents.has(event.id);
            const isBookmarked = bookmarkedEvents.has(event.id);

            return (
              <div
                key={event.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Event Image */}
                  <div className="relative md:w-80 h-48 md:h-auto overflow-hidden">
                    <img
                      src={event.banner_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Event Type Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getEventTypeColor(
                          event.event_type
                        )}`}
                      >
                        {event.event_type}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                          status === "upcoming"
                            ? "bg-green-500"
                            : status === "ongoing"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {status === "upcoming"
                          ? "Sắp diễn ra"
                          : status === "ongoing"
                          ? "Đang diễn ra"
                          : "Đã kết thúc"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute bottom-4 right-4 flex space-x-2">
                      <button
                        onClick={() => handleLike(event.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                          isLiked
                            ? "bg-red-500 text-white"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        <FaHeart className={isLiked ? "fill-current" : ""} />
                      </button>
                      <button
                        onClick={() => handleBookmark(event.id)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                          isBookmarked
                            ? "bg-yellow-500 text-white"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        <FaBookmark
                          className={isBookmarked ? "fill-current" : ""}
                        />
                      </button>
                      <button
                        onClick={() => handleShare(event)}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                      >
                        <FaShare />
                      </button>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3">
                          {event.title}
                        </h3>

                        <p className="text-gray-300 mb-6 line-clamp-2">
                          {event.description}
                        </p>

                        {/* Countdown Timer */}
                        {status === "upcoming" && timeLeft[event.id] && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">
                              Sự kiện bắt đầu sau:
                            </h4>
                            <div className="flex space-x-3">
                              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-lg">
                                <div className="text-2xl font-bold text-white">
                                  {timeLeft[event.id].days
                                    .toString()
                                    .padStart(2, "0")}
                                </div>
                                <div className="text-xs text-blue-100">
                                  Ngày
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-lg">
                                <div className="text-2xl font-bold text-white">
                                  {timeLeft[event.id].hours
                                    .toString()
                                    .padStart(2, "0")}
                                </div>
                                <div className="text-xs text-blue-100">Giờ</div>
                              </div>
                              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-lg">
                                <div className="text-2xl font-bold text-white">
                                  {timeLeft[event.id].minutes
                                    .toString()
                                    .padStart(2, "0")}
                                </div>
                                <div className="text-xs text-blue-100">
                                  Phút
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-lg">
                                <div className="text-2xl font-bold text-white">
                                  {timeLeft[event.id].seconds
                                    .toString()
                                    .padStart(2, "0")}
                                </div>
                                <div className="text-xs text-blue-100">
                                  Giây
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Event Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center text-gray-300">
                            <FaCalendarAlt className="w-4 h-4 mr-3 text-blue-400" />
                            <span className="text-sm">
                              {formatDate(event.start_time)}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-300">
                            <FaClock className="w-4 h-4 mr-3 text-blue-400" />
                            <span className="text-sm">
                              {formatTime(event.start_time)} -{" "}
                              {formatTime(event.end_time)}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-300">
                            <FaMapMarkerAlt className="w-4 h-4 mr-3 text-blue-400" />
                            <span className="text-sm">{event.location}</span>
                          </div>

                          <div className="flex items-center text-gray-300">
                            <FaUsers className="w-4 h-4 mr-3 text-blue-400" />
                            <span className="text-sm">
                              {event.registered_count}/{event.capacity} người
                              đăng ký
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Registration Button */}
                      {status !== "ended" && (
                        <Link
                          href={`/events/${event.id}`}
                          className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white py-3 px-6 rounded-lg font-medium hover:from-[#1e3a8a] hover:to-[#2563eb] transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <FaExternalLinkAlt />
                          <span>Đăng ký tham gia</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === index + 1
                      ? "bg-blue-500 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}

        {/* No Events Message */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Không tìm thấy sự kiện
            </h3>
            <p className="text-gray-300">
              Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
