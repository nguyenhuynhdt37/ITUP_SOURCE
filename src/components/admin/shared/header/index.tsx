"use client";

import { FaBars } from "react-icons/fa";

export const Header = () => {
  const toggleSidebar = () => {
    // Dispatch custom event for sidebar component
    window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: true }));
  };

  return (
    <div className="sticky top-0 z-30 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="flex items-center justify-between h-16 px-6">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-white hover:text-[#60a5fa] transition-colors p-2 rounded-lg hover:bg-white/10"
        >
          <FaBars className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:block">
            <p className="text-sm text-white/80">Chào mừng trở lại!</p>
            <p className="text-lg font-semibold text-white">
              ITUP Admin Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-white/60">
            <span>Hôm nay</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString("vi-VN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
