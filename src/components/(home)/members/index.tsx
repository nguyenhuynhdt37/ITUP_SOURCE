"use client";

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaDownload,
  FaEnvelope,
  FaFileCsv,
  FaPhone,
  FaSearch,
  FaStar,
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

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [filterYear, setFilterYear] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("contribution_score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const MEMBERS_PER_PAGE = 8;

  useEffect(() => {
    fetchMembers();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
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

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("is_approved", true)
        .order("contribution_score", { ascending: false });

      if (error) throw error;
      const typedData: Member[] = (data as Member[]) || [];
      setMembers(typedData);

      // Extract unique values for filters
      if (typedData.length) {
        const roles = [
          ...new Set(typedData.map((m) => m.role).filter(Boolean) as string[]),
        ];
        const statuses = [
          ...new Set(
            typedData.map((m) => m.status).filter(Boolean) as string[]
          ),
        ];
        const years = (
          [
            ...new Set(
              typedData.map((m) => m.year).filter(Boolean) as number[]
            ),
          ] as number[]
        ).sort((a, b) => b - a);

        setAvailableRoles(roles);
        setAvailableStatuses(statuses);
        setAvailableYears(years);
      }
    } catch (error) {
      console.log("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.major?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "Tất cả" || member.role === filterRole;
    const matchesStatus =
      filterStatus === "Tất cả" || member.status === filterStatus;
    const matchesYear =
      filterYear === "Tất cả" || member.year?.toString() === filterYear;

    return matchesSearch && matchesRole && matchesStatus && matchesYear;
  });

  // Sort members based on selected criteria
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "full_name":
        aValue = a.full_name?.toLowerCase() || "";
        bValue = b.full_name?.toLowerCase() || "";
        break;
      case "student_id":
        aValue = a.student_id || "";
        bValue = b.student_id || "";
        break;
      case "year":
        aValue = a.year || 0;
        bValue = b.year || 0;
        break;
      case "joined_at":
        aValue = new Date(a.joined_at || "").getTime();
        bValue = new Date(b.joined_at || "").getTime();
        break;
      case "contribution_score":
        aValue = a.contribution_score || 0;
        bValue = b.contribution_score || 0;
        break;
      case "role":
        // Custom role order
        const roleOrder = [
          "Chủ tịch",
          "Phó chủ tịch",
          "Thư ký",
          "Thủ quỹ",
          "Trưởng ban",
          "Thành viên",
        ];
        aValue = roleOrder.indexOf(a.role || "Thành viên");
        bValue = roleOrder.indexOf(b.role || "Thành viên");
        break;
      default:
        aValue = a.contribution_score || 0;
        bValue = b.contribution_score || 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Calculate pagination
  const totalFilteredMembers = sortedMembers.length;
  const totalPagesCount = Math.ceil(totalFilteredMembers / MEMBERS_PER_PAGE);
  const startIndex = (currentPage - 1) * MEMBERS_PER_PAGE;
  const endIndex = startIndex + MEMBERS_PER_PAGE;
  const paginatedMembers = sortedMembers.slice(startIndex, endIndex);

  // Update total pages when filtered members change
  useEffect(() => {
    setTotalPages(totalPagesCount);
    if (currentPage > totalPagesCount && totalPagesCount > 0) {
      setCurrentPage(1);
    }
  }, [totalPagesCount, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportToCSV = () => {
    const currentDate = new Date();
    const exportDate = currentDate.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Helper function to pad strings for better alignment
    const padString = (str: string, length: number, char: string = " ") => {
      return str.padEnd(length, char);
    };

    // Helper function to format numbers with leading zeros
    const formatNumber = (num: number, digits: number = 2) => {
      return num.toString().padStart(digits, "0");
    };

    // CSV Header with club information - properly formatted
    const csvHeader = [
      "# DANH SÁCH THÀNH VIÊN CÂU LẠC BỘ IT UP",
      "# Câu lạc bộ Bình dân học vụ số - Trường Đại học Vinh",
      "# Địa chỉ: 182 Lê Duẩn, phường Trường Vinh, Nghệ An, Việt Nam",
      `# Ngày xuất báo cáo: ${exportDate}`,
      `# Tổng số thành viên: ${sortedMembers.length}`,
      "",
      // Standard CSV headers
      "STT,Họ và tên,MSSV,Giới tính,Ngày sinh,Tuổi,Email,SĐT,Chức vụ,Trạng thái,Khóa,Lớp,Khoa,Trường,Ngày tham gia,Điểm đóng góp,Kỹ năng,Ghi chú",
    ].join("\n");

    // CSV Data with proper CSV formatting
    const csvData = sortedMembers
      .map((member, index) => {
        const age = member.date_of_birth
          ? calculateAge(member.date_of_birth)
          : "";
        const skills = member.skills ? member.skills.join("; ") : "";
        const joinedDate = member.joined_at ? formatDate(member.joined_at) : "";
        const birthDate = member.date_of_birth
          ? formatDate(member.date_of_birth)
          : "";

        // Format phone number
        const phone = member.phone ? member.phone.replace(/\s/g, "") : "";

        // Standard CSV format with proper quoting
        return [
          index + 1,
          `"${member.full_name || ""}"`,
          `"${member.student_id || ""}"`,
          `"${member.gender || ""}"`,
          `"${birthDate}"`,
          `"${age}"`,
          `"${member.email || ""}"`,
          `"${phone}"`,
          `"${member.role || "Thành viên"}"`,
          `"${member.status || "Đang hoạt động"}"`,
          `"${member.year || ""}"`,
          `"${member.class_name || ""}"`,
          `"${member.faculty || ""}"`,
          `"Đại học Vinh"`,
          `"${joinedDate}"`,
          `"${member.contribution_score || 0}"`,
          `"${skills}"`,
          `"${member.bio || ""}"`,
        ].join(",");
      })
      .join("\n");

    // Footer
    const csvFooter = [
      "",
      "# Báo cáo được tạo tự động bởi hệ thống quản lý Câu lạc bộ IT UP",
      `# Thời gian tạo: ${exportDate}`,
      `# Tổng số bản ghi: ${sortedMembers.length}`,
    ].join("\n");

    // Combine header, data and footer
    const csvContent = csvHeader + "\n" + csvData + "\n" + csvFooter;

    // Create and download file
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Danh_sach_thanh_vien_IT_UP_${
        currentDate.toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Chủ tịch":
        return "bg-[#3b82f6]";
      case "Phó chủ tịch":
        return "bg-[#3b82f6]";
      case "Thư ký":
        return "bg-[#3b82f6]";
      case "Thủ quỹ":
        return "bg-[#3b82f6]";
      case "Trưởng ban":
        return "bg-[#3b82f6]";
      default:
        return "bg-[#3b82f6]";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang hoạt động":
        return "text-[#3b82f6]";
      case "Tạm nghỉ":
        return "text-[#3b82f6]";
      case "Cựu thành viên":
        return "text-[#3b82f6]";
      default:
        return "text-[#3b82f6]";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] flex items-center justify-center">
        <div className="text-white text-xl">
          Đang tải danh sách thành viên...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#000033] text-white">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-[#000033] to-[#000033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Danh sách thành viên</h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Các thành viên của Câu lạc bộ IT UP - Bình dân học vụ số
            </p>

            {/* Export Button */}
            <div className="mb-8">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1a1a4d] to-[#000033] text-white font-semibold rounded-xl hover:from-[#000033] hover:to-[#1a1a4d] transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/20"
              >
                <FaFileCsv className="w-5 h-5 mr-2" />
                <FaDownload className="w-4 h-4 mr-2" />
                Xuất danh sách CSV
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-[#1a1a4d]/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">
                  {members.length}
                </div>
                <div className="text-white/70 font-medium">Tổng thành viên</div>
              </div>
              <div className="bg-[#1a1a4d]/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">
                  {members.filter((m) => m.status === "Đang hoạt động").length}
                </div>
                <div className="text-white/70 font-medium">Đang hoạt động</div>
              </div>
              <div className="bg-[#1a1a4d]/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">
                  {
                    members.filter((m) => m.role && m.role !== "Thành viên")
                      .length
                  }
                </div>
                <div className="text-white/70 font-medium">Ban chấp hành</div>
              </div>
              <div className="bg-[#1a1a4d]/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-white mb-2">
                  {Math.max(...members.map((m) => m.year || 0))}
                </div>
                <div className="text-white/70 font-medium">Khóa mới nhất</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gradient-to-r from-[#2d2d66] to-[#2d2d66]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Block */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Tìm kiếm và lọc
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Tìm kiếm thành viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="Tất cả">Tất cả chức vụ</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              {/* Year Filter */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="Tất cả">Tất cả khóa</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    K{year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Block */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Sắp xếp</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="contribution_score">Điểm đóng góp</option>
                <option value="full_name">Tên</option>
                <option value="student_id">MSSV</option>
                <option value="year">Khóa</option>
                <option value="joined_at">Ngày tham gia</option>
                <option value="role">Chức vụ</option>
              </select>

              {/* Sort Order */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Members Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedMembers.map((member) => (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className="block bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {/* Avatar and Role */}
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={member.full_name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-15 h-15 bg-[#1a1a4d] rounded-full flex items-center justify-center">
                        <FaUser className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getRoleColor(
                        member.role || "Thành viên"
                      )}`}
                    >
                      {member.role || "Thành viên"}
                    </span>
                    <div
                      className={`text-sm mt-1 ${getStatusColor(
                        member.status || "Đang hoạt động"
                      )}`}
                    >
                      {member.status || "Đang hoạt động"}
                    </div>
                  </div>
                </div>

                {/* Name and Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {member.full_name}
                  </h3>
                  {member.student_id && (
                    <p className="text-sm text-white/70 mb-1">
                      MSSV: {member.student_id}
                    </p>
                  )}
                  {member.class_name && (
                    <p className="text-sm text-white/70">{member.class_name}</p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {member.email && (
                    <div className="flex items-center text-sm text-white/70">
                      <FaEnvelope className="w-4 h-4 mr-2" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center text-sm text-white/70">
                      <FaPhone className="w-4 h-4 mr-2" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {member.skills && member.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/20 text-xs text-white rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="px-2 py-1 bg-white/20 text-xs text-white rounded-full">
                          +{member.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Contribution Score */}
                {member.contribution_score && member.contribution_score > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Điểm đóng góp:</span>
                    <div className="flex items-center">
                      <FaStar className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-white font-semibold">
                        {member.contribution_score}
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {sortedMembers.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Không tìm thấy thành viên
              </h3>
              <p className="text-white/70">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPagesCount > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Trước
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: totalPagesCount }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        currentPage === page
                          ? "bg-white text-[#000033]"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPagesCount}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Sau
              </button>
            </div>
          )}

          {/* Pagination Info */}
          {sortedMembers.length > 0 && (
            <div className="text-center mt-6">
              <p className="text-white/70 text-sm">
                Hiển thị {startIndex + 1}-
                {Math.min(endIndex, totalFilteredMembers)} trong{" "}
                {totalFilteredMembers} thành viên
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Members;
