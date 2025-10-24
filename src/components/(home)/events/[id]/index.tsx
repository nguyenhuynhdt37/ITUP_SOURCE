"use client";

import ContentDisplay from "@/components/shared/ContentDisplay";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBookmark,
  FaCalendarAlt,
  FaClock,
  FaExternalLinkAlt,
  FaHeart,
  FaMapMarkerAlt,
  FaPlay,
  FaShare,
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

const EventDetail: React.FC = () => {
  const params = useParams();
  const eventId = (params?.id as string) || "";
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Smart Reader states
  const [isReading, setIsReading] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [readingText, setReadingText] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] =
    useState<SpeechSynthesis | null>(null);
  const [isMounted, setIsMounted] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Component mount state management
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Fetch event
  const fetchEvent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.log("Error fetching event:", error);
        // Use mock data if database error
        setEvent(getMockEvent());
        return;
      }

      setEvent(data);
    } catch (error) {
      console.log("Error fetching event:", error);
      setEvent(getMockEvent());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for development
  const getMockEvent = (): Event => ({
    id: "1",
    title: "Workshop: Làm quen với Trí tuệ Nhân tạo cùng Gemini",
    description:
      "Buổi học nhập môn về AI và công cụ Gemini do CLB ITUP tổ chức dành cho sinh viên yêu thích công nghệ.",
    content:
      '<p>CLB ITUP phối hợp cùng Google Developer Group Vinh tổ chức workshop <b>"Làm quen với Trí tuệ Nhân tạo cùng Gemini"</b>. Sinh viên sẽ được trải nghiệm tạo chatbot, sinh ảnh, và nhúng embedding vào ứng dụng thực tế. Hướng dẫn bởi <b>Nguyễn Xuân Huỳnh</b> – Phó Chủ nhiệm CLB.</p><img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200" style="width:100%;border-radius:8px;"><p><b>Thời gian:</b> 02/11/2025, 8:00 – 10:30 AM<br><b>Địa điểm:</b> Phòng 205, Nhà A1 – Đại học Vinh</p>',
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
  });

  // Load liked and bookmarked events from localStorage
  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedEvents") || "[]");
    const bookmarked = JSON.parse(
      localStorage.getItem("bookmarkedEvents") || "[]"
    );
    setIsLiked(liked.includes(eventId));
    setIsBookmarked(bookmarked.includes(eventId));
  }, [eventId]);

  // Fetch event on component mount
  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Countdown timer
  useEffect(() => {
    if (!event) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const startTime = new Date(event.start_time).getTime();
      const timeDiff = startTime - now;

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
  }, [event]);

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setReadingProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle like
  const handleLike = () => {
    const liked = JSON.parse(localStorage.getItem("likedEvents") || "[]");
    if (liked.includes(eventId)) {
      const newLiked = liked.filter((id: string) => id !== eventId);
      localStorage.setItem("likedEvents", JSON.stringify(newLiked));
    } else {
      liked.push(eventId);
      localStorage.setItem("likedEvents", JSON.stringify(liked));
    }
    setIsLiked(!isLiked);
  };

  // Handle bookmark
  const handleBookmark = () => {
    const bookmarked = JSON.parse(
      localStorage.getItem("bookmarkedEvents") || "[]"
    );
    if (bookmarked.includes(params.id)) {
      const newBookmarked = bookmarked.filter((id: string) => id !== params.id);
      localStorage.setItem("bookmarkedEvents", JSON.stringify(newBookmarked));
    } else {
      bookmarked.push(params.id);
      localStorage.setItem("bookmarkedEvents", JSON.stringify(bookmarked));
    }
    setIsBookmarked(!isBookmarked);
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link đã được sao chép!");
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Smart Reader functions
  const prepareReadingText = () => {
    if (!event) return;

    // Create introduction
    const introduction = `Hôm nay IT UP sẽ chia sẻ cho các bạn thông tin về sự kiện ${event.title}. `;

    // Extract text content from HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = event.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Combine title, introduction, and content
    const fullText = `${event.title}. ${introduction}${textContent}`;

    // Split into words
    const words = fullText.split(/\s+/);
    setReadingText(words);
  };

  const startReading = () => {
    if (!isReading) {
      setIsReading(true);
      prepareReadingText();
      startSpeaking();
    } else {
      stopReading();
    }
  };

  const stopReading = () => {
    setIsReading(false);
    setCurrentWordIndex(0);
    stopSpeaking();
  };

  const startSpeaking = () => {
    if (!speechSynthesis || !event) return;

    // Check if component is still mounted
    if (!isMounted) {
      console.log("Component unmounted, cannot start speaking");
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    // Wait a bit for cancellation to complete
    setTimeout(() => {
      // Double-check component is still mounted
      if (!isMounted) {
        console.log(
          "Component unmounted during timeout, cannot start speaking"
        );
        return;
      }
      // Create introduction
      const introduction = `Hôm nay IT UP sẽ chia sẻ cho các bạn thông tin về sự kiện ${event.title}. `;

      // Extract text content from HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = event.content;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";

      // Combine title, introduction, and content
      const fullText = `${event.title}. ${introduction}${textContent}`;

      // Check if text is too long (split if necessary)
      const maxLength = 10000; // Reasonable limit for speech synthesis
      const textToSpeak =
        fullText.length > maxLength
          ? fullText.substring(0, maxLength) + "..."
          : fullText;

      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "vi-VN";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Set up event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsReading(false);
        setCurrentWordIndex(0);
      };

      utterance.onerror = (event) => {
        try {
          // Check if component is still mounted
          if (!isMounted) {
            console.log("Component unmounted, ignoring speech synthesis error");
            return;
          }

          // Handle specific error types
          if (event.error === "not-allowed") {
            console.warn(
              "Speech synthesis not allowed - user may need to interact with page first"
            );
          } else if (event.error === "audio-busy") {
            console.warn("Audio system is busy - retrying in 1 second");
            setTimeout(() => {
              if (speechSynthesis && isMounted) {
                speechSynthesis.speak(utterance);
              }
            }, 1000);
            return; // Don't stop reading on audio-busy
          } else if (event.error === "audio-hardware") {
            console.warn(
              "Audio hardware error - speech synthesis may not be available"
            );
          } else if (event.error === "network") {
            console.warn(
              "Network error - speech synthesis may not be available"
            );
          } else if (event.error === "synthesis-unavailable") {
            console.warn(
              "Speech synthesis unavailable - browser may not support it"
            );
          } else if (event.error === "synthesis-failed") {
            console.warn(
              "Speech synthesis failed - text may be too long or invalid"
            );
          } else if (event.error === "language-unavailable") {
            console.warn(
              "Vietnamese language not available - falling back to default"
            );
            utterance.lang = "en-US"; // Fallback to English
            if (speechSynthesis && isMounted) {
              speechSynthesis.speak(utterance);
            }
            return; // Don't stop reading on language fallback
          } else if (event.error === "interrupted") {
            console.log(
              "Speech synthesis interrupted - likely due to navigation"
            );
            // Don't set states to false for interruption errors
            return;
          }

          // Only update states if component is still mounted
          if (isMounted) {
            setIsSpeaking(false);
            setIsReading(false);
          }
        } catch (error) {
          console.log("Error in speech synthesis error handler:", error);
          // Silent fail - don't update states if there's an error in error handling
        }
      };

      // Start speaking
      speechSynthesis.speak(utterance);
    }, 100); // Small delay to ensure cancellation is complete
  };

  const stopSpeaking = () => {
    // Stop browser TTS
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsReading(false);
    setCurrentWordIndex(0);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Stop any ongoing speech when component unmounts
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [speechSynthesis]);

  // Cleanup on page visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isSpeaking) {
        // Stop speech when tab becomes hidden
        if (speechSynthesis) {
          speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setIsReading(false);
        setCurrentWordIndex(0);
      }
    };

    const handleBeforeUnload = () => {
      // Stop speech before page unloads
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };

    const handlePageHide = () => {
      // Stop speech when page is hidden (navigation)
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };

    const handlePopState = () => {
      // Stop speech when user navigates back/forward
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isSpeaking, speechSynthesis]);

  // Reading effect
  useEffect(() => {
    if (!isReading || readingText.length === 0) return;

    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => {
        if (prev >= readingText.length - 1) {
          setIsReading(false);
          return 0;
        }
        return prev + 1;
      });
    }, 600); // Fixed speed (600ms)

    return () => clearInterval(interval);
  }, [isReading, readingText.length]);

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
  const getRegistrationStatus = () => {
    if (!event) return "ended";

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

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📅</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Không tìm thấy sự kiện
          </h1>
          <p className="text-gray-300 mb-8">
            Sự kiện này có thể đã bị xóa hoặc không tồn tại
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const status = getRegistrationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033]">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="flex items-center text-white hover:text-blue-300 transition-colors bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2"
              >
                <FaArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-white">
                {/* Event Type Badge */}
                <div className="mb-6">
                  <span
                    className={`px-6 py-3 rounded-full text-white text-lg font-bold ${getEventTypeColor(
                      event.event_type
                    )} shadow-lg`}
                  >
                    {event.event_type}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  {event.title}
                </h1>

                <p className="text-lg text-gray-200 mb-6 leading-relaxed">
                  {event.description}
                </p>

                {/* Countdown Timer */}
                {status === "upcoming" && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">
                      Sự kiện bắt đầu sau:
                    </h4>
                    <div className="flex space-x-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-lg">
                        <div className="text-2xl font-bold text-white">
                          {timeLeft.days.toString().padStart(2, "0")}
                        </div>
                        <div className="text-xs text-blue-100">Ngày</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-lg">
                        <div className="text-2xl font-bold text-white">
                          {timeLeft.hours.toString().padStart(2, "0")}
                        </div>
                        <div className="text-xs text-blue-100">Giờ</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-lg">
                        <div className="text-2xl font-bold text-white">
                          {timeLeft.minutes.toString().padStart(2, "0")}
                        </div>
                        <div className="text-xs text-blue-100">Phút</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-center shadow-lg">
                        <div className="text-2xl font-bold text-white">
                          {timeLeft.seconds.toString().padStart(2, "0")}
                        </div>
                        <div className="text-xs text-blue-100">Giây</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {event.registered_count}
                    </div>
                    <div className="text-xs text-gray-300">Đã đăng ký</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-gray-400">
                      {event.capacity}
                    </div>
                    <div className="text-xs text-gray-300">Sức chứa</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleLike}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                      isLiked
                        ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg"
                        : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                    }`}
                  >
                    <FaHeart className={isLiked ? "fill-current" : ""} />
                    <span>{isLiked ? "Đã thích" : "Thích"}</span>
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                      isBookmarked
                        ? "bg-gray-500 text-white hover:bg-gray-600 shadow-lg"
                        : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                    }`}
                  >
                    <FaBookmark
                      className={isBookmarked ? "fill-current" : ""}
                    />
                    <span>{isBookmarked ? "Đã lưu" : "Lưu"}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-6 py-3 bg-white/20 text-white hover:bg-white/30 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 backdrop-blur-sm"
                  >
                    <FaShare />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>

              {/* Right Content - Event Info Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  Thông tin sự kiện
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <FaCalendarAlt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs">Ngày diễn ra</p>
                      <p className="text-white font-medium text-sm">
                        {formatDate(event.start_time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                      <FaClock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs">Thời gian</p>
                      <p className="text-white font-medium text-sm">
                        {formatTime(event.start_time)} -{" "}
                        {formatTime(event.end_time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                      <FaMapMarkerAlt className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs">Địa điểm</p>
                      <p className="text-white font-medium text-sm">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <FaUsers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs">Người tổ chức</p>
                      <p className="text-white font-medium text-sm">
                        {event.organizer_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Registration Status */}
                <div className="mt-6 text-center">
                  <div
                    className={`inline-block px-4 py-2 rounded-lg text-white text-sm font-medium mb-4 ${
                      status === "upcoming"
                        ? "bg-blue-500"
                        : status === "ongoing"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {status === "upcoming"
                      ? "🚀 Sắp diễn ra"
                      : status === "ongoing"
                      ? "🔥 Đang diễn ra"
                      : "✅ Đã kết thúc"}
                  </div>

                  {status !== "ended" && (
                    <a
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white py-3 px-6 rounded-lg font-medium hover:from-[#1e3a8a] hover:to-[#2563eb] transition-all duration-300 flex items-center justify-center space-x-2 text-sm shadow-lg"
                    >
                      <FaExternalLinkAlt />
                      <span>Đăng ký tham gia ngay</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Smart Reader - Enhanced Style */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-6 shadow-2xl mb-12">
              <div className="flex items-center space-x-6">
                {/* Play Button */}
                <button
                  onClick={!isReading ? startReading : stopReading}
                  disabled={!speechSynthesis}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    !speechSynthesis
                      ? "bg-gray-400 cursor-not-allowed"
                      : !isReading
                      ? "bg-white hover:bg-gray-100"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  <FaPlay
                    className={`w-6 h-6 ${
                      !speechSynthesis
                        ? "text-gray-600"
                        : !isReading
                        ? "text-blue-500"
                        : "text-white"
                    } ${isReading ? "ml-1" : ""}`}
                  />
                </button>

                {/* Time Display */}
                <div className="text-white font-bold text-lg">
                  {isSpeaking
                    ? "🔊 Đang đọc thành tiếng..."
                    : !speechSynthesis
                    ? "⚠️ Trình duyệt không hỗ trợ đọc thành tiếng"
                    : "0:00 / " +
                      Math.ceil((event.content?.length || 0) / 1000) +
                      " phút"}
                </div>

                {/* Progress Bar */}
                <div className="flex-1 relative">
                  <div className="w-full h-3 bg-white/30 rounded-full">
                    <div
                      className="h-3 bg-white rounded-full transition-all duration-300"
                      style={{
                        width: isSpeaking ? "100%" : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Volume Icon */}
                <div className="text-white">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.808L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.808a1 1 0 011.617.808zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Event Content */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">
                Chi tiết sự kiện
              </h2>
              <ContentDisplay
                content={event.content}
                variant="event"
                className="text-gray-200"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-2xl mb-6">
              <h3 className="text-lg font-bold text-white mb-4 text-center">
                Thống kê nhanh
              </h3>

              <div className="space-y-3">
                <div className="bg-blue-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-400">
                    {event.registered_count}
                  </div>
                  <div className="text-xs text-gray-300">Đã đăng ký</div>
                </div>

                <div className="bg-gray-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-gray-400">
                    {event.capacity}
                  </div>
                  <div className="text-xs text-gray-300">Sức chứa</div>
                </div>

                <div className="bg-gray-500/20 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-gray-400">
                    {Math.round(
                      (event.registered_count / event.capacity) * 100
                    )}
                    %
                  </div>
                  <div className="text-xs text-gray-300">Đã lấp đầy</div>
                </div>
              </div>
            </div>

            {/* Registration CTA */}
            {status !== "ended" && (
              <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-2xl p-4 shadow-2xl text-center">
                <h3 className="text-lg font-bold text-white mb-3">
                  Tham gia ngay!
                </h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Đừng bỏ lỡ cơ hội tham gia sự kiện thú vị này
                </p>
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2 text-sm shadow-lg"
                >
                  <FaExternalLinkAlt />
                  <span>Đăng ký tham gia</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
