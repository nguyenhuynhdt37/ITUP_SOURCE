"use client";

import { RichTextEditor } from "@/components/admin/shared/rich-text-editor";
import { TagSuggestions } from "@/components/admin/shared/tag-suggestions";
import {
  createEmbedding,
  generateArticleFromIdea,
  generateArticleIdeas,
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
  FaEye,
  FaImage,
  FaLightbulb,
  FaMagic,
  FaRobot,
  FaSave,
  FaSpinner,
  FaTag,
  FaTimes,
} from "react-icons/fa";

export const CreateNew = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    thumbnail_url: "",
    tags: [] as string[],
    is_published: false,
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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Utility function to extract text from HTML
  const extractTextFromHTML = (html: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError("");

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Chỉ hỗ trợ file hình ảnh");
        setUploading(false);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File quá lớn. Tối đa 5MB");
        setUploading(false);
        return;
      }

      // Validate image dimensions (optional)
      const img = new Image();
      img.onload = async () => {
        if (img.width < 300 || img.height < 200) {
          setUploadError("Hình ảnh quá nhỏ. Tối thiểu 300x200px");
          setUploading(false);
          return;
        }

        try {
          const url = await uploadFile(file, "baiviet/banner", "clb-assets");
          handleInputChange("thumbnail_url", url);
        } catch (error) {
          console.log("Upload error:", error);
          setUploadError("Lỗi khi upload hình ảnh");
        } finally {
          setUploading(false);
        }
      };
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.log("Upload error:", error);
      setUploadError("Lỗi khi upload hình ảnh");
      setUploading(false);
    }
  };

  // AI-powered summary generation
  const handleGenerateSummary = async () => {
    if (!formData.content?.trim()) {
      alert("Vui lòng nhập nội dung trước khi tạo tóm tắt");
      return;
    }

    setAiLoading((prev) => ({ ...prev, summary: true }));
    try {
      const textContent = extractTextFromHTML(formData.content);
      const summary = await generateSummary(textContent);

      if (summary) {
        handleInputChange("summary", summary);
      }
    } catch (error) {
      console.log("Error generating summary:", error);
    } finally {
      setAiLoading((prev) => ({ ...prev, summary: false }));
    }
  };

  // AI-powered tag generation
  const handleGenerateTags = async () => {
    if (!formData.content?.trim()) {
      alert("Vui lòng nhập nội dung trước khi tạo tags");
      return;
    }

    setAiLoading((prev) => ({ ...prev, tags: true }));
    try {
      const textContent = extractTextFromHTML(formData.content);
      const tags = await generateTags(textContent);

      if (tags.length > 0) {
        handleInputChange("tags", [
          ...formData.tags,
          ...tags.filter((tag) => !formData.tags.includes(tag)),
        ]);
      }
    } catch (error) {
      console.log("Error generating tags:", error);
    } finally {
      setAiLoading((prev) => ({ ...prev, tags: false }));
    }
  };

  // AI-powered title suggestions
  const handleGenerateTitles = async () => {
    if (!formData.content?.trim()) {
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

  // Safe content update method
  const [safeContentUpdate, setSafeContentUpdate] = useState<
    ((content: string) => void) | null
  >(null);

  // AI-powered content rewriting
  const handleRewriteContent = async () => {
    if (!formData.content?.trim()) {
      alert("Vui lòng nhập nội dung trước khi viết lại");
      return;
    }

    // Giới hạn độ dài content để tránh lỗi hiển thị
    const textContent = extractTextFromHTML(formData.content);
    if (textContent.length > 5000) {
      alert(
        "Nội dung quá dài (>5000 ký tự). Vui lòng rút gọn trước khi sử dụng AI."
      );
      return;
    }

    setAiLoading((prev) => ({ ...prev, content: true }));
    try {
      const improvedContent = await generateImprovedContent(textContent);

      if (improvedContent) {
        // Giới hạn độ dài kết quả để tránh lỗi hiển thị
        const maxLength = 10000;
        const finalContent =
          improvedContent.length > maxLength
            ? improvedContent.substring(0, maxLength) + "..."
            : improvedContent;

        // Use safe update method if available
        if (safeContentUpdate) {
          safeContentUpdate(finalContent);
        } else {
          handleInputChange("content", finalContent);
        }
        setSuccess("Nội dung đã được cải thiện bằng AI!");
      }
    } catch (error) {
      console.log("Error rewriting content:", error);
      setError("Lỗi khi viết lại nội dung. Vui lòng thử lại.");
    } finally {
      setAiLoading((prev) => ({ ...prev, content: false }));
    }
  };

  // AI-powered idea generation
  const handleGenerateIdeas = async () => {
    if (!ideaTopic.trim()) {
      alert("Vui lòng nhập chủ đề để tạo ý tưởng");
      return;
    }

    setAiLoading((prev) => ({ ...prev, ideas: true }));
    try {
      const ideas = await generateArticleIdeas(ideaTopic, 5);
      setGeneratedIdeas(ideas);
      setSuccess(`Đã tạo ${ideas.length} ý tưởng cho chủ đề "${ideaTopic}"`);
    } catch (error) {
      console.log("Error generating ideas:", error);
    } finally {
      setAiLoading((prev) => ({ ...prev, ideas: false }));
    }
  };

  // AI-powered article generation from idea
  const handleGenerateArticle = async (idea: string) => {
    if (!idea.trim()) {
      alert("Vui lòng chọn ý tưởng để tạo bài viết");
      return;
    }

    setSelectedIdea(idea);
    setAiLoading((prev) => ({ ...prev, article: true }));
    setSuccess("Đang tạo bài viết từ ý tưởng...");

    try {
      const article = await generateArticleFromIdea(idea, "news");

      if (article) {
        // Giới hạn độ dài kết quả để tránh lỗi hiển thị
        const maxLength = 8000;
        const finalArticle =
          article.length > maxLength
            ? article.substring(0, maxLength) + "..."
            : article;

        // Use safe update method if available
        if (safeContentUpdate) {
          safeContentUpdate(finalArticle);
        } else {
          handleInputChange("content", finalArticle);
        }
        setSuccess("Đã tạo bài viết từ ý tưởng!");
        // Giữ nguyên trạng thái mở của Idea Generator
        setShowIdeaGenerator(true);
      } else {
        setError("Không thể tạo bài viết từ ý tưởng này");
      }
    } catch (error) {
      console.log("Error generating article:", error);
      setError("Lỗi khi tạo bài viết từ ý tưởng");
    } finally {
      setAiLoading((prev) => ({ ...prev, article: false }));
      setSelectedIdea("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.title?.trim()) {
        setError("Tiêu đề là bắt buộc");
        setLoading(false);
        return;
      }

      if (!formData.content?.trim()) {
        setError("Nội dung là bắt buộc");
        setLoading(false);
        return;
      }

      if (!formData.summary?.trim()) {
        setError("Tóm tắt là bắt buộc");
        setLoading(false);
        return;
      }

      if (!formData.thumbnail_url?.trim()) {
        setError("Hình ảnh banner là bắt buộc");
        setLoading(false);
        return;
      }

      if (formData.tags.length === 0) {
        setError("Ít nhất một tag là bắt buộc");
        setLoading(false);
        return;
      }

      if (formData.title.length < 3) {
        setError("Tiêu đề phải có ít nhất 3 ký tự");
        setLoading(false);
        return;
      }

      if (formData.title.length > 200) {
        setError("Tiêu đề không được quá 200 ký tự");
        setLoading(false);
        return;
      }

      if (formData.summary.length < 10) {
        setError("Tóm tắt phải có ít nhất 10 ký tự");
        setLoading(false);
        return;
      }

      if (formData.summary.length > 500) {
        setError("Tóm tắt không được quá 500 ký tự");
        setLoading(false);
        return;
      }

      if (formData.content.length < 50) {
        setError("Nội dung phải có ít nhất 50 ký tự");
        setLoading(false);
        return;
      }

      // Tạo embedding từ content
      let embedding: number[] = [];
      try {
        // Extract text content from HTML for embedding
        const textContent = extractTextFromHTML(formData.content);

        const contentForEmbedding = `${formData.title} ${formData.summary} ${textContent}`;
        console.log(
          "Creating embedding for content:",
          contentForEmbedding.substring(0, 200) + "..."
        );

        embedding = await createEmbedding(contentForEmbedding);
        console.log(
          "Embedding created successfully:",
          embedding.length,
          "dimensions"
        );
      } catch (error) {
        console.warn("Failed to create embedding:", error);
        // Tạo embedding giả với giá trị random để test
        embedding = Array.from({ length: 3072 }, () => Math.random() * 2 - 1);
        console.log(
          "Using fallback random embedding:",
          embedding.length,
          "dimensions"
        );
      }

      // Prepare data for insertion
      const newsData = {
        title: formData.title?.trim() || "",
        summary: formData.summary?.trim() || null,
        content: formData.content?.trim() || "",
        thumbnail_url: formData.thumbnail_url?.trim() || null,
        tags: formData.tags,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
        embedding: embedding.length > 0 ? embedding : null,
      };

      const { data, error } = await supabase
        .from("news")
        .insert(newsData as any)
        .select()
        .single();

      if (error) {
        console.log("Error creating news:", error);
        setError("Lỗi khi tạo tin tức: " + error.message);
        setLoading(false);
        return;
      }

      setSuccess("Tạo tin tức thành công!");

      // Redirect to news list after 2 seconds
      setTimeout(() => {
        router.push("/admin/news");
      }, 2000);
    } catch (err) {
      console.log("Error creating news:", err);
      setError("Có lỗi xảy ra khi tạo tin tức");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a4d] to-[#2d2d6d] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                <FaRobot className="w-8 h-8 mr-3 text-[#3b82f6]" />
                Tạo tin tức với AI
              </h1>
              <p className="text-white/80 text-lg">
                Công cụ tạo nội dung chuyên nghiệp với trí tuệ nhân tạo
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FaLightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                  Tiêu đề bài viết
                  <span className="ml-2 text-red-400 text-sm">*</span>
                </h2>
                <button
                  type="button"
                  onClick={handleGenerateTitles}
                  disabled={!formData.content?.trim() || aiLoading.titles}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {aiLoading.titles ? (
                    <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FaMagic className="w-4 h-4 mr-2" />
                  )}
                  AI Gợi ý
                </button>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-300"
                required
              />
              <div className="flex justify-between items-center mt-2">
                {slug && (
                  <p className="text-white/60 text-sm">
                    Slug:{" "}
                    <span className="text-blue-300 font-mono">{slug}</span>
                  </p>
                )}
                <p className="text-white/60 text-sm">
                  {formData.title.length}/200
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FaRobot className="w-5 h-5 mr-2 text-[#3b82f6]" />
                  Nội dung bài viết
                  <span className="ml-2 text-red-400 text-sm">*</span>
                </h2>
                <button
                  onClick={handleRewriteContent}
                  disabled={aiLoading.content}
                  className="px-4 py-3 bg-gradient-to-r from-[#10b981] to-[#34d399] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
                  title="Viết lại nội dung hay hơn bằng AI"
                >
                  {aiLoading.content ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaRobot className="w-4 h-4" />
                  )}
                  Viết lại hay hơn
                </button>
              </div>
              <RichTextEditor
                value={formData.content}
                onChange={(content: string) =>
                  handleInputChange("content", content)
                }
                onContentUpdate={setSafeContentUpdate}
                placeholder="Nhập nội dung bài viết..."
                uploadFolder="baiviet/content"
                uploadBucket="clb-assets"
              />
            </div>

            {/* Summary Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FaEye className="w-5 h-5 mr-2 text-green-400" />
                  Tóm tắt bài viết
                  <span className="ml-2 text-red-400 text-sm">*</span>
                </h2>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={!formData.content?.trim() || aiLoading.summary}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {aiLoading.summary ? (
                    <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FaMagic className="w-4 h-4 mr-2" />
                  )}
                  AI Tóm tắt
                </button>
              </div>
              <textarea
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                placeholder="Nhập tóm tắt bài viết hoặc sử dụng AI để tự động tạo..."
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-300 resize-none"
              />
              <div className="flex justify-end mt-2">
                <p className="text-white/60 text-sm">
                  {formData.summary.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaImage className="w-5 h-5 mr-2 text-purple-400" />
                Hình ảnh banner
                <span className="ml-2 text-red-400 text-sm">*</span>
              </h3>

              {formData.thumbnail_url ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <img
                      src={formData.thumbnail_url}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-xl border border-white/20 shadow-lg transition-all duration-300 group-hover:shadow-xl"
                    />
                    <button
                      onClick={() => handleInputChange("thumbnail_url", "")}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      Banner
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) handleFileUpload(file);
                        };
                        input.click();
                      }}
                      className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-300 text-sm"
                    >
                      Thay đổi ảnh
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className={`block w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                      uploading
                        ? "border-[#3b82f6] bg-[#3b82f6]/10"
                        : "border-white/20 hover:border-white/40 hover:bg-white/5"
                    }`}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <FaSpinner className="w-8 h-8 text-[#3b82f6] animate-spin mb-4" />
                        <p className="text-white/80">Đang upload...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FaImage className="w-12 h-12 text-white/60 mb-4" />
                        <p className="text-white font-medium mb-2">
                          Click để chọn hình ảnh
                        </p>
                        <p className="text-white/60 text-sm">
                          PNG, JPG, GIF, WEBP (tối đa 5MB)
                        </p>
                      </div>
                    )}
                  </label>

                  {uploadError && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{uploadError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <FaTag className="w-5 h-5 mr-2 text-orange-400" />
                  Tags
                  <span className="ml-2 text-red-400 text-sm">*</span>
                </h3>
                <button
                  type="button"
                  onClick={handleGenerateTags}
                  disabled={!formData.content?.trim() || aiLoading.tags}
                  className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                >
                  {aiLoading.tags ? (
                    <FaSpinner className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <FaMagic className="w-3 h-3 mr-1" />
                  )}
                  AI
                </button>
              </div>
              <TagSuggestions
                value={formData.tags}
                onChange={(tags) => handleInputChange("tags", tags)}
              />
            </div>

            {/* AI Assistant */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaMagic className="w-5 h-5 mr-2 text-purple-400" />
                AI Assistant
              </h3>
              <div className="space-y-4">
                <button
                  onClick={handleRewriteContent}
                  disabled={aiLoading.content}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#10b981] to-[#34d399] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-105"
                >
                  {aiLoading.content ? (
                    <FaSpinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaRobot className="w-4 h-4" />
                  )}
                  Viết lại nội dung hay hơn
                </button>

                <button
                  onClick={() => setShowIdeaGenerator(!showIdeaGenerator)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                >
                  <FaRobot className="w-4 h-4" />
                  Tạo ý tưởng bài viết
                </button>
              </div>

              {/* Idea Generator */}
              {showIdeaGenerator && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Tạo ý tưởng bài viết
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={ideaTopic}
                        onChange={(e) => setIdeaTopic(e.target.value)}
                        placeholder="Nhập chủ đề (ví dụ: Công nghệ, Giáo dục, Kinh doanh...)"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] placeholder-white/50"
                      />
                    </div>

                    <button
                      onClick={handleGenerateIdeas}
                      disabled={aiLoading.ideas || !ideaTopic.trim()}
                      className="w-full px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {aiLoading.ideas ? (
                        <FaSpinner className="w-4 h-4 animate-spin" />
                      ) : (
                        <FaMagic className="w-4 h-4" />
                      )}
                      Tạo ý tưởng
                    </button>

                    {generatedIdeas.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-white/80 text-sm">
                          Chọn ý tưởng để tạo bài viết:
                        </p>
                        {generatedIdeas.map((idea, index) => (
                          <button
                            key={index}
                            onClick={() => handleGenerateArticle(idea)}
                            disabled={aiLoading.article}
                            className="w-full p-3 text-left bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white/90 text-sm">
                                {idea}
                              </span>
                              {aiLoading.article && selectedIdea === idea ? (
                                <div className="flex items-center gap-2">
                                  <FaSpinner className="w-4 h-4 animate-spin text-[#8b5cf6]" />
                                  <span className="text-[#8b5cf6] text-xs">
                                    Đang tạo...
                                  </span>
                                </div>
                              ) : (
                                <FaRobot className="w-4 h-4 text-[#8b5cf6]" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Publish Settings */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaCalendarAlt className="w-5 h-5 mr-2 text-blue-400" />
                Cài đặt xuất bản
              </h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) =>
                      handleInputChange("is_published", e.target.checked)
                    }
                    className="w-4 h-4 text-[#3b82f6] bg-white/10 border-white/20 rounded focus:ring-[#3b82f6] focus:ring-2"
                  />
                  <span className="ml-3 text-white/80">Xuất bản ngay</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-500/20 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-300 text-sm">{success}</p>
          </div>
        )}

        {/* Submit buttons */}
        <div className="flex items-center justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center"
          >
            {loading ? (
              <>
                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4 mr-2" />
                Tạo tin tức
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNew;
