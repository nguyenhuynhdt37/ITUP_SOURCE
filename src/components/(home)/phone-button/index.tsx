"use client";

import { useClub } from "@/hooks/useClub";
import { FaPhone } from "react-icons/fa";

export const PhoneButton = () => {
  const { club } = useClub();

  if (!club) return null;

  const handlePhoneClick = () => {
    // Tìm số điện thoại từ contact_email hoặc tạo số mặc định
    const phoneNumber =
      club.contact_email?.match(/\d{10,11}/)?.[0] || "0123456789";
    window.open(`tel:${phoneNumber}`, "_self");
  };

  return (
    <button
      onClick={handlePhoneClick}
      className="fixed bottom-16 left-6 z-50 bg-gradient-to-r from-[#10b981] to-[#34d399] hover:from-[#059669] hover:to-[#10b981] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group border border-white/20"
    >
      <div className="relative">
        <FaPhone className="w-6 h-6 group-hover:animate-bounce" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </button>
  );
};
