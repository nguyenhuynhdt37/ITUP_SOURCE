"use client";

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCode,
  FaEnvelope,
  FaFacebook,
  FaGithub,
  FaGraduationCap,
  FaHeart,
  FaLinkedin,
  FaPhone,
  FaProjectDiagram,
  FaStar,
  FaTrophy,
  FaUser,
  FaUsers,
} from "react-icons/fa";

interface Member {
  id: string;
  full_name: string;
  student_id?: string;
  gender?: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  major?: string;
  year?: number;
  class_name?: string;
  faculty?: string;
  role?: string;
  joined_at?: string;
  status?: string;
  bio?: string;
  skills?: string[];
  projects?: any;
  achievements?: string;
  contribution_score?: number;
  is_approved?: boolean;
}

const MemberDetail = () => {
  const params = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMember(params.id as string);
    }
  }, [params.id]);

  const fetchMember = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", id)
        .eq("is_approved", true)
        .single();

      if (error) throw error;
      setMember(data);
    } catch (error) {
      console.log("Error fetching member:", error);
      setError("Không tìm thấy thành viên");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Chủ tịch":
        return "bg-red-500";
      case "Phó chủ tịch":
        return "bg-orange-500";
      case "Thư ký":
        return "bg-blue-500";
      case "Thủ quỹ":
        return "bg-green-500";
      case "Trưởng ban":
        return "bg-purple-500";
      default:
        return "bg-[#1a1a4d]";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang hoạt động":
        return "text-green-400";
      case "Tạm nghỉ":
        return "text-yellow-400";
      case "Cựu thành viên":
        return "text-gray-400";
      default:
        return "text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-white text-xl">
          Đang tải thông tin thành viên...
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl mb-4">
            Không tìm thấy thành viên
          </div>
          <Link
            href="/members"
            className="text-white/70 hover:text-white transition-colors"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#1a1a4d] text-white">
      {/* Header with clean design */}
      <div className="bg-gradient-to-r from-[#2d2d66] to-[#1a1a4d] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link
            href="/members"
            className="inline-flex items-center text-white/70 hover:text-white transition-all duration-300 mb-8 group"
          >
            <div className="flex items-center bg-white/10 rounded-xl px-4 py-2 hover:bg-white/20 transition-all duration-300">
              <FaArrowLeft className="w-4 h-4 mr-2 group-hover:translate-x-[-2px] transition-transform duration-300" />
              Quay lại danh sách
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 sticky top-8 shadow-lg">
              {/* Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  {member.avatar_url ? (
                    <Image
                      src={member.avatar_url}
                      alt={member.full_name}
                      width={120}
                      height={120}
                      className="rounded-full object-cover border-3 border-white/20 shadow-lg"
                    />
                  ) : (
                    <div className="w-30 h-30 bg-[#1a1a4d] rounded-full flex items-center justify-center border-3 border-white/20 shadow-lg">
                      <FaUser className="w-16 h-16 text-white" />
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">
                  {member.full_name}
                </h1>

                <div className="flex items-center justify-center gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getRoleColor(
                      member.role || "Thành viên"
                    )}`}
                  >
                    {member.role || "Thành viên"}
                  </span>
                  <span
                    className={`text-sm ${getStatusColor(
                      member.status || "Đang hoạt động"
                    )}`}
                  >
                    {member.status || "Đang hoạt động"}
                  </span>
                </div>

                {member.bio && (
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {member.bio}
                  </p>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <FaEnvelope className="w-4 h-4 mr-2 text-white/60" />
                  Thông tin liên hệ
                </h3>

                <div className="space-y-2">
                  {member.email && (
                    <div className="flex items-center text-sm text-white/70">
                      <FaEnvelope className="w-4 h-4 mr-3 text-white/60" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}

                  {member.phone && (
                    <div className="flex items-center text-sm text-white/70">
                      <FaPhone className="w-4 h-4 mr-3 text-white/60" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  {member.student_id && (
                    <div className="flex items-center text-sm text-white/70">
                      <FaGraduationCap className="w-4 h-4 mr-3 text-white/60" />
                      <span>MSSV: {member.student_id}</span>
                    </div>
                  )}

                  {member.class_name && (
                    <div className="flex items-center text-sm text-white/70">
                      <FaUsers className="w-4 h-4 mr-3 text-white/60" />
                      <span>{member.class_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contribution Score */}
              {member.contribution_score && member.contribution_score > 0 && (
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Điểm đóng góp</span>
                    <div className="flex items-center">
                      <FaStar className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-white font-bold text-lg">
                        {member.contribution_score}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <FaUser className="w-5 h-5 mr-3 text-white/60" />
                Thông tin cá nhân
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {member.gender && (
                  <div>
                    <label className="text-white/60 text-sm">Giới tính</label>
                    <p className="text-white font-medium">{member.gender}</p>
                  </div>
                )}

                {member.date_of_birth && (
                  <div>
                    <label className="text-white/60 text-sm">Ngày sinh</label>
                    <p className="text-white font-medium">
                      {formatDate(member.date_of_birth)} (
                      {calculateAge(member.date_of_birth)} tuổi)
                    </p>
                  </div>
                )}

                {member.major && (
                  <div>
                    <label className="text-white/60 text-sm">Ngành học</label>
                    <p className="text-white font-medium">{member.major}</p>
                  </div>
                )}

                {member.year && (
                  <div>
                    <label className="text-white/60 text-sm">Khóa</label>
                    <p className="text-white font-medium">K{member.year}</p>
                  </div>
                )}

                {member.faculty && (
                  <div>
                    <label className="text-white/60 text-sm">Khoa/Viện</label>
                    <p className="text-white font-medium">{member.faculty}</p>
                  </div>
                )}

                {member.joined_at && (
                  <div>
                    <label className="text-white/60 text-sm">
                      Ngày tham gia
                    </label>
                    <p className="text-white font-medium">
                      {formatDate(member.joined_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {member.skills && member.skills.length > 0 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <FaCode className="w-5 h-5 mr-3 text-white/60" />
                  Kỹ năng
                </h2>

                <div className="flex flex-wrap gap-3">
                  {member.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {member.projects && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <FaProjectDiagram className="w-5 h-5 mr-3 text-white/60" />
                  Dự án đã tham gia
                </h2>

                <div className="space-y-4">
                  {Array.isArray(member.projects) ? (
                    member.projects.map((project: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <h3 className="text-white font-semibold mb-2">
                          {project.name}
                        </h3>
                        <p className="text-white/70 text-sm mb-2">
                          {project.description}
                        </p>
                        <div className="flex items-center text-xs text-white/60">
                          <FaCalendarAlt className="w-3 h-3 mr-2" />
                          <span>{project.period}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-white/70">
                        {JSON.stringify(member.projects)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Achievements */}
            {member.achievements && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <FaTrophy className="w-5 h-5 mr-3 text-white/60" />
                  Thành tích & Ghi nhận
                </h2>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/80 leading-relaxed">
                    {member.achievements}
                  </p>
                </div>
              </div>
            )}

            {/* Social Links */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <FaHeart className="w-5 h-5 mr-3 text-white/60" />
                Kết nối
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center justify-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <FaEnvelope className="w-5 h-5 text-white/60" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <FaGithub className="w-5 h-5 text-white/60" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <FaLinkedin className="w-5 h-5 text-white/60" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <FaFacebook className="w-5 h-5 text-white/60" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
