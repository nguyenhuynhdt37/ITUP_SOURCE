"use client";

import ContentDisplay from "@/components/shared/ContentDisplay";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBookmark,
  FaClock,
  FaEye,
  FaHeart,
  FaNewspaper,
  FaPlay,
  FaPrint,
  FaShare,
  FaTag,
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

const NewsDetail = () => {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
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

  useEffect(() => {
    if (params.slug) {
      fetchArticle();
    }
  }, [params.slug]);

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

  // Reading progress tracking
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const fetchArticle = async () => {
    try {
      setLoading(true);

      if (!params.slug) {
        console.log("No slug provided");
        setArticle(null);
        return;
      }

      console.log("Fetching article with slug:", params.slug);

      // Decode and clean the slug to handle URL encoding issues
      const cleanSlug = decodeURIComponent(params.slug as string).trim();
      console.log("Cleaned slug:", cleanSlug);

      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("slug", cleanSlug)
        .eq("is_published", true)
        .single();

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

        const isNotAcceptableError =
          error.code === "406" ||
          error.message?.includes("Not Acceptable") ||
          error.message?.includes("406");

        const isNoRowsFound =
          error.code === "PGRST116" &&
          error.message?.includes("The result contains 0 rows");

        if (isTableNotExist || isPermissionError || isNotAcceptableError) {
          console.log("Database access issue, using mock data");
          const mockTitle =
            'Câu lạc bộ IT UP tổ chức workshop "Lập trình Web hiện đại"';
          const mockArticle: NewsArticle = {
            id: "mock-1",
            title: mockTitle,
            slug: createSlug(mockTitle),
            summary:
              "Workshop hướng dẫn các công nghệ web mới nhất như React, Next.js và TypeScript. Sự kiện thu hút hơn 50 sinh viên tham gia.",
            content: `
              <h2>Giới thiệu</h2>
              <p>Vào ngày 15/12/2024, Câu lạc bộ IT UP đã tổ chức thành công workshop "Lập trình Web hiện đại" tại Hội trường A, Trường Đại học Vinh.</p>
              
              <h2>Nội dung workshop</h2>
              <p>Workshop tập trung vào các công nghệ web hiện đại:</p>
              <ul>
                <li><strong>React.js:</strong> Thư viện JavaScript phổ biến cho việc xây dựng giao diện người dùng</li>
                <li><strong>Next.js:</strong> Framework React với các tính năng tối ưu hóa</li>
                <li><strong>TypeScript:</strong> JavaScript với kiểu dữ liệu tĩnh</li>
                <li><strong>Tailwind CSS:</strong> Framework CSS utility-first</li>
              </ul>
              
              <h2>Kết quả</h2>
              <p>Workshop đã thu hút hơn 50 sinh viên tham gia và nhận được phản hồi tích cực. Nhiều sinh viên đã thể hiện sự quan tâm đến việc học thêm các công nghệ web hiện đại.</p>
              
              <blockquote>
                <p>"Workshop rất bổ ích, giúp tôi hiểu rõ hơn về các công nghệ web hiện đại và cách áp dụng chúng trong các dự án thực tế." - Nguyễn Văn A, sinh viên K67</p>
              </blockquote>
              
              <h2>Kế hoạch tương lai</h2>
              <p>Câu lạc bộ IT UP sẽ tiếp tục tổ chức các workshop tương tự để nâng cao kỹ năng lập trình cho sinh viên.</p>
            `,
            thumbnail_url: "/api/placeholder/800/400",
            tags: ["Workshop", "Web Development", "React", "Next.js"],
            author_name: "IT UP",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            published_at: new Date().toISOString(),
            is_published: true,
            views: 156,
            likes: 23,
          };
          setArticle(mockArticle);
          return;
        }

        // Handle case where article is not found by slug
        if (isNoRowsFound) {
          console.log("Article not found with slug:", params.slug);

          // Try alternative search methods
          try {
            // First try: Search by ID
            console.log("Trying to find article by ID:", params.slug);
            const { data: articleById, error: idError } = await supabase
              .from("news")
              .select("*")
              .eq("id", params.slug)
              .eq("is_published", true)
              .single();

            if (idError && idError.code !== "PGRST116") {
              // If ID search fails with non-404 error, try fuzzy search
              console.log("ID search failed, trying fuzzy search");
              const { data: fuzzyResults, error: fuzzyError } = await supabase
                .from("news")
                .select("*")
                .ilike("slug", `%${cleanSlug}%`)
                .eq("is_published", true)
                .limit(1);

              const fuzzy = (fuzzyResults as NewsArticle[]) || [];

              if (!fuzzyError && fuzzy.length > 0) {
                console.log("Found article with fuzzy search:", fuzzy[0]);
                setArticle(fuzzy[0]);

                // Check localStorage for user's interactions
                const likedArticles = JSON.parse(
                  localStorage.getItem("likedArticles") || "[]"
                );
                const bookmarkedArticles = JSON.parse(
                  localStorage.getItem("bookmarks") || "[]"
                );

                setIsLiked(likedArticles.includes(fuzzy[0].id));
                setIsBookmarked(bookmarkedArticles.includes(fuzzy[0].id));

                // Increment view count
                try {
                  await (supabase as any)
                    .from("news")
                    .update({ views: (fuzzy[0].views || 0) + 1 })
                    .eq("id", fuzzy[0].id);
                } catch (viewError) {
                  console.log("Error updating view count:", viewError);
                }

                return;
              } else {
                // Try searching by title as last resort
                console.log("Fuzzy search failed, trying title search");
                const { data: titleResults, error: titleError } = await supabase
                  .from("news")
                  .select("*")
                  .ilike("title", `%${cleanSlug.replace(/-/g, " ")}%`)
                  .eq("is_published", true)
                  .limit(1);

                const titles = (titleResults as NewsArticle[]) || [];

                if (!titleError && titles.length > 0) {
                  console.log("Found article with title search:", titles[0]);
                  setArticle(titles[0]);

                  // Check localStorage for user's interactions
                  const likedArticles = JSON.parse(
                    localStorage.getItem("likedArticles") || "[]"
                  );
                  const bookmarkedArticles = JSON.parse(
                    localStorage.getItem("bookmarks") || "[]"
                  );

                  setIsLiked(likedArticles.includes(titles[0].id));
                  setIsBookmarked(bookmarkedArticles.includes(titles[0].id));

                  // Increment view count
                  try {
                    await (supabase as any)
                      .from("news")
                      .update({ views: (titles[0].views || 0) + 1 })
                      .eq("id", titles[0].id);
                  } catch (viewError) {
                    console.log("Error updating view count:", viewError);
                  }

                  return;
                }
              }
            }

            if (idError) {
              console.log("Article not found by ID either:", idError);
              // Check if it's also a "no rows found" error for ID search
              const isIdNoRowsFound =
                idError.code === "PGRST116" &&
                idError.message?.includes("The result contains 0 rows");

              if (isIdNoRowsFound) {
                console.log("Article not found by ID either, showing 404");
                setArticle(null);
                return;
              }

              // If it's a different error, continue with the original error
              throw idError;
            }

            if (articleById) {
              const byId = articleById as NewsArticle;
              console.log("Article found by ID:", byId);
              setArticle(byId);

              // Check localStorage for user's interactions
              const likedArticles = JSON.parse(
                localStorage.getItem("likedArticles") || "[]"
              );
              const bookmarkedArticles = JSON.parse(
                localStorage.getItem("bookmarks") || "[]"
              );

              setIsLiked(likedArticles.includes(byId.id));
              setIsBookmarked(bookmarkedArticles.includes(byId.id));

              // Increment view count for ID-found article
              try {
                await (supabase as any)
                  .from("news")
                  .update({ views: (byId.views || 0) + 1 })
                  .eq("id", byId.id);
              } catch (viewError) {
                console.log("Error updating view count:", viewError);
              }

              return;
            }
          } catch (idSearchError) {
            console.log("Error searching by ID:", idSearchError);
            // If ID search also fails, show 404
            setArticle(null);
            return;
          }

          setArticle(null);
          return;
        }

        // For other errors, still throw to show error state
        console.log("Unexpected database error:", error);
        throw error;
      }

      if (!data) {
        console.log("No article found with slug:", params.slug);
        setArticle(null);
        return;
      }

      const articleData = data as NewsArticle;
      console.log("Article found:", articleData);
      setArticle(articleData);

      // Check localStorage for user's interactions
      const likedArticles = JSON.parse(
        localStorage.getItem("likedArticles") || "[]"
      );
      const bookmarkedArticles = JSON.parse(
        localStorage.getItem("bookmarks") || "[]"
      );

      setIsLiked(likedArticles.includes(articleData.id));
      setIsBookmarked(bookmarkedArticles.includes(articleData.id));

      // Increment view count
      try {
        await (supabase as any)
          .from("news")
          .update({ views: (articleData.views || 0) + 1 })
          .eq("id", articleData.id);
      } catch (viewError) {
        console.log("Error updating view count:", viewError);
      }

      // Fetch related news
      if (articleData.tags && articleData.tags.length > 0) {
        try {
          const { data: related, error: relatedError } = await supabase
            .from("news")
            .select("*")
            .eq("is_published", true)
            .neq("id", articleData.id)
            .overlaps("tags", articleData.tags)
            .order("published_at", { ascending: false })
            .limit(3);

          if (relatedError) {
            console.log("Error fetching related news:", relatedError);
          } else if (related) {
            setRelatedNews(related);
          }
        } catch (relatedError) {
          console.log("Error in related news fetch:", relatedError);
        }
      }

      // Fetch latest news
      try {
        const { data: latest, error: latestError } = await supabase
          .from("news")
          .select("*")
          .eq("is_published", true)
          .neq("id", articleData.id)
          .order("published_at", { ascending: false })
          .limit(5);

        if (latestError) {
          console.log("Error fetching latest news:", latestError);
        } else if (latest) {
          setLatestNews(latest);
        }
      } catch (latestError) {
        console.log("Error in latest news fetch:", latestError);
      }
    } catch (error) {
      console.log("Error fetching article:", error);
      // Set article to null to show error state
      setArticle(null);

      // Show user-friendly error message
      console.log(
        "Failed to load article. This might be due to database connection issues."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!article) return;

    try {
      // Update local state immediately
      const newLikes = isLiked ? article.likes - 1 : article.likes + 1;
      setArticle({ ...article, likes: newLikes });
      setIsLiked(!isLiked);

      // Save to localStorage
      const likedArticles = JSON.parse(
        localStorage.getItem("likedArticles") || "[]"
      );
      if (isLiked) {
        const updatedLikes = likedArticles.filter(
          (id: string) => id !== article.id
        );
        localStorage.setItem("likedArticles", JSON.stringify(updatedLikes));
      } else {
        likedArticles.push(article.id);
        localStorage.setItem("likedArticles", JSON.stringify(likedArticles));
      }

      // Try to update database (optional, for analytics)
      try {
        await (supabase as any)
          .from("news")
          .update({ likes: newLikes })
          .eq("id", article.id);
      } catch (dbError) {
        console.log(
          "Database update failed, but local state updated:",
          dbError
        );
      }
    } catch (error) {
      console.log("Error updating likes:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.summary,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link đã được sao chép vào clipboard!");
    }
  };

  const handleBookmark = () => {
    if (!article) return;

    setIsBookmarked(!isBookmarked);

    // Save to localStorage
    const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    if (isBookmarked) {
      const updatedBookmarks = bookmarks.filter(
        (id: string) => id !== article.id
      );
      localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
    } else {
      bookmarks.push(article.id);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Smart Reader functions
  const prepareReadingText = () => {
    if (!article) return;

    // Create introduction
    const introduction = `Hôm nay IT UP sẽ chia sẻ cho các bạn tin tức về ${article.title}. `;

    // Extract text content from HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = article.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Combine title, introduction, and content
    const fullText = `${article.title}. ${introduction}${textContent}`;

    // Split into words and filter out empty strings
    const words = fullText
      .replace(/[^\w\s]/g, " ") // Remove punctuation
      .split(/\s+/)
      .filter((word) => word.length > 0);

    setReadingText(words);
    setCurrentWordIndex(0);
  };

  const startReading = () => {
    if (!article) return;

    prepareReadingText();
    setIsReading(true);
    startSpeaking();
  };

  const stopReading = () => {
    setIsReading(false);
    setCurrentWordIndex(0);
    stopSpeaking();
  };

  const startSpeaking = () => {
    if (!speechSynthesis || !article) return;

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
      const introduction = `Hôm nay IT UP sẽ chia sẻ cho các bạn tin tức về ${article.title}. `;

      // Extract text content from HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = article.content;
      const textContent = tempDiv.textContent || tempDiv.innerText || "";

      // Combine title, introduction, and content
      const fullText = `${article.title}. ${introduction}${textContent}`;

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

  // Check if speech synthesis is supported and working
  const checkSpeechSupport = () => {
    if (!speechSynthesis) return false;

    try {
      // Test if speech synthesis is available
      const testUtterance = new SpeechSynthesisUtterance("test");
      return true;
    } catch (error) {
      console.warn("Speech synthesis not supported:", error);
      return false;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Đang tải bài viết...
          </h1>
          <p className="text-blue-200">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-[#3b82f6]/20 to-[#1e40af]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaNewspaper className="w-10 h-10 text-[#3b82f6]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Không tìm thấy bài viết
          </h1>
          <p className="text-white/70 mb-6 text-lg leading-relaxed">
            Đã tìm kiếm bài viết với slug{" "}
            <code className="bg-white/10 px-2 py-1 rounded text-[#3b82f6]">
              "{params.slug}"
            </code>{" "}
            và ID tương ứng, nhưng không tìm thấy bài viết nào.
          </p>
          <div className="space-y-4">
            <Link
              href="/news"
              className="inline-flex items-center bg-[#3b82f6] hover:bg-[#1e40af] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách tin tức
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] text-white">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
        <div
          className="h-full bg-gradient-to-r from-[#3b82f6] to-[#1e40af] transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Header Navigation */}
      <div className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-white/70 hover:text-white transition-colors duration-200"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </button>
              <div className="h-6 w-px bg-white/20"></div>
              <span className="text-[#3b82f6] font-semibold">IT UP</span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-white/60">
              <span>
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span>•</span>
              <span>{article.views || 0} lượt xem</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Smart Reader - Audio Player Style */}
            <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-xl p-4 shadow-lg mb-8">
              <div className="flex items-center space-x-4">
                {/* Play Button */}
                <button
                  onClick={!isReading ? startReading : stopReading}
                  disabled={!speechSynthesis}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    !speechSynthesis
                      ? "bg-gray-400 cursor-not-allowed"
                      : !isReading
                      ? "bg-white hover:bg-gray-100 shadow-lg"
                      : "bg-red-500 hover:bg-red-600 shadow-lg"
                  }`}
                >
                  <FaPlay
                    className={`w-5 h-5 ${
                      !speechSynthesis
                        ? "text-gray-600"
                        : !isReading
                        ? "text-[#3b82f6]"
                        : "text-white"
                    } ${isReading ? "ml-1" : ""}`}
                  />
                </button>

                {/* Time Display */}
                <div className="text-white font-medium text-sm">
                  {isSpeaking
                    ? "🔊 Đang đọc thành tiếng..."
                    : !speechSynthesis
                    ? "⚠️ Trình duyệt không hỗ trợ đọc thành tiếng"
                    : "0:00 / " +
                      Math.ceil((article.content?.length || 0) / 1000) +
                      " phút"}
                </div>

                {/* Progress Bar */}
                <div className="flex-1 relative">
                  <div className="w-full h-2 bg-white/30 rounded-full">
                    <div
                      className="h-2 bg-white rounded-full transition-all duration-300"
                      style={{
                        width: isSpeaking ? "100%" : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Volume Icon */}
                <div className="text-white">
                  <svg
                    className="w-5 h-5"
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

            {/* Article Header */}
            <div className="mb-8">
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.slice(0, 4).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-[#3b82f6] text-white px-3 py-1 rounded-full text-sm font-medium"
                    >
                      <FaTag className="w-3 h-3 mr-1 inline" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Summary */}
              {article.summary && (
                <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
                  <p className="text-lg text-white/90 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={handleLike}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isLiked
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <FaHeart className="w-4 h-4 mr-2" />
                  {article.likes || 0} Thích
                </button>

                <button
                  onClick={handleBookmark}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isBookmarked
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <FaBookmark className="w-4 h-4 mr-2" />
                  {isBookmarked ? "Đã lưu" : "Lưu"}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FaShare className="w-4 h-4 mr-2" />
                  Chia sẻ
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <FaPrint className="w-4 h-4 mr-2" />
                  In
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 mb-8">
              <ContentDisplay
                content={article.content}
                variant="news"
                className="text-white/90"
              />
            </div>

            {/* Article Footer */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
              <div className="flex flex-wrap justify-center items-center gap-8 text-white/70">
                <div className="flex items-center">
                  <FaEye className="w-4 h-4 mr-2" />
                  <span>{article.views || 0} lượt xem</span>
                </div>
                <div className="flex items-center">
                  <FaHeart className="w-4 h-4 mr-2" />
                  <span>{article.likes || 0} lượt thích</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="w-4 h-4 mr-2" />
                  <span>
                    {Math.ceil((article.content?.length || 0) / 1000)} phút đọc
                  </span>
                </div>
              </div>
            </div>

            {/* Related News */}
            {relatedNews.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-3">
                  Tin liên quan
                </h2>

                <div className="space-y-4">
                  {relatedNews.map((relatedArticle) => (
                    <Link
                      key={relatedArticle.id}
                      href={`/news/${relatedArticle.slug}`}
                      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-20 h-16 flex-shrink-0">
                        {relatedArticle.thumbnail_url ? (
                          <Image
                            src={relatedArticle.thumbnail_url}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 rounded flex items-center justify-center">
                            <FaNewspaper className="w-6 h-6 text-white/40" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2 hover:text-[#3b82f6]">
                          {relatedArticle.title}
                        </h3>
                        <div className="flex items-center text-xs text-white/60 space-x-3">
                          <span>
                            {formatDate(
                              relatedArticle.published_at ||
                                relatedArticle.created_at
                            )}
                          </span>
                          <span>•</span>
                          <span>{relatedArticle.views || 0} lượt xem</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Latest News */}
            {latestNews.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6">
                <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">
                  Tin mới
                </h2>

                <div className="space-y-4">
                  {latestNews.slice(0, 5).map((newsItem) => (
                    <Link
                      key={newsItem.id}
                      href={`/news/${newsItem.slug}`}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="relative w-16 h-12 flex-shrink-0">
                        {newsItem.thumbnail_url ? (
                          <Image
                            src={newsItem.thumbnail_url}
                            alt={newsItem.title}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 rounded flex items-center justify-center">
                            <FaNewspaper className="w-6 h-6 text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2 hover:text-[#3b82f6]">
                          {newsItem.title}
                        </h3>
                        <div className="flex items-center text-xs text-white/60 space-x-3">
                          <span>
                            {formatDate(
                              newsItem.published_at || newsItem.created_at
                            )}
                          </span>
                          <span>•</span>
                          <span>{newsItem.views || 0} lượt xem</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Tags */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">
                Thẻ phổ biến
              </h2>

              <div className="flex flex-wrap gap-2">
                {[
                  "Workshop",
                  "Web Development",
                  "AI",
                  "React",
                  "Next.js",
                  "TypeScript",
                  "Programming",
                  "Education",
                ].map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white/10 hover:bg-[#3b82f6] text-white px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
