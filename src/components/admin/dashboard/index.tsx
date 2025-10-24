"use client";

import {
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaDatabase,
  FaFileAlt,
  FaGlobe,
  FaLock,
  FaMobile,
  FaNewspaper,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] to-[#1a1a4d] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-2xl mb-6 shadow-2xl">
            <FaCog className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-white via-[#3b82f6] to-white bg-clip-text text-transparent">
              Hệ thống quản trị
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[#3b82f6] max-w-4xl mx-auto leading-relaxed">
            Quản lý toàn diện câu lạc bộ IT UP với các tính năng hiện đại và
            giao diện thân thiện
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Quản lý thành viên */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <FaUsers className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Quản lý thành viên
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Thêm, chỉnh sửa, quản lý thông tin thành viên với đầy đủ tính năng
              như avatar, kỹ năng, thành tích và trạng thái hoạt động.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                Thêm thành viên
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                Chỉnh sửa
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                Avatar
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                Kỹ năng
              </span>
            </div>
          </div>

          {/* Quản lý tin tức */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <FaNewspaper className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Quản lý tin tức
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Tạo và quản lý các bài viết tin tức với rich text editor, upload
              hình ảnh, và quản lý trạng thái xuất bản.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                Rich Text
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                Hình ảnh
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                Xuất bản
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                SEO
              </span>
            </div>
          </div>

          {/* Quản lý sự kiện */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <FaCalendarAlt className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Quản lý sự kiện
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Tổ chức và quản lý các sự kiện của câu lạc bộ với thông tin chi
              tiết, đăng ký tham gia và theo dõi.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                Lịch trình
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                Đăng ký
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                Thông báo
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                Theo dõi
              </span>
            </div>
          </div>

          {/* Quản lý tài liệu */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <FaFileAlt className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Quản lý tài liệu
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Upload và quản lý tài liệu PDF với tính năng AI chunking,
              embedding và tìm kiếm thông minh.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30">
                PDF Upload
              </span>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30">
                AI Chunking
              </span>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30">
                Embedding
              </span>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30">
                Tìm kiếm
              </span>
            </div>
          </div>

          {/* Quản lý câu lạc bộ */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <FaGlobe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Thông tin CLB
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Quản lý thông tin câu lạc bộ, logo, banner, thông tin pháp lý và
              các liên kết mạng xã hội.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm border border-red-500/30">
                Logo & Banner
              </span>
              <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm border border-red-500/30">
                Thông tin pháp lý
              </span>
              <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm border border-red-500/30">
                Mạng xã hội
              </span>
              <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm border border-red-500/30">
                Cập nhật
              </span>
            </div>
          </div>

          {/* Báo cáo & Thống kê */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <FaChartBar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Báo cáo & Thống kê
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              Theo dõi và phân tích dữ liệu hoạt động của câu lạc bộ với các
              biểu đồ và báo cáo chi tiết.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30">
                Biểu đồ
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30">
                Phân tích
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30">
                Xuất báo cáo
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30">
                Real-time
              </span>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-white to-[#3b82f6] bg-clip-text text-transparent">
                Công nghệ sử dụng
              </span>
            </h2>
            <p className="text-white/80 text-lg">
              Hệ thống được xây dựng với các công nghệ hiện đại và bảo mật cao
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <FaDatabase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Supabase</h3>
              <p className="text-white/70 text-sm">Database & Auth</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <FaMobile className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Next.js 14</h3>
              <p className="text-white/70 text-sm">React Framework</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <FaShieldAlt className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">TypeScript</h3>
              <p className="text-white/70 text-sm">Type Safety</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <FaLock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Security</h3>
              <p className="text-white/70 text-sm">Bảo mật cao</p>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-white to-[#3b82f6] bg-clip-text text-transparent">
                Tính năng nổi bật
              </span>
            </h2>
            <p className="text-white/80 text-lg">
              Hệ thống quản trị với đầy đủ tính năng hiện đại
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-xl flex items-center justify-center shadow-lg">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Quản lý thành viên toàn diện
                  </h3>
                  <p className="text-white/80">
                    Thêm, chỉnh sửa, quản lý thông tin thành viên với avatar, kỹ
                    năng, thành tích và trạng thái hoạt động.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaNewspaper className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Rich Text Editor
                  </h3>
                  <p className="text-white/80">
                    Tạo và chỉnh sửa nội dung với editor mạnh mẽ, hỗ trợ upload
                    hình ảnh và định dạng văn bản.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaFileAlt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    AI-Powered Document
                  </h3>
                  <p className="text-white/80">
                    Upload tài liệu PDF với tính năng AI chunking, embedding và
                    tìm kiếm thông minh.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaCalendarAlt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Quản lý sự kiện
                  </h3>
                  <p className="text-white/80">
                    Tổ chức và quản lý sự kiện với thông tin chi tiết, đăng ký
                    tham gia và theo dõi.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaGlobe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Thông tin CLB
                  </h3>
                  <p className="text-white/80">
                    Quản lý thông tin câu lạc bộ, logo, banner, thông tin pháp
                    lý và liên kết mạng xã hội.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaChartBar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Báo cáo & Thống kê
                  </h3>
                  <p className="text-white/80">
                    Theo dõi và phân tích dữ liệu hoạt động với biểu đồ và báo
                    cáo chi tiết.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
