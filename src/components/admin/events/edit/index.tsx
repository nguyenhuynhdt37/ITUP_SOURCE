"use client";

import { RichTextEditor } from "@/components/admin/shared/rich-text-editor";
import {
  createEmbedding,
  generateImprovedContent,
  generateSummary,
  generateTags,
  generateTitleSuggestions,
} from "@/lib/promptGemini";
import { generateSlug } from "@/lib/slug";
import { supabase } from "@/lib/supabaseClient";
import { uploadFile } from "@/lib/uploadFile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaImage,
  FaLightbulb,
  FaMagic,
  FaMapMarkerAlt,
  FaRobot,
  FaSave,
  FaSpinner,
  FaTimes,
  FaUsers,
} from "react-icons/fa";

interface EditEventProps {
  eventId: string;
}

export const EditEvent = ({ eventId }: EditEventProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [memberCount, setMemberCount] = useState(0);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    banner_url: "",
    location: "",
    start_time: "",
    end_time: "",
    event_type: "Workshop",
    capacity: 100,
    is_public: true,
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState({
    title: "",
    description: "",
    content: "",
    banner_url: "",
    location: "",
    start_time: "",
    end_time: "",
    event_type: "Workshop",
    capacity: 100,
    is_public: true,
    embedding: null as number[] | null,
  });

  // AI generation states
  const [aiLoading, setAiLoading] = useState({
    summary: false,
    tags: false,
    titles: false,
    content: false,
    ideas: false,
    article: false,
  });

  // AI idea generation states
  const [showIdeaGenerator, setShowIdeaGenerator] = useState(false);
  const [ideaTopic, setIdeaTopic] = useState("");
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState("");

  // File upload states
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Auto-generate slug when title changes
  const [slug, setSlug] = useState("");
  useEffect(() => {
    if (formData.title) {
      setSlug(generateSlug(formData.title));
    }
  }, [formData.title]);

  // Format datetime for input with Vietnam timezone
  const formatDateTimeForInput = (date: Date): string => {
    const vietnamTime = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    return vietnamTime.toISOString().slice(0, 16);
  };

  // Load member count
  useEffect(() => {
    const loadMemberCount = async () => {
      try {
        const { count, error } = await supabase
          .from("members")
          .select("*", { count: "exact", head: true });

        if (error) {
          console.log("Error loading member count:", error);
          return;
        }

        setMemberCount(count || 0);
      } catch (error) {
        console.log("Error loading member count:", error);
      }
    };

    loadMemberCount();
  }, []);

  // Check if there are changes
  const hasChanges = () => {
    return (
      formData.title !== originalData.title ||
      formData.description !== originalData.description ||
      formData.content !== originalData.content ||
      formData.banner_url !== originalData.banner_url ||
      formData.location !== originalData.location ||
      formData.start_time !== originalData.start_time ||
      formData.end_time !== originalData.end_time ||
      formData.event_type !== originalData.event_type ||
      formData.capacity !== originalData.capacity ||
      formData.is_public !== originalData.is_public
    );
  };

  // Load existing event data
  useEffect(() => {
    const loadEventData = async () => {
      try {
        setInitialLoading(true);
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const eventData = {
            title: (data as any).title || "",
            description: (data as any).description || "",
            content: (data as any).content || "",
            banner_url: (data as any).banner_url || "",
            location: (data as any).location || "",
            start_time: (data as any).start_time
              ? formatDateTimeForInput(new Date((data as any).start_time))
              : "",
            end_time: (data as any).end_time
              ? formatDateTimeForInput(new Date((data as any).end_time))
              : "",
            event_type: (data as any).event_type || "Workshop",
            capacity: (data as any).capacity || 100,
            is_public: (data as any).is_public || true,
            embedding: (data as any).embedding || null,
          };

          setFormData(eventData);
          setOriginalData(eventData);
        }
      } catch (error) {
        console.log("Error loading event:", error);
        setError("Không thể tải dữ liệu sự kiện");
      } finally {
        setInitialLoading(false);
      }
    };

    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const uploadedFile = await uploadFile(file, "events/banners");
      handleInputChange("banner_url", uploadedFile);
      setSuccess("Tải lên hình ảnh thành công!");
    } catch (error) {
      console.log("Upload error:", error);
      setUploadError("Lỗi khi tải lên hình ảnh");
    } finally {
      setUploading(false);
    }
  };

  // Extract text from HTML content while preserving structure
  const extractTextFromHTML = (html: string): string => {
    if (!html || !html.trim()) return "";

    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Preserve line breaks and basic formatting
    const text = temp.textContent || temp.innerText || "";

    // Clean up extra whitespace but preserve structure
    return text.replace(/\s+/g, " ").trim();
  };

  // AI-powered description generation
  const handleGenerateDescription = async () => {
    if (!formData.content.trim()) {
      alert("Vui lòng nhập nội dung trước khi tạo mô tả");
      return;
    }

    setAiLoading((prev) => ({ ...prev, summary: true }));
    try {
      const textContent = extractTextFromHTML(formData.content);
      const description = await generateSummary(textContent);

      if (description) {
        handleInputChange("description", description);
      }
    } catch (error) {
      console.log("Error generating description:", error);
    } finally {
      setAiLoading((prev) => ({ ...prev, summary: false }));
    }
  };

  // AI-powered tag generation
  const handleGenerateTags = async () => {
    if (!formData.content.trim()) {
      alert("Vui lòng nhập nội dung trước khi tạo tags");
      return;
    }

    setAiLoading((prev) => ({ ...prev, tags: true }));
    try {
      const textContent = extractTextFromHTML(formData.content);
      const tags = await generateTags(textContent);

      if (tags.length > 0) {
        // Note: Tags functionality can be added later if needed
        console.log("Generated tags:", tags);
      }
    } catch (error) {
      console.log("Error generating tags:", error);
    } finally {
      setAiLoading((prev) => ({ ...prev, tags: false }));
    }
  };

  // AI-powered title suggestions
  const handleGenerateTitles = async () => {
    if (!formData.content.trim()) {
      alert("Vui lòng nhập nội dung trước khi tạo gợi ý tiêu đề");
      return;
    }

    setAiLoading((prev) => ({ ...prev, titles: true }));
    try {
      const textContent = extractTextFromHTML(formData.content);
      const titles = await generateTitleSuggestions(textContent);

      if (titles.length > 0) {
        const selectedTitle = prompt(
          `Gợi ý tiêu đề:\n${titles
            .map((t, i) => `${i + 1}. ${t}`)
            .join("\n")}\n\nNhập số thứ tự (1-${
            titles.length
          }) hoặc Enter để bỏ qua:`
        );
        if (selectedTitle && !isNaN(Number(selectedTitle))) {
          const index = Number(selectedTitle) - 1;
          if (index >= 0 && index < titles.length) {
            handleInputChange("title", titles[index]);
          }
        }
      }
    } catch (error) {
      console.log("Error generating titles:", error);
    } finally {
      setAiLoading((prev) => ({ ...prev, titles: false }));
    }
  };

  // AI-powered content rewriting
  const handleRewriteContent = async () => {
    if (!formData.content.trim()) {
      alert("Vui lòng nhập nội dung trước khi viết lại");
      return;
    }

    setAiLoading((prev) => ({ ...prev, content: true }));
    try {
      const textContent = extractTextFromHTML(formData.content);
      const improvedContent = await generateImprovedContent(textContent);

      if (improvedContent) {
        handleInputChange("content", improvedContent);
        setSuccess("Nội dung đã được cải thiện bằng AI!");
      }
    } catch (error) {
      console.log("Error rewriting content:", error);
    } finally {
      setAiLoading((prev) => ({ ...prev, content: false }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        setError("Tiêu đề là bắt buộc");
        setLoading(false);
        return;
      }

      if (!formData.content.trim()) {
        setError("Nội dung là bắt buộc");
        setLoading(false);
        return;
      }

      if (!formData.start_time) {
        setError("Thời gian bắt đầu là bắt buộc");
        setLoading(false);
        return;
      }

      if (!formData.end_time) {
        setError("Thời gian kết thúc là bắt buộc");
        setLoading(false);
        return;
      }

      // Validate time with Vietnam timezone
      const now = new Date();
      const vietnamTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      );
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);

      if (startTime >= endTime) {
        setError("Thời gian kết thúc phải sau thời gian bắt đầu");
        setLoading(false);
        return;
      }

      if (startTime < vietnamTime) {
        setError("Thời gian bắt đầu không được trong quá khứ");
        setLoading(false);
        return;
      }

      if (formData.capacity < memberCount) {
        setError(
          `Số lượng người tham gia tối thiểu phải là ${memberCount} (số thành viên hiện tại)`
        );
        setLoading(false);
        return;
      }

      if (formData.capacity > 1000) {
        setError("Số lượng người tham gia tối đa là 1000");
        setLoading(false);
        return;
      }

      // Tạo embedding từ content (chỉ khi cần thiết)
      let embedding = originalData.embedding;

      // Chỉ tạo embedding mới nếu:
      // 1. Chưa có embedding cũ
      // 2. Hoặc có thay đổi về nội dung quan trọng (title, description, content)
      const contentChanged =
        formData.title !== originalData.title ||
        formData.description !== originalData.description ||
        formData.content !== originalData.content;

      if (!embedding || contentChanged) {
        console.log("🔄 Creating new embedding...");
        const textContent = extractTextFromHTML(formData.content);
        const contentForEmbedding = `${formData.title} ${formData.description} ${textContent}`;

        console.log(
          "Creating embedding for content:",
          contentForEmbedding.substring(0, 200) + "..."
        );
        embedding = await createEmbedding(contentForEmbedding);
        console.log("Embedding result:", embedding.length, "dimensions");
      } else {
        console.log("✅ Using existing embedding (no content changes)");
      }

      // Convert Vietnam time to UTC for database storage
      const convertVietnamTimeToUTC = (vietnamDateTime: string): string => {
        // Create date object assuming the input is in Vietnam timezone
        const vietnamDate = new Date(vietnamDateTime + "+07:00");
        return vietnamDate.toISOString();
      };

      // Prepare data for update
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        content: formData.content.trim(),
        banner_url: formData.banner_url.trim() || null,
        location: formData.location.trim() || null,
        start_time: convertVietnamTimeToUTC(formData.start_time),
        end_time: convertVietnamTimeToUTC(formData.end_time),
        event_type: formData.event_type,
        capacity: formData.capacity,
        is_public: formData.is_public,
        embedding: embedding.length > 0 ? embedding : null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from("events")
        .update(eventData)
        .eq("id", eventId)
        .select()
        .single();

      if (error) {
        console.log("Error updating event:", error);
        setError("Lỗi khi cập nhật sự kiện");
        setLoading(false);
        return;
      }

      setSuccess("Cập nhật sự kiện thành công!");

      // Redirect to events list after 2 seconds
      setTimeout(() => {
        router.push("/admin/events");
      }, 2000);
    } catch (err) {
      console.log("Error updating event:", err);
      setError("Lỗi khi cập nhật sự kiện");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80">Đang tải dữ liệu sự kiện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-6 p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-xl">
                <FaRobot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Chỉnh sửa sự kiện
                </h1>
                <p className="text-white/80 text-lg">
                  Cập nhật và tối ưu hóa sự kiện với sự hỗ trợ của AI
                </p>
                {hasChanges() && (
                  <p className="text-yellow-400 text-sm mt-2 flex items-center">
                    <FaLightbulb className="w-3 h-3 mr-1" />
                    Có thay đổi chưa được lưu
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-lg mr-4">
                  <FaCalendarAlt className="w-5 h-5 text-white" />
                </div>
                Thông tin cơ bản
              </h2>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Tiêu đề sự kiện *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="flex-1 px-4 py-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                      placeholder="Nhập tiêu đề sự kiện..."
                    />
                    <button
                      type="button"
                      onClick={handleGenerateTitles}
                      disabled={aiLoading.titles}
                      className="px-4 py-4 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center hover:scale-105"
                      title="Tạo gợi ý tiêu đề bằng AI"
                    >
                      {aiLoading.titles ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                      ) : (
                        <FaLightbulb className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Mô tả ngắn
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                      className="flex-1 px-4 py-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] placeholder-white/50 resize-none transition-all duration-300 hover:bg-white/15"
                      placeholder="Mô tả ngắn về sự kiện..."
                    />
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={aiLoading.summary}
                      className="px-4 py-4 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center hover:scale-105"
                      title="Tạo mô tả hay hơn bằng AI"
                    >
                      {aiLoading.summary ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                      ) : (
                        <FaMagic className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Loại sự kiện
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) =>
                      handleInputChange("event_type", e.target.value)
                    }
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 hover:bg-white/15"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Competition">Competition</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <div className="p-2 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-lg mr-4">
                    <FaRobot className="w-5 h-5 text-white" />
                  </div>
                  Nội dung chi tiết
                </h2>
              </div>

              <RichTextEditor
                value={formData.content}
                onChange={(content) => handleInputChange("content", content)}
                uploadFolder="events/content"
                uploadBucket="clb-assets"
                placeholder="Nhập nội dung chi tiết về sự kiện..."
              />
            </div>

            {/* Event Details */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-lg mr-4">
                  <FaClock className="w-5 h-5 text-white" />
                </div>
                Chi tiết sự kiện
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Time */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Thời gian bắt đầu *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) =>
                      handleInputChange("start_time", e.target.value)
                    }
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 hover:bg-white/15"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Thời gian kết thúc *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) =>
                      handleInputChange("end_time", e.target.value)
                    }
                    className="w-full px-4 py-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 hover:bg-white/15"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Địa điểm
                  </label>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-white/60" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="flex-1 px-4 py-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                      placeholder="Nhập địa điểm..."
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Số lượng người tham gia
                  </label>
                  <div className="flex items-center gap-2">
                    <FaUsers className="w-4 h-4 text-white/60" />
                    <input
                      type="number"
                      min={memberCount}
                      max="1000"
                      value={formData.capacity}
                      onChange={(e) =>
                        handleInputChange(
                          "capacity",
                          parseInt(e.target.value) || memberCount
                        )
                      }
                      className="flex-1 px-4 py-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 hover:bg-white/15"
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-1">
                    Tối thiểu: {memberCount} thành viên | Tối đa: 1000 người
                  </p>
                </div>
              </div>

              {/* Public/Private */}
              <div className="mt-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) =>
                      handleInputChange("is_public", e.target.checked)
                    }
                    className="w-5 h-5 text-[#3b82f6] bg-white/10 border-white/20 rounded focus:ring-[#3b82f6]"
                  />
                  <span className="text-white/90">Sự kiện công khai</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Banner & Actions */}
          <div className="space-y-8">
            {/* Banner Upload */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-lg mr-4">
                  <FaImage className="w-5 h-5 text-white" />
                </div>
                Hình ảnh banner
              </h2>

              {formData.banner_url ? (
                <div className="space-y-4">
                  <img
                    src={formData.banner_url}
                    alt="Banner"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => handleInputChange("banner_url", "")}
                    className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTimes className="w-4 h-4" />
                    Xóa hình ảnh
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#3b82f6] transition-colors cursor-pointer"
                  onClick={() =>
                    document.getElementById("banner-upload")?.click()
                  }
                >
                  <FaImage className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 mb-2">Nhấp để tải lên banner</p>
                  <p className="text-white/40 text-sm">
                    PNG, JPG, WEBP (tối đa 5MB)
                  </p>
                </div>
              )}

              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />

              {uploadError && (
                <p className="text-red-400 text-sm mt-2">{uploadError}</p>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="p-2 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-lg mr-4">
                  <FaMagic className="w-5 h-5 text-white" />
                </div>
                AI Assistant
              </h2>

              <div className="space-y-4">
                <button
                  onClick={handleGenerateTitles}
                  disabled={aiLoading.titles}
                  className="w-full px-4 py-4 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105"
                >
                  {aiLoading.titles ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaLightbulb className="w-4 h-4" />
                  )}
                  Gợi ý tiêu đề
                </button>

                <button
                  onClick={handleGenerateDescription}
                  disabled={aiLoading.summary}
                  className="w-full px-4 py-4 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105"
                >
                  {aiLoading.summary ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaMagic className="w-4 h-4" />
                  )}
                  Tạo mô tả
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-4 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !hasChanges()}
            className="px-8 py-4 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
          >
            {loading ? (
              <>
                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4 mr-2" />
                {hasChanges() ? "Cập nhật sự kiện" : "Không có thay đổi"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
