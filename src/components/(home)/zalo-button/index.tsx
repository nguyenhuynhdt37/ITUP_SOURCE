"use client";

import { useClub } from "@/hooks/useClub";
import { FaCommentDots } from "react-icons/fa";

export const ZaloButton = () => {
  const { club } = useClub();

  if (!club?.zalo_url) return null;

  const handleZaloClick = () => {
    window.open(club.zalo_url, "_blank");
  };

  return (
    <button
      onClick={handleZaloClick}
      className="fixed bottom-28 left-6 z-50 bg-gradient-to-r from-[#0068FF] to-[#0068FF] hover:from-[#0052CC] hover:to-[#0052CC] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group border border-white/20"
    >
      <div className="relative">
        <FaCommentDots className="w-6 h-6 group-hover:animate-bounce" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </button>
  );
};
