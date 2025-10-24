"use client";

import { useClub } from "@/hooks/useClub";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PageTransition = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const { club } = useClub();

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      setProgress(0);

      // Animate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 50);
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    };

    // Listen for route changes
    handleStart();

    // Simulate loading time
    const timer = setTimeout(() => {
      handleComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#000033] via-[#1a1a4d] to-[#000033] z-50 flex items-center justify-center backdrop-blur-sm">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-[#1a1a4d]/20 to-[#2d2d66]/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#2d2d66]/15 to-[#1a1a4d]/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="text-center relative z-10">
        {/* Enhanced Logo Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto mb-6 relative group">
            {/* Multiple rotating rings */}
            <div className="absolute inset-0 border-4 border-transparent border-t-[#1a1a4d]/40 border-r-[#2d2d66]/30 rounded-full animate-spin"></div>
            <div
              className="absolute inset-2 border-3 border-transparent border-t-white/40 border-r-white/30 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            ></div>
            <div
              className="absolute inset-4 border-2 border-transparent border-t-[#2d2d66]/50 border-r-[#1a1a4d]/40 rounded-full animate-spin"
              style={{ animationDuration: "1.5s" }}
            ></div>

            <Image
              src={club?.logo_url || "/logo/logo-simple.svg"}
              alt="IT UP Logo"
              width={96}
              height={96}
              className="object-contain animate-pulse drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
            />

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a4d]/15 via-[#2d2d66]/15 to-[#1a1a4d]/15 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>

        {/* Enhanced Loading Content */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white">
              Đang chuyển trang...
            </h3>
            <p className="text-white/70 text-sm">Vui lòng chờ trong giây lát</p>
          </div>

          {/* Enhanced Loading Dots */}
          <div className="flex justify-center space-x-3">
            <div className="w-3 h-3 bg-[#1a1a4d] rounded-full animate-bounce shadow-lg"></div>
            <div
              className="w-3 h-3 bg-[#2d2d66] rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 bg-white/60 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>

          {/* Progress Bar */}
          <div className="w-64 mx-auto mt-6">
            <div className="w-full bg-white/10 rounded-full h-2 shadow-inner">
              <div
                className="bg-gradient-to-r from-[#1a1a4d] via-[#2d2d66] to-[#1a1a4d] h-2 rounded-full shadow-lg transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-2">
              <span>0%</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageTransition;
