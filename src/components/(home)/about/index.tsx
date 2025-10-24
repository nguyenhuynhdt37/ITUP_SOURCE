"use client";

import { useClub } from "@/hooks/useClub";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaDownload,
  FaEnvelope,
  FaFilePdf,
  FaGlobe,
  FaGraduationCap,
  FaPhone,
  FaUniversity,
  FaUsers,
  FaUserTie,
} from "react-icons/fa";

const FlipBookViewer = dynamic(
  () => import("@/components/shared/pdf-flip-viewer/index"),
  { ssr: false }
);

interface ClubHead {
  id: string;
  full_name: string;
  student_id: string;
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
  contribution_score: number;
  bio?: string;
}

const About = () => {
  const { club, loading: clubLoading } = useClub();
  const [clubHead, setClubHead] = useState<ClubHead | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string>("");
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    const fetchClubHead = async () => {
      if (!club?.head_id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .eq("id", club.head_id)
          .single();
        if (error) throw error;
        setClubHead(data as ClubHead);
      } catch (err) {
        console.log("Error fetching club head data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (club) fetchClubHead();
  }, [club]);

  const openPdf = async (url: string) => {
    setPdfUrl(url);
    setShowPdf(true);
    setPdfLoading(true);
    setPdfError("");
    setUseIframeFallback(false);
    setPdfLoading(false);
  };

  // Auto-open PDF when legal_doc_url is available
  useEffect(() => {
    if (club?.legal_doc_url && !showPdf) {
      openPdf(club.legal_doc_url);
    }
  }, [club?.legal_doc_url, showPdf]);

  if (clubLoading || loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Đang tải thông tin CLB...
          </h1>
          <p className="text-blue-200">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );

  if (!club)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUsers className="w-8 h-8 text-[#3b82f6]" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Không tìm thấy thông tin CLB
          </h1>
          <p className="text-blue-200">Vui lòng thử lại sau.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#000033] via-[#000033] to-[#000033] text-white py-20 overflow-hidden">
        {/* Banner Background */}
        {club.banner_url && (
          <div className="absolute inset-0">
            <Image
              src={club.banner_url}
              alt="Club Banner"
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        )}

        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#3b82f6]/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-[#3b82f6]/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl group-hover:scale-105 transition-transform duration-300 border border-white/20">
                  <Image
                    src={club.logo_url}
                    alt={club.name}
                    width={128}
                    height={128}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-[#3b82f6] to-white bg-clip-text text-transparent">
                {club.name}
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl mb-12 text-[#3b82f6] max-w-4xl mx-auto leading-relaxed">
              {club.description}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="text-4xl font-bold text-[#3b82f6] mb-2">
                  {club.total_members || 0}
                </div>
                <div className="text-sm font-semibold text-white">
                  Thành viên
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="text-4xl font-bold text-[#3b82f6] mb-2">
                  {club.established_at
                    ? new Date().getFullYear() -
                      new Date(club.established_at).getFullYear()
                    : 0}
                </div>
                <div className="text-sm font-semibold text-white">
                  Năm hoạt động
                </div>
              </div>
              <div className="bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 border border-white/30 hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="text-4xl font-bold text-[#3b82f6] mb-2">
                  {clubHead ? 1 : 0}
                </div>
                <div className="text-sm font-semibold text-white">
                  Chủ nhiệm
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Mission & Vision Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-[#3b82f6] bg-clip-text text-transparent">
                Sứ mệnh & Tầm nhìn
              </span>
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-[#3b82f6] via-[#1e40af] to-[#3b82f6] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Mission Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-2xl flex items-center justify-center mr-6 shadow-xl">
                  <FaUsers className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white">Sứ mệnh</h3>
              </div>
              <p className="text-white/90 leading-relaxed text-lg">
                {club.mission || "Chưa cập nhật sứ mệnh của CLB"}
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-2xl flex items-center justify-center mr-6 shadow-xl">
                  <FaGlobe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white">Tầm nhìn</h3>
              </div>
              <p className="text-white/90 leading-relaxed text-lg">
                {club.vision || "Chưa cập nhật tầm nhìn của CLB"}
              </p>
            </div>
          </div>
        </section>

        {/* PDF Viewer Section - Moved up for better layout */}
        {club.legal_doc_url && (
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-[#3b82f6] bg-clip-text text-transparent">
                  Văn bản pháp lý
                </span>
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#3b82f6] via-[#1e40af] to-[#3b82f6] mx-auto rounded-full"></div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 p-6 bg-white/5 rounded-2xl border border-white/20">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {club.legal_doc_number || "Chưa cập nhật số văn bản"}
                  </h3>
                  <p className="text-white/70">
                    {club.issued_by || "Chưa cập nhật"} -{" "}
                    {club.issued_date
                      ? new Date(club.issued_date).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <a
                    href={club.legal_doc_url}
                    download
                    className="flex items-center px-4 py-2 bg-[#3b82f6] hover:bg-[#1e40af] text-white rounded-lg transition-colors duration-200"
                  >
                    <FaDownload className="w-4 h-4 mr-2" /> Tải xuống
                  </a>
                </div>
              </div>

              {/* FlipBook Display */}
              {showPdf && isClient && (
                <div className="mt-8">
                  {pdfLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Đang tải PDF...
                      </h4>
                      <p className="text-white/70">
                        Vui lòng chờ trong giây lát
                      </p>
                    </div>
                  )}

                  {!pdfLoading && !pdfError && (
                    <div className="flex justify-center">
                      <div className="w-full max-w-6xl">
                        <FlipBookViewer file={pdfUrl} />
                      </div>
                    </div>
                  )}

                  {pdfError && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaFilePdf className="w-8 h-8 text-[#3b82f6]" />
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Lỗi tải PDF
                      </h4>
                      <p className="text-white/70 mb-6">{pdfError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Club Information Section */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-[#3b82f6] bg-clip-text text-transparent">
                Thông tin CLB
              </span>
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-[#3b82f6] via-[#1e40af] to-[#3b82f6] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Basic Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <h3 className="text-2xl font-bold mb-8 text-center text-white">
                Thông tin cơ bản
              </h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <FaCalendarAlt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium">
                      Thành lập
                    </p>
                    <p className="text-white font-bold text-lg">
                      {club.established_at
                        ? new Date(club.established_at).toLocaleDateString(
                            "vi-VN"
                          )
                        : "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <FaUsers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium">
                      Tổng số thành viên
                    </p>
                    <p className="text-white font-bold text-lg">
                      {club.total_members || 0} thành viên
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <FaEnvelope className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium">
                      Email liên hệ
                    </p>
                    <a
                      href={`mailto:${club.contact_email}`}
                      className="text-white font-bold text-lg hover:text-[#3b82f6] transition-colors"
                    >
                      {club.contact_email || "Chưa cập nhật"}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
              <h3 className="text-2xl font-bold mb-8 text-center text-white">
                Thống kê nhanh
              </h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#3b82f6] mb-3">
                    {club.total_members || 0}
                  </div>
                  <p className="text-white/80 font-medium text-lg">
                    Thành viên
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#3b82f6] mb-3">
                    {club.established_at
                      ? new Date().getFullYear() -
                        new Date(club.established_at).getFullYear()
                      : 0}
                  </div>
                  <p className="text-white/80 font-medium text-lg">
                    Năm hoạt động
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#3b82f6] mb-3">
                    {clubHead ? 1 : 0}
                  </div>
                  <p className="text-white/80 font-medium text-lg">Chủ nhiệm</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Club Head Information */}
        {clubHead && (
          <section className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-[#3b82f6] bg-clip-text text-transparent">
                  Chủ nhiệm CLB
                </span>
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-[#3b82f6] via-[#1e40af] to-[#3b82f6] mx-auto rounded-full"></div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-16 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex flex-col lg:flex-row items-center space-y-12 lg:space-y-0 lg:space-x-16">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {clubHead.avatar_url ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/30 to-[#1e40af]/30 rounded-full blur-2xl"></div>
                      <Image
                        src={clubHead.avatar_url}
                        alt={clubHead.full_name}
                        width={200}
                        height={200}
                        className="relative rounded-full object-cover border-4 border-white/40 shadow-2xl"
                      />
                      <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-[#3b82f6] rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                        <FaUsers className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/30 to-[#1e40af]/30 rounded-full blur-2xl"></div>
                      <div className="relative w-50 h-50 bg-gradient-to-br from-[#1a1a4d] to-[#000033] rounded-full flex items-center justify-center border-4 border-white/40 shadow-2xl">
                        <FaUserTie className="w-24 h-24 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-4xl font-bold mb-4 text-white">
                    {clubHead.full_name}
                  </h3>
                  <p className="text-white/90 text-2xl mb-8 font-medium">
                    {clubHead.role}
                  </p>
                  {clubHead.bio && (
                    <p className="text-white/95 mb-10 leading-relaxed text-xl max-w-3xl mx-auto lg:mx-0">
                      {clubHead.bio}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-center justify-center lg:justify-start">
                      <div className="w-14 h-14 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                        <FaGraduationCap className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium">
                          Chuyên ngành
                        </p>
                        <p className="text-white font-bold text-lg">
                          {clubHead.major || "Chưa cập nhật"} - K
                          {clubHead.year || "?"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start">
                      <div className="w-14 h-14 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                        <FaUniversity className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium">Lớp</p>
                        <p className="text-white font-bold text-lg">
                          {clubHead.class_name || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start">
                      <div className="w-14 h-14 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                        <FaEnvelope className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium">
                          Email
                        </p>
                        <a
                          href={`mailto:${clubHead.email}`}
                          className="text-white font-bold text-lg hover:text-[#3b82f6] transition-colors"
                        >
                          {clubHead.email || "Chưa cập nhật"}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start">
                      <div className="w-14 h-14 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                        <FaPhone className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium">
                          Điện thoại
                        </p>
                        <a
                          href={`tel:${clubHead.phone}`}
                          className="text-white font-bold text-lg hover:text-[#3b82f6] transition-colors"
                        >
                          {clubHead.phone || "Chưa cập nhật"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Social Links */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-[#3b82f6] bg-clip-text text-transparent">
                Kết nối với chúng tôi
              </span>
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-[#3b82f6] via-[#1e40af] to-[#3b82f6] mx-auto rounded-full"></div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-16 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex flex-wrap justify-center gap-10">
              {club.facebook_url && (
                <a
                  href={club.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-10 py-6 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] hover:from-[#1e40af] hover:to-[#1e3a8a] rounded-3xl transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl"
                >
                  <FaEnvelope className="w-8 h-8 mr-4" />
                  <span className="font-bold text-xl">Facebook</span>
                </a>
              )}
              {club.zalo_url && (
                <a
                  href={club.zalo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-10 py-6 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] hover:from-[#1e40af] hover:to-[#1e3a8a] rounded-3xl transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl"
                >
                  <FaPhone className="w-8 h-8 mr-4" />
                  <span className="font-bold text-xl">Zalo</span>
                </a>
              )}
              {club.discord_url && (
                <a
                  href={club.discord_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-10 py-6 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] hover:from-[#1e40af] hover:to-[#1e3a8a] rounded-3xl transition-all duration-300 hover:scale-110 shadow-xl hover:shadow-2xl"
                >
                  <FaUsers className="w-8 h-8 mr-4" />
                  <span className="font-bold text-xl">Discord</span>
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
