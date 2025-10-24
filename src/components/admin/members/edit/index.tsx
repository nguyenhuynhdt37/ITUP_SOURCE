"use client";

import { RichTextEditor } from "@/components/admin/shared/rich-text-editor";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaBuilding,
  FaCheck,
  FaCode,
  FaGraduationCap,
  FaSpinner,
  FaUpload,
  FaUser,
} from "react-icons/fa";

const genders = ["Nam", "Nữ", "Khác"];
const statuses = ["Đang hoạt động", "Tạm nghỉ", "Cựu thành viên"];
const roles = ["Thành viên", "Phó chủ nhiệm", "Chủ nhiệm", "Ban chấp hành"];
const faculties = [
  "CNTT",
  "Điện tử viễn thông",
  "Cơ khí",
  "Xây dựng",
  "Kinh tế",
  "Quản trị kinh doanh",
  "Kế toán",
  "Tài chính ngân hàng",
  "Luật",
  "Ngôn ngữ Anh",
  "Sư phạm",
  "Y khoa",
  "Dược",
  "Nha khoa",
  "Điều dưỡng",
  "Kỹ thuật y sinh",
  "Môi trường",
  "Hóa học",
  "Vật lý",
  "Toán học",
  "Sinh học",
  "Địa lý",
  "Lịch sử",
  "Văn học",
  "Triết học",
  "Tâm lý học",
  "Xã hội học",
  "Chính trị học",
  "Quan hệ quốc tế",
  "Báo chí",
  "Truyền thông",
  "Thiết kế",
  "Kiến trúc",
  "Nghệ thuật",
  "Âm nhạc",
  "Thể thao",
  "Du lịch",
  "Khách sạn",
  "Nông nghiệp",
  "Lâm nghiệp",
  "Thủy sản",
  "Thú y",
  "Công nghệ thực phẩm",
  "Công nghệ sinh học",
  "Khoa học máy tính",
  "An toàn thông tin",
  "Trí tuệ nhân tạo",
  "Khoa học dữ liệu",
  "Thương mại điện tử",
  "Marketing",
  "Quảng cáo",
  "Quan hệ công chúng",
  "Tổ chức sự kiện",
  "Quản lý dự án",
  "Khởi nghiệp",
  "Đổi mới sáng tạo",
];

interface Member {
  id: string;
  full_name: string;
  student_id: string;
  gender: string;
  date_of_birth: string;
  email: string;
  phone: string;
  avatar_url: string;
  major: string;
  year: number;
  class_name: string;
  faculty: string;
  school: string;
  role: string;
  joined_at: string;
  status: string;
  bio: string;
  skills: string[];
  projects: any;
  achievements: string;
  contribution_score: number;
  is_approved: boolean;
}

const EditMember = ({ memberId }: { memberId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Track original content/embedding to decide if we need to regenerate
  const [originalContent, setOriginalContent] = useState<string>("");
  const [hadEmbedding, setHadEmbedding] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    full_name: "",
    student_id: "",
    gender: "",
    date_of_birth: "",
    email: "",
    phone: "",
    major: "",
    year: 0,
    class_name: "",
    faculty: "",
    school: "ĐH Vinh",
    role: "",
    status: "Đang hoạt động",
    bio: "",
    skills: [] as string[],
    achievements: "",
    contribution_score: 0,
    is_approved: false,
  });

  const [newSkill, setNewSkill] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [suggestedMajors, setSuggestedMajors] = useState<string[]>([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showMajorSuggestions, setShowMajorSuggestions] = useState(false);
  const [forceSelectMajor, setForceSelectMajor] = useState(false);
  const [forceSelectSkill, setForceSelectSkill] = useState(false);

  // Refs for click outside detection
  const majorRef = useRef<HTMLDivElement>(null);
  const skillRef = useRef<HTMLDivElement>(null);

  /** ========== LOAD MEMBER DATA ========== */
  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .eq("id", memberId)
          .single();

        if (error) throw error;

        setFormData({
          full_name: (data as any).full_name || "",
          student_id: (data as any).student_id || "",
          gender: (data as any).gender || "",
          date_of_birth: (data as any).date_of_birth || "",
          email: (data as any).email || "",
          phone: (data as any).phone || "",
          major: (data as any).major || "",
          year: (data as any).year || 0,
          class_name: (data as any).class_name || "",
          faculty: (data as any).faculty || "",
          school: (data as any).school || "ĐH Vinh",
          role: (data as any).role || "",
          status: (data as any).status || "Đang hoạt động",
          bio: (data as any).bio || "",
          skills: (data as any).skills || [],
          achievements: (data as any).achievements || "",
          contribution_score: (data as any).contribution_score || 0,
          is_approved: (data as any).is_approved || false,
        });

        // Original content/embedding snapshot
        const existedContent = (data as any).content as string | null;
        setOriginalContent(existedContent || "");
        const embedding = (data as any).embedding as number[] | null;
        setHadEmbedding(Array.isArray(embedding) && embedding.length > 0);

        if ((data as any).avatar_url) {
          setAvatarPreview((data as any).avatar_url);
        }
      } catch (err) {
        setError("Không thể tải thông tin thành viên.");
        console.error("Error fetching member:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId]);

  /** ========== UTILITIES: BUILD CONTENT + EMBEDDING (shared with Create) ========== */
  const stripHtml = (html?: string) =>
    (html || "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const buildMemberContent = (data: typeof formData) => {
    const parts: string[] = [];
    parts.push(`Họ tên: ${data.full_name || ""}`);
    if (data.student_id) parts.push(`Mã SV: ${data.student_id}`);
    if (data.gender) parts.push(`Giới tính: ${data.gender}`);
    if (data.date_of_birth) parts.push(`Ngày sinh: ${data.date_of_birth}`);
    if (data.email) parts.push(`Email: ${data.email}`);
    if (data.phone) parts.push(`Điện thoại: ${data.phone}`);
    if (data.major) parts.push(`Chuyên ngành: ${data.major}`);
    if (data.year) parts.push(`Khóa: ${data.year}`);
    if (data.class_name) parts.push(`Lớp: ${data.class_name}`);
    if (data.faculty) parts.push(`Khoa: ${data.faculty}`);
    if (data.school) parts.push(`Trường: ${data.school}`);
    if (data.role) parts.push(`Vai trò: ${data.role}`);
    if (data.status) parts.push(`Trạng thái: ${data.status}`);
    if (data.skills?.length) parts.push(`Kỹ năng: ${data.skills.join(", ")}`);
    if (data.achievements)
      parts.push(`Thành tích: ${stripHtml(data.achievements)}`);
    if (data.bio) parts.push(`Giới thiệu: ${stripHtml(data.bio)}`);

    return parts.join("\n");
  };

  const createEmbedding = async (text: string): Promise<number[]> => {
    try {
      const res = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Embedding API error " + res.status);
      const data = await res.json();
      return Array.isArray(data?.embedding) ? data.embedding : [];
    } catch (e) {
      console.error("Error creating embedding:", e);
      return [];
    }
  };

  /** ========== LOAD SUGGESTIONS ========== */
  const loadSuggestions = async () => {
    try {
      const { data: members } = await supabase
        .from("members")
        .select("skills, major")
        .not("skills", "is", null)
        .not("major", "is", null);

      if (members) {
        const allSkills = members
          .flatMap((member: any) => member.skills || [])
          .filter((skill: string) => skill && skill.trim() !== "");
        const uniqueSkills = [...new Set(allSkills)];
        setSuggestedSkills(uniqueSkills);

        const allMajors = members
          .map((member: any) => member.major)
          .filter((major: string) => major && major.trim() !== "");
        const uniqueMajors = [...new Set(allMajors)];
        setSuggestedMajors(uniqueMajors);
      }
    } catch (err) {
      console.error("Error loading suggestions:", err);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, []);

  /** ========== HANDLE AVATAR UPLOAD ========== */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar quá lớn (max 5MB).");
      return;
    }

    setAvatarFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setError("");
  };

  /** ========== UPLOAD AVATAR TO SUPABASE ========== */
  const uploadAvatar = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `members/avatars/${fileName}`;

    const { data, error } = await supabase.storage
      .from("clb-assets")
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("clb-assets").getPublicUrl(filePath);

    return publicUrl;
  };

  /** ========== SKILL MANAGEMENT ========== */
  const addSkill = (skill?: string) => {
    const skillToAdd = skill || newSkill.trim();
    if (skillToAdd && !formData.skills.includes(skillToAdd)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillToAdd],
      });
      setNewSkill("");
      setShowSkillSuggestions(false);
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  /** ========== CLICK OUTSIDE HANDLERS ========== */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        majorRef.current &&
        !majorRef.current.contains(event.target as Node)
      ) {
        if (forceSelectMajor && suggestedMajors.length > 0) {
          // Don't close if force select is active
          return;
        }
        setShowMajorSuggestions(false);
      }

      if (
        skillRef.current &&
        !skillRef.current.contains(event.target as Node)
      ) {
        if (forceSelectSkill && suggestedSkills.length > 0) {
          // Don't close if force select is active
          return;
        }
        setShowSkillSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    forceSelectMajor,
    forceSelectSkill,
    suggestedMajors.length,
    suggestedSkills.length,
  ]);

  /** ========== SUBMIT FORM ========== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) return setError("Vui lòng nhập họ tên.");
    if (!formData.email.trim()) return setError("Vui lòng nhập email.");
    if (!formData.gender) return setError("Vui lòng chọn giới tính.");
    if (!formData.faculty) return setError("Vui lòng chọn khoa.");
    if (!formData.role) return setError("Vui lòng chọn vai trò.");

    // Force select validation
    if (
      suggestedMajors.length > 0 &&
      !suggestedMajors.includes(formData.major)
    ) {
      return setError("Vui lòng chọn chuyên ngành từ danh sách gợi ý.");
    }
    if (suggestedSkills.length > 0 && formData.skills.length === 0) {
      return setError("Vui lòng chọn ít nhất một kỹ năng từ danh sách gợi ý.");
    }

    try {
      setError("");
      setSuccess("");
      setUploading(true);

      const interval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? 90 : p + 10));
      }, 200);

      let avatarUrl = (formData as any).avatar_url;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      clearInterval(interval);
      setUploadProgress(100);
      // Determine whether content fields changed and whether to update embedding
      const newContent = buildMemberContent(formData);
      const needEmbeddingUpdate =
        !hadEmbedding || newContent !== originalContent;

      let embedding: number[] | undefined;
      if (needEmbeddingUpdate) {
        embedding = await createEmbedding(newContent);
      }

      const updatePayload: any = {
        full_name: formData.full_name,
        student_id: formData.student_id,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth || null,
        email: formData.email,
        phone: formData.phone,
        avatar_url: avatarUrl,
        major: formData.major,
        year: formData.year || null,
        class_name: formData.class_name,
        faculty: formData.faculty,
        school: formData.school,
        role: formData.role,
        status: formData.status,
        bio: formData.bio,
        skills: formData.skills,
        achievements: formData.achievements,
        contribution_score: formData.contribution_score,
        is_approved: formData.is_approved,
        updated_at: new Date().toISOString(),
      };

      if (needEmbeddingUpdate) {
        updatePayload.content = newContent;
        updatePayload.embedding = embedding || [];
      }

      const { error } = await (supabase as any)
        .from("members")
        .update(updatePayload)
        .eq("id", memberId);

      if (error) throw error;

      setSuccess("Thành viên đã được cập nhật thành công!");
      setTimeout(() => {
        router.push("/admin/members");
      }, 2000);
    } catch (err) {
      setError("Lỗi khi cập nhật thành viên. Vui lòng thử lại.");
      console.error("Error updating member:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#1a1a4d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Đang tải thông tin thành viên...
          </h1>
          <p className="text-blue-200">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#1a1a4d] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-4xl font-bold text-white">
              Chỉnh sửa thành viên
            </h1>
          </div>
          <p className="text-gray-300">Cập nhật thông tin thành viên</p>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1a1a4d]/90 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Mã sinh viên
                  </label>
                  <input
                    type="text"
                    value={formData.student_id}
                    onChange={(e) =>
                      setFormData({ ...formData, student_id: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    placeholder="Nhập mã sinh viên"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    placeholder="Nhập email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Giới tính *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    required
                  >
                    <option value="">Chọn giới tính</option>
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date_of_birth: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <FaGraduationCap className="w-4 h-4" />
                  Thông tin học tập
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative" ref={majorRef}>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Chuyên ngành{" "}
                      {suggestedMajors.length > 0 && (
                        <span className="text-red-400">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => {
                        setFormData({ ...formData, major: e.target.value });
                        setShowMajorSuggestions(e.target.value.length > 0);
                        setForceSelectMajor(suggestedMajors.length > 0);
                      }}
                      onFocus={() => {
                        setShowMajorSuggestions(true);
                        setForceSelectMajor(suggestedMajors.length > 0);
                      }}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                      placeholder={
                        suggestedMajors.length > 0
                          ? "Chọn từ danh sách gợi ý"
                          : "Nhập chuyên ngành"
                      }
                    />
                    {showMajorSuggestions && suggestedMajors.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        <div className="p-2 text-xs text-gray-600 bg-yellow-100 border-b">
                          ⚠️ Vui lòng chọn một trong các gợi ý dưới đây
                        </div>
                        {suggestedMajors.map((major, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, major });
                              setShowMajorSuggestions(false);
                              setForceSelectMajor(false);
                            }}
                            className="w-full px-4 py-3 text-left text-gray-800 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            {major}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Khóa học
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          year: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                      placeholder="Nhập khóa học"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Lớp
                    </label>
                    <input
                      type="text"
                      value={formData.class_name}
                      onChange={(e) =>
                        setFormData({ ...formData, class_name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                      placeholder="Nhập tên lớp"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Khoa *
                    </label>
                    <select
                      value={formData.faculty}
                      onChange={(e) =>
                        setFormData({ ...formData, faculty: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                      required
                    >
                      <option value="">Chọn khoa</option>
                      {faculties.map((faculty) => (
                        <option key={faculty} value={faculty}>
                          {faculty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Trường
                    </label>
                    <input
                      type="text"
                      value={formData.school}
                      onChange={(e) =>
                        setFormData({ ...formData, school: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                      placeholder="Đại học Vinh"
                      readOnly
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Mặc định: Đại học Vinh
                    </p>
                  </div>
                </div>
              </div>

              {/* Club Information */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <FaBuilding className="w-4 h-4" />
                  Thông tin câu lạc bộ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Vai trò *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                      required
                    >
                      <option value="">Chọn vai trò</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Điểm đóng góp
                    </label>
                    <input
                      type="number"
                      value={formData.contribution_score}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contribution_score: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                      placeholder="Nhập điểm đóng góp"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_approved"
                      checked={formData.is_approved}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_approved: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#3b82f6] bg-white/10 border-white/20 rounded focus:ring-[#3b82f6]"
                    />
                    <label htmlFor="is_approved" className="text-gray-300">
                      Đã được phê duyệt
                    </label>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <FaCode className="w-4 h-4" />
                  Kỹ năng
                </h3>
                <div className="space-y-4">
                  <div className="relative" ref={skillRef}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => {
                          setNewSkill(e.target.value);
                          setShowSkillSuggestions(e.target.value.length > 0);
                          setForceSelectSkill(suggestedSkills.length > 0);
                        }}
                        onFocus={() => {
                          setShowSkillSuggestions(true);
                          setForceSelectSkill(suggestedSkills.length > 0);
                        }}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                        placeholder={
                          suggestedSkills.length > 0
                            ? "Chọn từ danh sách gợi ý"
                            : "Nhập kỹ năng mới"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => addSkill()}
                        className="px-4 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white rounded-xl hover:shadow-lg transition-all duration-300"
                      >
                        Thêm
                      </button>
                    </div>
                    {showSkillSuggestions && suggestedSkills.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        <div className="p-2 text-xs text-gray-600 bg-yellow-100 border-b">
                          ⚠️ Vui lòng chọn ít nhất một kỹ năng từ danh sách gợi
                          ý
                        </div>
                        {suggestedSkills.map((skill, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              addSkill(skill);
                              setShowSkillSuggestions(false);
                              setForceSelectSkill(false);
                            }}
                            className="w-full px-4 py-3 text-left text-gray-800 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-lg text-sm flex items-center gap-2 border border-blue-500/30 hover:border-blue-400/50 transition-colors"
                        >
                          <span className="text-xs">💡</span>
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-red-400 hover:text-red-300 ml-1 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {suggestedSkills.length > 0 && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-sm mb-2">
                        Kỹ năng phổ biến:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedSkills.slice(0, 5).map((skill, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="px-3 py-1 bg-gray-600/30 text-gray-300 rounded-lg text-sm hover:bg-gray-500/40 transition-colors"
                          >
                            + {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio and Achievements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Giới thiệu bản thân
                  </label>
                  <RichTextEditor
                    value={formData.bio}
                    onChange={(value) =>
                      setFormData({ ...formData, bio: value })
                    }
                    placeholder="Giới thiệu về bản thân, sở thích, mục tiêu..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Thành tích
                  </label>
                  <RichTextEditor
                    value={formData.achievements}
                    onChange={(value) =>
                      setFormData({ ...formData, achievements: value })
                    }
                    placeholder="Các thành tích, giải thưởng, chứng chỉ..."
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <FaUser className="w-4 h-4" />
                  Ảnh đại diện
                </h3>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#3b82f6]/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                    id="avatar-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {avatarFile || avatarPreview ? (
                      <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-white/20">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] rounded-full flex items-center justify-center">
                            <FaUser className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-white font-semibold text-lg">
                            {avatarFile ? avatarFile.name : "Ảnh hiện tại"}
                          </p>
                          {avatarFile && (
                            <p className="text-gray-400 text-sm">
                              {(avatarFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                          <p className="text-green-400 text-xs mt-1">
                            ✅{" "}
                            {avatarFile ? "File mới được chọn" : "Ảnh hiện tại"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                          <FaUpload className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <span className="text-gray-300 text-lg font-medium">
                            Chọn ảnh đại diện
                          </span>
                          <p className="text-gray-500 text-sm mt-1">
                            JPG, PNG, GIF (Max 5MB)
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>Đang cập nhật thành viên...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200">
                  {success}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <FaCheck className="w-4 h-4" />
                      Cập nhật thành viên
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMember;
