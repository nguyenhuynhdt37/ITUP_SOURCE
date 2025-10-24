"use client";

import { useClub } from "@/hooks/useClub";
import Image from "next/image";
import { useEffect, useState } from "react";

const Loading = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Đang khởi tạo...");
  const { club } = useClub();

  useEffect(() => {
    const loadingSteps = [
      { text: "Đang khởi tạo...", progress: 20 },
      { text: "Kết nối cơ sở dữ liệu...", progress: 40 },
      { text: "Tải thông tin thành viên...", progress: 60 },
      { text: "Xử lý dữ liệu...", progress: 80 },
      { text: "Hoàn tất...", progress: 100 },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setLoadingText(loadingSteps[currentStep].text);
        setProgress(loadingSteps[currentStep].progress);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000033] via-[#1a1a4d] to-[#000033] flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#1a1a4d]/20 to-[#2d2d66]/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#2d2d66]/15 to-[#1a1a4d]/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#000033]/10 to-[#1a1a4d]/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="text-center relative z-10">
        {/* Logo Animation with Enhanced Effects */}
        <div className="relative mb-12">
          <div className="w-32 h-32 mx-auto mb-6 relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-[#1a1a4d]/40 border-r-[#2d2d66]/30 rounded-full animate-spin"></div>
            {/* Inner pulsing ring */}
            <div
              className="absolute inset-2 border-2 border-transparent border-t-white/30 border-r-white/20 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            ></div>
            {/* Logo with glow effect */}
            <div className="relative">
              <Image
                src={club?.logo_url || "/logo/logo-simple.svg"}
                alt="IT UP Logo"
                width={128}
                height={128}
                className="object-contain animate-pulse drop-shadow-2xl"
              />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a4d]/15 via-[#2d2d66]/15 to-[#1a1a4d]/15 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Loading Text */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white mb-2">
              Câu lạc bộ IT UP
            </h2>
            <p className="text-white/80 text-lg font-medium">{loadingText}</p>
          </div>

          {/* Enhanced Loading Dots */}
          <div className="flex justify-center space-x-3 mt-8">
            <div className="w-4 h-4 bg-[#1a1a4d] rounded-full animate-bounce shadow-lg"></div>
            <div
              className="w-4 h-4 bg-[#2d2d66] rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-4 h-4 bg-white/60 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="w-80 mx-auto mt-10">
          <div className="w-full bg-white/10 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-[#1a1a4d] via-[#2d2d66] to-[#1a1a4d] h-3 rounded-full shadow-lg transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-2">
            <span>0%</span>
            <span className="font-semibold">{progress}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-12 space-y-2">
          <p className="text-white/60 text-sm font-medium">
            Bình dân học vụ số - Trường Đại học Vinh
          </p>
          <div className="flex justify-center space-x-4 text-xs text-white/40">
            <span>•</span>
            <span>Kết nối</span>
            <span>•</span>
            <span>Sáng tạo</span>
            <span>•</span>
            <span>Phát triển</span>
            <span>•</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
