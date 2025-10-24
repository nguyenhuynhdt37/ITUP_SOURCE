"use client";

import { useClub } from "@/hooks/useClub";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaHeart,
  FaHome,
  FaLightbulb,
  FaRocket,
  FaSearch,
  FaUsers,
} from "react-icons/fa";

const NotFound = () => {
  const [floatingElements, setFloatingElements] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);
  const { club } = useClub();

  useEffect(() => {
    // Generate floating elements
    const elements = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setFloatingElements(elements);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] via-[#1a1a4d] to-[#000033] flex items-center justify-center relative overflow-hidden py-8">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes */}
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Large background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#1a1a4d]/10 to-[#2d2d66]/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#2d2d66]/8 to-[#1a1a4d]/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#000033]/5 to-[#1a1a4d]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="text-center max-w-3xl mx-auto px-4 relative z-10">
        {/* Enhanced Logo with Animation */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 relative group">
            {/* Rotating rings */}
            <div className="absolute inset-0 border-4 border-transparent border-t-[#1a1a4d]/40 border-r-[#2d2d66]/30 rounded-full animate-spin"></div>
            <div
              className="absolute inset-2 border-2 border-transparent border-t-white/30 border-r-white/20 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "3s" }}
            ></div>

            <Image
              src={club?.logo_url || "/logo/logo-simple.svg"}
              alt="IT UP Logo"
              width={128}
              height={128}
              className="object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
            />

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a4d]/15 via-[#2d2d66]/15 to-[#1a1a4d]/15 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
          </div>
        </div>

        {/* Enhanced 404 Content */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-6xl font-bold text-white/20 animate-pulse">
              404
            </h1>
            <h2 className="text-3xl font-bold text-white mb-3">
              Oops! Trang không tồn tại
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-xl mx-auto">
              Có vẻ như bạn đã lạc đường! Đừng lo, chúng tôi sẽ giúp bạn tìm lại
              đường.
            </p>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/"
              className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1a1a4d] to-[#2d2d66] text-white font-bold rounded-xl hover:from-[#2d2d66] hover:to-[#1a1a4d] transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <FaHome className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Về trang chủ
            </Link>

            <Link
              href="/members"
              className="group inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40"
            >
              <FaUsers className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Khám phá thành viên
            </Link>
          </div>

          {/* Enhanced Search Suggestion */}
          <div className="mt-10 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center">
              <FaSearch className="w-5 h-5 mr-2 text-[#3b82f6]" />
              Có thể bạn đang tìm kiếm:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { href: "/", label: "Trang chủ", icon: FaHome },
                { href: "/members", label: "Thành viên", icon: FaUsers },
                { href: "/news", label: "Tin tức", icon: FaRocket },
                { href: "/documents", label: "Tài liệu", icon: FaLightbulb },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className="group p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/30"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#3b82f6] to-[#1e40af] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white/80 group-hover:text-white font-medium text-sm">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Motivational Message */}
          <div className="mt-8 p-4 bg-gradient-to-r from-[#1a1a4d]/20 via-[#2d2d66]/20 to-[#1a1a4d]/20 rounded-xl border border-white/20">
            <div className="flex items-center justify-center space-x-2 text-white/80">
              <FaHeart className="w-4 h-4 text-white/60 animate-pulse" />
              <p className="text-base font-medium">
                "Mỗi lỗi 404 là một cơ hội khám phá điều mới!"
              </p>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="mt-10 pt-6 border-t border-white/10">
            <div className="space-y-2">
              <p className="text-white/60 text-base font-medium">
                Câu lạc bộ IT UP - Bình dân học vụ số
              </p>
              <p className="text-white/40 text-sm">Trường Đại học Vinh</p>
              <div className="flex justify-center space-x-4 text-xs text-white/30">
                <span>Kết nối</span>
                <span>•</span>
                <span>Sáng tạo</span>
                <span>•</span>
                <span>Phát triển</span>
                <span>•</span>
                <span>Đổi mới</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
