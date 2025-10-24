"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaGraduationCap,
  FaPhone,
  FaSearch,
  FaTrash,
  FaUser,
  FaUserCheck,
  FaUserPlus,
  FaUserTimes,
} from "react-icons/fa";

export const Members = () => {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error fetching members:", error);
        setMembers([]);
        return;
      }

      setMembers(data || []);
    } catch (error) {
      console.log("Error fetching members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus =
        currentStatus === "Đang hoạt động" ? "Tạm nghỉ" : "Đang hoạt động";
      const { error } = await (supabase as any)
        .from("members")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        console.log("Error updating member:", error);
        alert("Lỗi khi cập nhật trạng thái thành viên");
        return;
      }

      setMembers(
        members.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.log("Error updating member:", error);
      alert("Lỗi khi cập nhật trạng thái thành viên");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
      try {
        const { error } = await supabase.from("members").delete().eq("id", id);

        if (error) {
          console.log("Error deleting member:", error);
          alert("Lỗi khi xóa thành viên");
          return;
        }

        setMembers(members.filter((item) => item.id !== id));
        alert("Xóa thành viên thành công");
      } catch (error) {
        console.log("Error deleting member:", error);
        alert("Lỗi khi xóa thành viên");
      }
    }
  };

  const filteredMembers = members.filter((item) => {
    const matchesSearch =
      item.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && item.status === "Đang hoạt động") ||
      (filterStatus === "inactive" && item.status !== "Đang hoạt động");
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Quản lý Thành viên
          </h1>
          <p className="text-white/80 text-lg">
            Quản lý thông tin và quyền hạn của các thành viên
          </p>
        </div>
        <button
          onClick={() => (window.location.href = "/admin/members/create")}
          className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center"
        >
          <FaUserPlus className="w-5 h-5 mr-2" />
          Thêm thành viên
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">
                Tổng thành viên
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {members.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] flex items-center justify-center">
              <FaUser className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">
                Thành viên hoạt động
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {members.filter((m) => m.status === "Đang hoạt động").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
              <FaUserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">
                Thành viên không hoạt động
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {members.filter((m) => m.status !== "Đang hoạt động").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
              <FaUserTimes className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Admin</p>
              <p className="text-3xl font-bold text-white mt-2">
                {
                  members.filter(
                    (m) => m.role === "Chủ nhiệm" || m.role === "Phó chủ nhiệm"
                  ).length
                }
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
              <FaUser className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm thành viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          >
            <option value="all">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          >
            <option value="created_at">Ngày tham gia</option>
            <option value="full_name">Tên</option>
            <option value="email">Email</option>
            <option value="last_login">Lần đăng nhập cuối</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-white/10 to-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-white/10">
                  👤 Thành viên
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-white/10">
                  📞 Thông tin liên hệ
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-white/10">
                  🎓 Học vấn
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-white/10">
                  📊 Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-white/10">
                  📅 Tham gia
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white border-b border-white/10">
                  ⚙️ Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                        <FaUser className="w-8 h-8 text-white/40" />
                      </div>
                      <div>
                        <p className="text-white/60 text-lg font-medium">
                          {members.length === 0
                            ? "Chưa có thành viên nào"
                            : "Không tìm thấy thành viên"}
                        </p>
                        <p className="text-white/40 text-sm mt-1">
                          {members.length === 0
                            ? "Hãy thêm thành viên đầu tiên vào câu lạc bộ"
                            : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center border-2 border-white/20">
                            <span className="text-white font-bold text-lg">
                              {member.full_name?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <p className="text-white font-semibold text-lg">
                            {member.full_name || "Chưa có tên"}
                          </p>
                          <p className="text-white/60 text-sm">
                            {member.student_id
                              ? `ID: ${member.student_id}`
                              : "Chưa có ID"}
                          </p>
                          {member.gender && (
                            <p className="text-white/50 text-xs">
                              {member.gender}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-white/90 text-sm">
                          <FaEnvelope className="w-4 h-4 mr-3 text-blue-400" />
                          <span
                            className="truncate max-w-[200px]"
                            title={member.email}
                          >
                            {member.email || "Chưa có email"}
                          </span>
                        </div>
                        <div className="flex items-center text-white/90 text-sm">
                          <FaPhone className="w-4 h-4 mr-3 text-green-400" />
                          <span
                            className="truncate max-w-[200px]"
                            title={member.phone}
                          >
                            {member.phone || "Chưa có SĐT"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <FaGraduationCap className="w-4 h-4 mr-2 text-purple-400" />
                          <p className="text-white font-medium text-sm">
                            {member.major || "Chưa có chuyên ngành"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-white/70 text-xs">
                            Khóa {member.year || "Chưa có"}
                          </p>
                          <p className="text-white/60 text-xs">
                            {member.faculty || "Chưa có khoa"}
                          </p>
                          {member.class_name && (
                            <p className="text-white/50 text-xs">
                              Lớp: {member.class_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              member.status === "Đang hoạt động"
                                ? "bg-green-400"
                                : member.status === "Tạm nghỉ"
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                          ></div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              member.status === "Đang hoạt động"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : member.status === "Tạm nghỉ"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {member.status || "Chưa có trạng thái"}
                          </span>
                        </div>
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              member.role === "Chủ nhiệm"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : member.role === "Phó chủ nhiệm"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : member.role === "Ban chấp hành"
                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            }`}
                          >
                            {member.role || "Thành viên"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-white/90 text-sm">
                          <FaCalendarAlt className="w-4 h-4 mr-3 text-orange-400" />
                          <span>
                            {member.joined_at
                              ? new Date(member.joined_at).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "Chưa có"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/60">
                            Điểm đóng góp:
                          </span>
                          <span className="text-xs font-semibold text-yellow-400">
                            {member.contribution_score || 0}
                          </span>
                        </div>
                        {member.is_approved && (
                          <div className="flex items-center text-xs text-green-400">
                            <FaUserCheck className="w-3 h-3 mr-1" />
                            Đã phê duyệt
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Xem chi tiết"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/admin/members/edit/${member.id}`)
                          }
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Chỉnh sửa"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleStatus(member.id, member.status)
                          }
                          className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                            member.status === "Đang hoạt động"
                              ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          }`}
                          title={
                            member.status === "Đang hoạt động"
                              ? "Tạm nghỉ"
                              : "Kích hoạt"
                          }
                        >
                          {member.status === "Đang hoạt động" ? (
                            <FaUserTimes className="w-4 h-4" />
                          ) : (
                            <FaUserCheck className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:scale-110"
                          title="Xóa"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-white/80">
          Hiển thị {filteredMembers.length} trong tổng số {members.length} thành
          viên
        </p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
            Trước
          </button>
          <button className="px-3 py-2 bg-[#3b82f6] text-white rounded-lg">
            1
          </button>
          <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};
