"use client";

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import {
  FaBook,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCode,
  FaRocket,
  FaUsers,
} from "react-icons/fa";

const HomePage = () => {
  const router = useRouter();
  // State for upcoming event
  const [upcomingEvent, setUpcomingEvent] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // State for news
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for documents
  const [documentsData, setDocumentsData] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  // State for events list
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // State for events slider
  const [currentEventSlide, setCurrentEventSlide] = useState(0);

  // Fetch current or upcoming event
  const fetchUpcomingEvent = async () => {
    try {
      const now = new Date();
      const vietnamTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      );
      const nowISO = vietnamTime.toISOString();

      // First, try to find an event that is currently happening
      const { data: currentEvent, error: currentError } = await supabase
        .from("events")
        .select("*")
        .eq("is_public", true)
        .eq("is_cancelled", false)
        .lte("start_time", nowISO)
        .gte("end_time", nowISO)
        .order("start_time", { ascending: true })
        .limit(1)
        .single();

      if (currentEvent && !currentError) {
        // Event is currently happening
        setUpcomingEvent({
          ...(currentEvent as any),
          isCurrentlyHappening: true,
        });
        return;
      }

      // If no current event, find the next upcoming event
      const { data: upcomingEvent, error: upcomingError } = await supabase
        .from("events")
        .select("*")
        .eq("is_public", true)
        .eq("is_cancelled", false)
        .gte("start_time", nowISO)
        .order("start_time", { ascending: true })
        .limit(1)
        .single();

      if (upcomingEvent && !upcomingError) {
        setUpcomingEvent({
          ...(upcomingEvent as any),
          isCurrentlyHappening: false,
        });
        return;
      }

      // If no events found, use mock data
      setUpcomingEvent({
        id: "1",
        title: "Workshop: Làm quen với Trí tuệ Nhân tạo cùng Gemini",
        start_time: "2025-11-02T08:00:00+07:00",
        location: "Phòng 205, Nhà A1 – Đại học Vinh",
        event_type: "Workshop",
        isCurrentlyHappening: false,
      });
    } catch (error) {
      console.log("Error fetching events:", error);
      setUpcomingEvent({
        id: "1",
        title: "Workshop: Làm quen với Trí tuệ Nhân tạo cùng Gemini",
        start_time: "2025-11-02T08:00:00+07:00",
        location: "Phòng 205, Nhà A1 – Đại học Vinh",
        event_type: "Workshop",
        isCurrentlyHappening: false,
      });
    }
  };

  // Fetch news from database
  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(10);

      if (error) {
        console.log("Error fetching news:", error);
        // Use mock data if database error
        setNewsData([
          {
            id: 1,
            title: "Câu lạc bộ IT UP tổ chức workshop 'Lập trình Web hiện đại'",
            excerpt:
              "Workshop hướng dẫn các công nghệ web mới nhất như React, Next.js và TypeScript...",
            date: "15/12/2024",
            image: "/api/placeholder/400/250",
            category: "Workshop",
            slug: "workshop-lap-trinh-web-hien-dai",
          },
          {
            id: 2,
            title: "Cuộc thi Hackathon 'Innovation Challenge 2024'",
            excerpt:
              "Cuộc thi lập trình 48h với chủ đề 'Giải pháp số cho giáo dục'...",
            date: "10/12/2024",
            image: "/api/placeholder/400/250",
            category: "Competition",
            slug: "hackathon-innovation-challenge-2024",
          },
          {
            id: 3,
            title: "Chương trình mentoring cho sinh viên năm nhất",
            excerpt:
              "Kết nối sinh viên mới với các anh chị có kinh nghiệm trong lĩnh vực IT...",
            date: "05/12/2024",
            image: "/api/placeholder/400/250",
            category: "Mentoring",
            slug: "chuong-trinh-mentoring-sinh-vien-nam-nhat",
          },
        ]);
        return;
      }

      // Transform data to match component structure
      const transformedData = (data as any[]).map((news: any) => ({
        id: news.id,
        title: news.title,
        excerpt: news.summary || news.content?.substring(0, 100) + "...",
        date: new Date(news.published_at || news.created_at).toLocaleDateString(
          "vi-VN"
        ),
        image: news.thumbnail_url || "/api/placeholder/400/250",
        category: news.tags?.[0] || "News",
        slug: news.slug,
      }));

      setNewsData(transformedData);
    } catch (error) {
      console.log("Error fetching news:", error);
      // Use mock data if database error
      setNewsData([
        {
          id: 1,
          title: "Câu lạc bộ IT UP tổ chức workshop 'Lập trình Web hiện đại'",
          excerpt:
            "Workshop hướng dẫn các công nghệ web mới nhất như React, Next.js và TypeScript...",
          date: "15/12/2024",
          image: "/api/placeholder/400/250",
          category: "Workshop",
          slug: "workshop-lap-trinh-web-hien-dai",
        },
        {
          id: 2,
          title: "Cuộc thi Hackathon 'Innovation Challenge 2024'",
          excerpt:
            "Cuộc thi lập trình 48h với chủ đề 'Giải pháp số cho giáo dục'...",
          date: "10/12/2024",
          image: "/api/placeholder/400/250",
          category: "Competition",
          slug: "hackathon-innovation-challenge-2024",
        },
        {
          id: 3,
          title: "Chương trình mentoring cho sinh viên năm nhất",
          excerpt:
            "Kết nối sinh viên mới với các anh chị có kinh nghiệm trong lĩnh vực IT...",
          date: "05/12/2024",
          image: "/api/placeholder/400/250",
          category: "Mentoring",
          slug: "chuong-trinh-mentoring-sinh-vien-nam-nhat",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!upcomingEvent) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      let timeDiff: number;

      if (upcomingEvent.isCurrentlyHappening) {
        // For current event, count down to end time
        const endTime = new Date(upcomingEvent.end_time).getTime();
        timeDiff = endTime - now;
      } else {
        // For upcoming event, count down to start time
        const startTime = new Date(upcomingEvent.start_time).getTime();
        timeDiff = startTime - now;
      }

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [upcomingEvent]);

  // Fetch documents from database
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const { data, error } = await supabase
        .from("resources")
        .select(
          "id, title, description, file_type, file_size, category, thumbnail_url, created_at"
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) {
        console.log("Error fetching documents:", error);
        // Use mock data if database error
        setDocumentsData([
          {
            id: 1,
            title: "Quy chế hoạt động Câu lạc bộ IT UP",
            file_type: "PDF",
            file_size: 2411520, // 2.3 MB in bytes
            category: "Quy chế",
          },
          {
            id: 2,
            title: "Hướng dẫn tham gia các hoạt động",
            file_type: "PDF",
            file_size: 1887436, // 1.8 MB
            category: "Hướng dẫn",
          },
          {
            id: 3,
            title: "Tài liệu học tập - Lập trình Python",
            file_type: "ZIP",
            file_size: 47448678, // 45.2 MB
            category: "Học tập",
          },
          {
            id: 4,
            title: "Slide bài giảng - Web Development",
            file_type: "PPTX",
            file_size: 12689817, // 12.1 MB
            category: "Học tập",
          },
        ]);
        return;
      }

      setDocumentsData(data || []);
    } catch (error) {
      console.log("Error fetching documents:", error);
      setDocumentsData([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Fetch events list from database (only current and upcoming events)
  const fetchEventsList = async () => {
    try {
      setEventsLoading(true);
      const now = new Date();
      const vietnamTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      );
      const nowISO = vietnamTime.toISOString();

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, description, start_time, end_time, location, event_type, banner_url"
        )
        .eq("is_public", true)
        .eq("is_cancelled", false)
        .gt("start_time", nowISO) // Only upcoming events (not currently happening)
        .order("start_time", { ascending: true })
        .limit(6);

      if (error) {
        console.log("Error fetching events:", error);
        setEventsData([]);
        return;
      }

      setEventsData(data || []);
    } catch (error) {
      console.log("Error fetching events:", error);
      setEventsData([]);
    } finally {
      setEventsLoading(false);
    }
  };

  // Events slider functions
  const nextEventSlide = () => {
    setCurrentEventSlide((prev) =>
      prev === eventsData.length - 1 ? 0 : prev + 1
    );
  };

  const prevEventSlide = () => {
    setCurrentEventSlide((prev) =>
      prev === 0 ? eventsData.length - 1 : prev - 1
    );
  };

  const goToEventSlide = (index: number) => {
    setCurrentEventSlide(index);
  };

  // Auto-play slider
  useEffect(() => {
    if (eventsData.length <= 1) return;

    const interval = setInterval(() => {
      nextEventSlide();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [eventsData.length]);

  // Fetch data on component mount
  useEffect(() => {
    fetchUpcomingEvent();
    fetchNews();
    fetchDocuments();
    fetchEventsList();
  }, []);

  // Activities section removed per request

  // Only enable infinite loop when there are 4 or more items
  const shouldLoop = newsData.length >= 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]">
      {/* Hero Section - Large Banner */}
      <section className="relative bg-gradient-to-r from-[#1a1a4d] via-[#2d2d6d] to-[#1a1a4d] text-white py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#3b82f6]/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-[#3b82f6]/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-[#3b82f6]/20 rounded-full animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight animate-fade-in">
                <span className="bg-gradient-to-r from-white via-[#3b82f6] to-white bg-clip-text text-transparent">
                  CHÀO MỪNG
                </span>
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-[#3b82f6] animate-bounce">
                CÂU LẠC BỘ IT UP
              </h2>
              <h3 className="text-2xl md:text-3xl font-semibold mb-8 text-[#3b82f6] animate-pulse">
                BÌNH DÂN HỌC VỤ SỐ
              </h3>
            </div>

            {/* Status Banner with Animation */}
            <div className="bg-gradient-to-r from-[#1a1a4d] to-[#1a1a4d] text-white px-8 py-4 rounded-full text-xl font-bold mb-8 inline-block animate-pulse shadow-2xl">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-white rounded-full mr-3 animate-ping"></div>
                Hiện đang hoạt động
              </span>
            </div>

            <p className="text-xl md:text-2xl mb-12 text-[#3b82f6] max-w-4xl mx-auto leading-relaxed animate-fade-in">
              Nơi kết nối, học hỏi và phát triển kỹ năng công nghệ thông tin.
              Câu lạc bộ trực thuộc Đoàn Trường Đại học Vinh.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-bounce">
              <Link
                href="/join"
                className="bg-gradient-to-r from-[#1a1a4d] to-[#1a1a4d] hover:from-[#000033] hover:to-[#000033] text-white px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl transform hover:-translate-y-1"
              >
                Tham gia ngay
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white hover:bg-white hover:text-[#3b82f6] px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-110 transform hover:-translate-y-1"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      {upcomingEvent && (
        <section className="py-20 bg-gradient-to-r from-[#1a1a4d] to-[#2d2d6d] text-white relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 animate-pulse">
              <span className="bg-gradient-to-r from-white via-[#60a5fa] to-white bg-clip-text text-transparent">
                {upcomingEvent.isCurrentlyHappening
                  ? "Sự kiện đang diễn ra"
                  : "Sự kiện sắp tới"}
              </span>
            </h2>
            <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 max-w-5xl mx-auto border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-4 right-4 w-20 h-20 bg-[#60a5fa]/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-[#3b82f6]/20 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
              </div>

              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">
                  {upcomingEvent.title}
                </h3>
                <p className="text-xl mb-8 text-white/90">
                  🕒{" "}
                  {new Date(upcomingEvent.start_time).toLocaleDateString(
                    "vi-VN",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}{" "}
                  - 📍 {upcomingEvent.location}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                <div
                  className={`rounded-2xl p-6 text-center shadow-xl hover:scale-110 transition-all duration-500 border border-white/20 backdrop-blur-sm relative overflow-hidden group ${
                    upcomingEvent.isCurrentlyHappening
                      ? "bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]"
                      : "bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]"
                  }`}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {timeLeft.days.toString().padStart(2, "0")}
                    </div>
                    <div className="text-sm font-semibold text-white/90">
                      {upcomingEvent.isCurrentlyHappening
                        ? "Ngày còn lại"
                        : "Ngày"}
                    </div>
                  </div>
                </div>
                <div
                  className={`rounded-2xl p-6 text-center shadow-xl hover:scale-110 transition-all duration-500 border border-white/20 backdrop-blur-sm relative overflow-hidden group ${
                    upcomingEvent.isCurrentlyHappening
                      ? "bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]"
                      : "bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {timeLeft.hours.toString().padStart(2, "0")}
                    </div>
                    <div className="text-sm font-semibold text-white/90">
                      {upcomingEvent.isCurrentlyHappening
                        ? "Giờ còn lại"
                        : "Giờ"}
                    </div>
                  </div>
                </div>
                <div
                  className={`rounded-2xl p-6 text-center shadow-xl hover:scale-110 transition-all duration-500 border border-white/20 backdrop-blur-sm relative overflow-hidden group ${
                    upcomingEvent.isCurrentlyHappening
                      ? "bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]"
                      : "bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {timeLeft.minutes.toString().padStart(2, "0")}
                    </div>
                    <div className="text-sm font-semibold text-white/90">
                      {upcomingEvent.isCurrentlyHappening
                        ? "Phút còn lại"
                        : "Phút"}
                    </div>
                  </div>
                </div>
                <div
                  className={`rounded-2xl p-6 text-center shadow-xl hover:scale-110 transition-all duration-500 border border-white/20 backdrop-blur-sm relative overflow-hidden group ${
                    upcomingEvent.isCurrentlyHappening
                      ? "bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]"
                      : "bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                      {timeLeft.seconds.toString().padStart(2, "0")}
                    </div>
                    <div className="text-sm font-semibold text-white/90">
                      {upcomingEvent.isCurrentlyHappening
                        ? "Giây còn lại"
                        : "Giây"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 relative z-10">
                <Link
                  href={`/events/${upcomingEvent.id}`}
                  className={`text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-500 inline-block relative overflow-hidden group shadow-xl hover:shadow-2xl hover:scale-105 transform ${
                    upcomingEvent.isCurrentlyHappening
                      ? "bg-gradient-to-r from-[#1a1a4d] to-[#2d2d6d] hover:from-[#000033] hover:to-[#1a1a4d]"
                      : "bg-gradient-to-r from-[#1a1a4d] to-[#2d2d6d] hover:from-[#000033] hover:to-[#1a1a4d]"
                  }`}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center">
                    {upcomingEvent.isCurrentlyHappening
                      ? "Tham gia sự kiện"
                      : "Xem chi tiết sự kiện"}
                    <div className="ml-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Introduction Section */}
      <section className="py-20 bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Giới thiệu Câu lạc bộ
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-white leading-relaxed mb-6">
                Câu lạc bộ IT UP - Bình dân học vụ số trực thuộc Đoàn Trường Đại
                học Vinh là nơi kết nối, học hỏi và phát triển kỹ năng công nghệ
                thông tin. Chúng tôi tạo ra môi trường học tập tích cực, khuyến
                khích sự sáng tạo và đổi mới trong lĩnh vực công nghệ.
              </p>
              <p className="text-lg text-white leading-relaxed">
                Với khẩu hiệu hành động "Trung thực - Trách nhiệm - Say mê -
                Sáng tạo - Hợp tác", Câu lạc bộ IT UP là nơi thể hiện tinh thần
                đoàn kết, sáng tạo và trách nhiệm của sinh viên trong việc chủ
                động học tập, nghiên cứu và làm chủ công nghệ.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-lg hover:shadow-lg transition-all duration-300 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Lập trình & Phát triển
              </h3>
              <p className="text-white">
                Học tập và thực hành các ngôn ngữ lập trình hiện đại, phát triển
                ứng dụng web và mobile
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-lg hover:shadow-lg transition-all duration-300 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Cộng đồng học tập
              </h3>
              <p className="text-white">
                Kết nối với các thành viên có cùng đam mê, chia sẻ kiến thức và
                kinh nghiệm
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-lg hover:shadow-lg transition-all duration-300 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Đổi mới sáng tạo
              </h3>
              <p className="text-white">
                Tham gia các dự án thực tế, hackathon và cuộc thi lập trình
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events List Section - Only show if there are upcoming events */}
      {eventsData.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] text-white relative overflow-visible">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white via-[#60a5fa] to-white bg-clip-text text-transparent">
                  Sự kiện sắp tới
                </span>
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Các hoạt động và sự kiện sắp diễn ra của Câu lạc bộ IT UP
              </p>
            </div>

            {eventsLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="relative">
                {/* Events Slider */}
                <div className="relative overflow-hidden rounded-3xl">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentEventSlide * 100}%)`,
                    }}
                  >
                    {eventsData.map((event, index) => {
                      const startDate = new Date(event.start_time);
                      const isUpcoming = startDate > new Date();

                      return (
                        <div
                          key={event.id}
                          className="w-full flex-shrink-0 relative"
                        >
                          <div className="relative h-[500px] md:h-[600px] overflow-hidden">
                            {event.banner_url ? (
                              <Image
                                src={event.banner_url}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#3b82f6] to-[#60a5fa]"></div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex items-center">
                              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                <div className="max-w-4xl">
                                  {/* Event Status Badge */}
                                  <div className="mb-6">
                                    {isUpcoming ? (
                                      <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#1a1a4d] to-[#2d2d6d] text-white font-semibold text-sm shadow-lg border border-white/20">
                                        <FaCalendarAlt className="w-3 h-3 mr-2" />
                                        Sắp diễn ra
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white font-semibold text-sm">
                                        <FaCalendarAlt className="w-3 h-3 mr-2" />
                                        {event.event_type || "Sự kiện"}
                                      </span>
                                    )}
                                  </div>

                                  {/* Event Title */}
                                  <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                                    {event.title}
                                  </h3>

                                  {/* Event Details */}
                                  <div className="flex flex-wrap gap-6 mb-8">
                                    <div className="flex items-center text-white bg-black/30 backdrop-blur-sm rounded-lg px-4 py-3">
                                      <FaCalendarAlt className="w-5 h-5 mr-3 text-[#60a5fa]" />
                                      <div>
                                        <div className="font-semibold text-sm">
                                          {startDate.toLocaleDateString(
                                            "vi-VN",
                                            {
                                              weekday: "long",
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric",
                                            }
                                          )}
                                        </div>
                                        <div className="text-xs text-white/80">
                                          {startDate.toLocaleTimeString(
                                            "vi-VN",
                                            {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            }
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {event.location && (
                                      <div className="flex items-center text-white bg-black/30 backdrop-blur-sm rounded-lg px-4 py-3">
                                        <span className="text-xl mr-3">📍</span>
                                        <div>
                                          <div className="font-semibold text-sm">
                                            Địa điểm
                                          </div>
                                          <div className="text-xs text-white/80">
                                            {event.location}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Action Button */}
                                  <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                      onClick={() =>
                                        router.push(`/events/${event.id}`)
                                      }
                                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#1a1a4d] to-[#2d2d6d] hover:from-[#000033] hover:to-[#1a1a4d] text-white font-bold text-lg rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-xl border border-white/20"
                                    >
                                      Xem chi tiết
                                      <FaChevronRight className="ml-2 w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation Arrows */}
                  {eventsData.length > 1 && (
                    <>
                      <button
                        onClick={prevEventSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-lg rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-10 opacity-70 hover:opacity-100"
                      >
                        <FaChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        onClick={nextEventSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-lg rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-10 opacity-70 hover:opacity-100"
                      >
                        <FaChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Dots Navigation */}
                  {eventsData.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
                      {eventsData.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToEventSlide(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentEventSlide
                              ? "bg-white scale-125"
                              : "bg-white/50 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* News Section */}
      <section className="py-20 bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] relative overflow-visible">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              Tin tức Câu lạc bộ
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Cập nhật những hoạt động, sự kiện và tin tức mới nhất từ Câu lạc
              bộ IT UP
            </p>
          </div>

          {/* Horizontal Scrolling News */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : shouldLoop ? (
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll-right space-x-6">
                {newsData.map((news, index) => (
                  <div
                    onClick={() => {
                      router.push(`/news/${news.slug}`);
                    }}
                    key={news.id}
                    className="flex-shrink-0 w-80 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 group cursor-pointer"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={news.image}
                        alt={news.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          {news.category}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-3 text-white line-clamp-2 group-hover:text-[#60a5fa] transition-colors duration-200">
                        {news.title}
                      </h3>
                      <p className="text-white/80 mb-4 line-clamp-3 text-sm">
                        {news.excerpt}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/60 flex items-center">
                          <FaCalendarAlt className="mr-2" />
                          {news.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Duplicate for seamless loop */}
                {newsData.map((news, index) => (
                  <div
                    onClick={() => {
                      router.push(`/news/${news.slug}`);
                    }}
                    key={`duplicate-${news.id}`}
                    className="flex-shrink-0 w-80 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 group cursor-pointer"
                    style={{
                      animationDelay: `${(index + newsData.length) * 0.1}s`,
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={news.image}
                        alt={news.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          {news.category}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-3 text-white line-clamp-2 group-hover:text-[#60a5fa] transition-colors duration-200">
                        {news.title}
                      </h3>
                      <p className="text-white/80 mb-4 line-clamp-3 text-sm">
                        {news.excerpt}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/60 flex items-center">
                          <FaCalendarAlt className="mr-2" />
                          {news.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex space-x-6">
                {newsData.map((news) => (
                  <div
                    onClick={() => {
                      router.push(`/news/${news.slug}`);
                    }}
                    key={news.id}
                    className="flex-shrink-0 w-80 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 group cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={news.image}
                        alt={news.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          {news.category}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-3 text-white line-clamp-2 group-hover:text-[#60a5fa] transition-colors duration-200">
                        {news.title}
                      </h3>
                      <p className="text-white/80 mb-4 line-clamp-3 text-sm">
                        {news.excerpt}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/60 flex items-center">
                          <FaCalendarAlt className="mr-2" />
                          {news.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Documents Section (ITUP Style) */}
      <section className="py-20 bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] text-white relative overflow-visible">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 animate-fade-in">
              <span className="bg-gradient-to-r from-white via-[#60a5fa] to-white bg-clip-text text-transparent">
                Tài liệu về Câu lạc bộ
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Tài liệu học tập, quy chế hoạt động và các tài nguyên hữu ích cho
              thành viên
            </p>
          </div>

          {documentsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : documentsData.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/60 text-lg">
                Chưa có tài liệu nào được công khai
              </p>
            </div>
          ) : documentsData.length >= 4 ? (
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll-right space-x-6">
                {documentsData.map((doc, index) => {
                  // Format file size
                  const formatSize = (bytes: number) => {
                    if (!bytes) return "N/A";
                    if (bytes < 1024) return bytes + " B";
                    if (bytes < 1024 * 1024)
                      return (bytes / 1024).toFixed(1) + " KB";
                    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
                  };

                  return (
                    <div
                      key={doc.id}
                      onClick={() => router.push(`/documents/${doc.id}`)}
                      className="flex-shrink-0 w-80 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 group cursor-pointer"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      {/* Document Header with Icon */}
                      <div className="relative h-48 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaBook className="w-8 h-8 text-white" />
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white font-medium">
                            {doc.file_type || "FILE"}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>

                      <div className="p-6 flex flex-col h-full">
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-[#60a5fa] transition-colors duration-200">
                            {doc.title}
                          </h3>

                          {doc.category && (
                            <p className="text-sm text-white/80 mb-4 flex items-center">
                              <span className="w-2 h-2 bg-[#60a5fa] rounded-full mr-2"></span>
                              {doc.category}
                            </p>
                          )}

                          <div className="flex justify-between items-center text-sm text-white/60 mb-4">
                            <span className="flex items-center">
                              <span className="w-1 h-1 bg-white/40 rounded-full mr-2"></span>
                              {formatSize(doc.file_size)}
                            </span>
                            <span className="text-xs text-white/50">
                              {new Date(doc.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                        </div>

                        <button className="w-full rounded-lg font-semibold py-3 transition-all duration-200 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] hover:from-[#2563eb] hover:to-[#3b82f6] text-white hover:scale-105 mt-auto"></button>
                      </div>
                    </div>
                  );
                })}
                {/* Duplicate for seamless loop */}
                {documentsData.map((doc, index) => {
                  // Format file size
                  const formatSize = (bytes: number) => {
                    if (!bytes) return "N/A";
                    if (bytes < 1024) return bytes + " B";
                    if (bytes < 1024 * 1024)
                      return (bytes / 1024).toFixed(1) + " KB";
                    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
                  };

                  return (
                    <div
                      key={`duplicate-${doc.id}`}
                      onClick={() => router.push(`/documents/${doc.id}`)}
                      className="flex-shrink-0 w-80 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 group cursor-pointer"
                      style={{
                        animationDelay: `${
                          (index + documentsData.length) * 0.1
                        }s`,
                      }}
                    >
                      {/* Document Header with Icon */}
                      <div className="relative h-48 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FaBook className="w-8 h-8 text-white" />
                          </div>
                          <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white font-medium">
                            {doc.file_type || "FILE"}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>

                      <div className="p-6 flex flex-col h-full">
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-[#60a5fa] transition-colors duration-200">
                            {doc.title}
                          </h3>

                          {doc.category && (
                            <p className="text-sm text-white/80 mb-4 flex items-center">
                              <span className="w-2 h-2 bg-[#60a5fa] rounded-full mr-2"></span>
                              {doc.category}
                            </p>
                          )}

                          <div className="flex justify-between items-center text-sm text-white/60 mb-4">
                            <span className="flex items-center">
                              <span className="w-1 h-1 bg-white/40 rounded-full mr-2"></span>
                              {formatSize(doc.file_size)}
                            </span>
                            <span className="text-xs text-white/50">
                              {new Date(doc.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                        </div>

                        <button className="w-full rounded-lg font-semibold py-3 transition-all duration-200 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] hover:from-[#2563eb] hover:to-[#3b82f6] text-white hover:scale-105 mt-auto"></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {documentsData.map((doc, index) => {
                // Format file size
                const formatSize = (bytes: number) => {
                  if (!bytes) return "N/A";
                  if (bytes < 1024) return bytes + " B";
                  if (bytes < 1024 * 1024)
                    return (bytes / 1024).toFixed(1) + " KB";
                  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
                };

                return (
                  <div
                    key={doc.id}
                    onClick={() => router.push(`/documents/${doc.id}`)}
                    className="group bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20 cursor-pointer"
                  >
                    {/* Document Header with Icon */}
                    <div className="relative h-48 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FaBook className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white font-medium">
                          {doc.file_type || "FILE"}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    <div className="p-6 flex flex-col h-full">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-[#60a5fa] transition-colors duration-200">
                          {doc.title}
                        </h3>

                        {doc.category && (
                          <p className="text-sm text-white/80 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#60a5fa] rounded-full mr-2"></span>
                            {doc.category}
                          </p>
                        )}

                        <div className="flex justify-between items-center text-sm text-white/60 mb-4">
                          <span className="flex items-center">
                            <span className="w-1 h-1 bg-white/40 rounded-full mr-2"></span>
                            {formatSize(doc.file_size)}
                          </span>
                          <span className="text-xs text-white/50">
                            {new Date(doc.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>

                      <button className="w-full rounded-lg font-semibold py-3 transition-all duration-200 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] hover:from-[#2563eb] hover:to-[#3b82f6] text-white hover:scale-105 mt-auto"></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
