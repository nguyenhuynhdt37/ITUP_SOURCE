"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaBars, FaSignOutAlt, FaSpinner } from "react-icons/fa";

export const Header = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleSidebar = () => {
    // Dispatch custom event for sidebar component
    window.dispatchEvent(new CustomEvent("sidebarToggle", { detail: true }));
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    setIsLoggingOut(true);

    try {
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
      }

      // Clear any stored authentication data
      localStorage.removeItem("admin_token");
      sessionStorage.clear();

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if logout fails
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
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
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center space-x-2 px-3 py-2 text-white/80 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            title={isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          >
            {isLoggingOut ? (
              <FaSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <FaSignOutAlt className="w-4 h-4 group-hover:text-red-400" />
            )}
            <span className="hidden sm:inline text-sm">
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
