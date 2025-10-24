"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaEdit,
  FaFileAlt,
  FaSave,
  FaSpinner,
  FaUpload,
  FaUser,
} from "react-icons/fa";

interface ClubData {
  id: string;
  name: string;
  description: string | null;
  mission: string | null;
  vision: string | null;
  established_at: string | null;
  logo_url: string | null;
  banner_url: string | null;
  contact_email: string | null;
  facebook_url: string | null;
  zalo_url: string | null;
  discord_url: string | null;
  legal_doc_url: string | null;
  legal_doc_number: string | null;
  issued_by: string | null;
  issued_date: string | null;
  head_id: string | null;
  total_members: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const ClubManagement = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [clubData, setClubData] = useState<ClubData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mission: "",
    vision: "",
    established_at: "",
    contact_email: "",
    facebook_url: "",
    zalo_url: "",
    discord_url: "",
    legal_doc_number: "",
    issued_by: "",
    issued_date: "",
  });

  /** ========== LOAD CLUB DATA ========== */
  useEffect(() => {
    const loadClubData = async () => {
      try {
        const { data, error } = await supabase
          .from("clubs")
          .select("*")
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          const club = data as ClubData;
          setClubData(club);
          setFormData({
            name: club.name || "",
            description: club.description || "",
            mission: club.mission || "",
            vision: club.vision || "",
            established_at: club.established_at || "",
            contact_email: club.contact_email || "",
            facebook_url: club.facebook_url || "",
            zalo_url: club.zalo_url || "",
            discord_url: club.discord_url || "",
            legal_doc_number: club.legal_doc_number || "",
            issued_by: club.issued_by || "",
            issued_date: club.issued_date || "",
          });
        }

        setLoading(false);
      } catch (err) {
        setError("Không thể tải thông tin câu lạc bộ.");
        setLoading(false);
      }
    };

    loadClubData();
  }, []);

  /** ========== HANDLE FILE UPLOAD ========== */
  const handleFileUpload = async (
    file: File,
    type: "logo" | "banner" | "legal_doc"
  ) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `club/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from("clb-assets")
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("clb-assets")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      throw new Error(
        `Không thể upload ${
          type === "logo"
            ? "logo"
            : type === "banner"
            ? "banner"
            : "tài liệu pháp lý"
        }`
      );
    }
  };

  /** ========== HANDLE LOGO UPLOAD ========== */
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Chỉ cho phép tải lên file hình ảnh (JPG, PNG, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Logo quá lớn (max 5MB).");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? 90 : p + 10));
      }, 200);

      const logoUrl = await handleFileUpload(file, "logo");

      clearInterval(interval);
      setUploadProgress(100);

      // Update club data
      if (clubData) {
        const { error } = await (supabase as any)
          .from("clubs")
          .update({ logo_url: logoUrl })
          .eq("id", clubData.id);

        if (error) throw error;

        setClubData({ ...clubData, logo_url: logoUrl });
        setSuccess("Logo đã được cập nhật thành công!");
      }

      setUploading(false);
      setUploadProgress(0);
    } catch (err) {
      setError("Lỗi khi upload logo. Vui lòng thử lại.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /** ========== HANDLE BANNER UPLOAD ========== */
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Chỉ cho phép tải lên file hình ảnh (JPG, PNG, GIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Banner quá lớn (max 10MB).");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? 90 : p + 10));
      }, 200);

      const bannerUrl = await handleFileUpload(file, "banner");

      clearInterval(interval);
      setUploadProgress(100);

      // Update club data
      if (clubData) {
        const { error } = await (supabase as any)
          .from("clubs")
          .update({ banner_url: bannerUrl })
          .eq("id", clubData.id);

        if (error) throw error;

        setClubData({ ...clubData, banner_url: bannerUrl });
        setSuccess("Banner đã được cập nhật thành công!");
      }

      setUploading(false);
      setUploadProgress(0);
    } catch (err) {
      setError("Lỗi khi upload banner. Vui lòng thử lại.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /** ========== HANDLE LEGAL DOC UPLOAD ========== */
  const handleLegalDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Chỉ cho phép tải lên file PDF.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Tài liệu pháp lý quá lớn (max 20MB).");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? 90 : p + 10));
      }, 200);

      const legalDocUrl = await handleFileUpload(file, "legal_doc");

      clearInterval(interval);
      setUploadProgress(100);

      // Update club data
      if (clubData) {
        const { error } = await (supabase as any)
          .from("clubs")
          .update({ legal_doc_url: legalDocUrl })
          .eq("id", clubData.id);

        if (error) throw error;

        setClubData({ ...clubData, legal_doc_url: legalDocUrl });
        setSuccess("Tài liệu pháp lý đã được cập nhật thành công!");
      }

      setUploading(false);
      setUploadProgress(0);
    } catch (err) {
      setError("Lỗi khi upload tài liệu pháp lý. Vui lòng thử lại.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /** ========== HANDLE SAVE ========== */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!clubData) {
        // Create new club
        const { data, error } = await (supabase as any)
          .from("clubs")
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            mission: formData.mission.trim() || null,
            vision: formData.vision.trim() || null,
            established_at: formData.established_at || null,
            contact_email: formData.contact_email.trim() || null,
            facebook_url: formData.facebook_url.trim() || null,
            zalo_url: formData.zalo_url.trim() || null,
            discord_url: formData.discord_url.trim() || null,
            legal_doc_number: formData.legal_doc_number.trim() || null,
            issued_by: formData.issued_by.trim() || null,
            issued_date: formData.issued_date || null,
          })
          .select()
          .single();

        if (error) throw error;
        setClubData(data);
      } else {
        // Update existing club
        const { error } = await (supabase as any)
          .from("clubs")
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            mission: formData.mission.trim() || null,
            vision: formData.vision.trim() || null,
            established_at: formData.established_at || null,
            contact_email: formData.contact_email.trim() || null,
            facebook_url: formData.facebook_url.trim() || null,
            zalo_url: formData.zalo_url.trim() || null,
            discord_url: formData.discord_url.trim() || null,
            legal_doc_number: formData.legal_doc_number.trim() || null,
            issued_by: formData.issued_by.trim() || null,
            issued_date: formData.issued_date || null,
          })
          .eq("id", clubData.id);

        if (error) throw error;
      }

      setSuccess("Thông tin câu lạc bộ đã được cập nhật thành công!");
      setIsEditing(false);
    } catch (err) {
      setError("Lỗi khi cập nhật thông tin câu lạc bộ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Đang tải thông tin câu lạc bộ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]">
      <div className="container mx-auto px-4 py-8">
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
              Quản Lý Câu Lạc Bộ
            </h1>
          </div>
          <p className="text-gray-300">Cập nhật thông tin câu lạc bộ</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1a1a4d]/90 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mb-6">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tên câu lạc bộ *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Nhập tên câu lạc bộ"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="contact@club.com"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Ngày thành lập
                </label>
                <input
                  type="date"
                  value={formData.established_at}
                  onChange={(e) =>
                    setFormData({ ...formData, established_at: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Số thành viên
                </label>
                <input
                  type="number"
                  value={clubData?.total_members || 0}
                  disabled
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Mô tả câu lạc bộ
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Mô tả về câu lạc bộ"
                rows={4}
              />
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Sứ mệnh
                </label>
                <textarea
                  value={formData.mission}
                  onChange={(e) =>
                    setFormData({ ...formData, mission: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Sứ mệnh của câu lạc bộ"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Tầm nhìn
                </label>
                <textarea
                  value={formData.vision}
                  onChange={(e) =>
                    setFormData({ ...formData, vision: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Tầm nhìn của câu lạc bộ"
                  rows={3}
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="mb-8">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <FaUser className="w-4 h-4" />
                Liên kết mạng xã hội
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook_url: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="https://facebook.com/club"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Zalo
                  </label>
                  <input
                    type="url"
                    value={formData.zalo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, zalo_url: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="https://zalo.me/club"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Discord
                  </label>
                  <input
                    type="url"
                    value={formData.discord_url}
                    onChange={(e) =>
                      setFormData({ ...formData, discord_url: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="https://discord.gg/club"
                  />
                </div>
              </div>
            </div>

            {/* Legal Documents */}
            <div className="mb-8">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <FaFileAlt className="w-4 h-4" />
                Tài liệu pháp lý
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Số tài liệu
                  </label>
                  <input
                    type="text"
                    value={formData.legal_doc_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        legal_doc_number: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Số quyết định thành lập"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Cơ quan cấp
                  </label>
                  <input
                    type="text"
                    value={formData.issued_by}
                    onChange={(e) =>
                      setFormData({ ...formData, issued_by: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Trường Đại học ABC"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Ngày cấp
                  </label>
                  <input
                    type="date"
                    value={formData.issued_date}
                    onChange={(e) =>
                      setFormData({ ...formData, issued_date: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="mb-8">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <FaUpload className="w-4 h-4" />
                Tải lên tài liệu
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo Upload */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-3">
                    Logo câu lạc bộ
                  </h4>
                  {clubData?.logo_url ? (
                    <div className="mb-3">
                      <img
                        src={clubData.logo_url}
                        alt="Club Logo"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  ) : null}
                  <input
                    type="file"
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaUpload className="w-4 h-4" />
                    {uploading ? "Đang tải lên..." : "Chọn logo"}
                  </label>
                  <p className="text-gray-400 text-xs mt-1">
                    JPG, PNG, GIF - Max 5MB
                  </p>
                </div>

                {/* Banner Upload */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-3">
                    Banner câu lạc bộ
                  </h4>
                  {clubData?.banner_url ? (
                    <div className="mb-3">
                      <img
                        src={clubData.banner_url}
                        alt="Club Banner"
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    </div>
                  ) : null}
                  <input
                    type="file"
                    onChange={handleBannerUpload}
                    accept="image/*"
                    className="hidden"
                    id="banner-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="banner-upload"
                    className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaUpload className="w-4 h-4" />
                    {uploading ? "Đang tải lên..." : "Chọn banner"}
                  </label>
                  <p className="text-gray-400 text-xs mt-1">
                    JPG, PNG, GIF - Max 10MB
                  </p>
                </div>

                {/* Legal Doc Upload */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-3">
                    Tài liệu pháp lý
                  </h4>
                  {clubData?.legal_doc_url ? (
                    <div className="mb-3">
                      <a
                        href={clubData.legal_doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                      >
                        <FaFileAlt className="w-4 h-4" />
                        Xem tài liệu
                      </a>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    onChange={handleLegalDocUpload}
                    accept=".pdf"
                    className="hidden"
                    id="legal-doc-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="legal-doc-upload"
                    className="cursor-pointer flex items-center gap-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaUpload className="w-4 h-4" />
                    {uploading ? "Đang tải lên..." : "Chọn tài liệu"}
                  </label>
                  <p className="text-gray-400 text-xs mt-1">
                    PDF only - Max 20MB
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <span>Đang tải lên...</span>
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
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 mb-6">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 mb-6">
                {success}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
