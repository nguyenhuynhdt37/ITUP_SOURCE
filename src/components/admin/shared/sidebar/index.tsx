"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaBuilding,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaFileAlt,
  FaHome,
  FaNewspaper,
  FaSignOutAlt,
  FaTimes,
  FaUsers,
} from "react-icons/fa";

export const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Listen for sidebar toggle events from header
  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarOpen(event.detail);
    };

    window.addEventListener(
      "sidebarToggle",
      handleSidebarToggle as EventListener
    );

    return () => {
      window.removeEventListener(
        "sidebarToggle",
        handleSidebarToggle as EventListener
      );
    };
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.querySelector("[data-sidebar]");
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: FaHome },
    { name: "Tin tức", href: "/admin/news", icon: FaNewspaper },
    { name: "Sự kiện", href: "/admin/events", icon: FaCalendarAlt },
    { name: "Thành viên", href: "/admin/members", icon: FaUsers },
    { name: "Tài liệu", href: "/admin/documents", icon: FaFileAlt },
    { name: "Câu lạc bộ", href: "/admin/club", icon: FaBuilding },
    { name: "Thống kê", href: "/admin/analytics", icon: FaChartBar },
    { name: "Cài đặt", href: "/admin/settings", icon: FaCog },
  ];

  // Improved active state logic
  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        data-sidebar
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center p-1">
              <Image
                src="/logo/logo-simple.svg"
                alt="ITUP Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="ml-3">
              <span className="text-white font-bold text-lg block">ITUP</span>
              <span className="text-white/60 text-xs">Admin Panel</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-[#60a5fa] transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      active
                        ? "bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white shadow-lg transform scale-[1.02]"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:transform hover:scale-[1.01]"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`w-5 h-5 mr-3 transition-colors ${
                        active
                          ? "text-white"
                          : "text-white/70 group-hover:text-white"
                      }`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {active && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Admin User
              </p>
              <p className="text-xs text-white/60 truncate">
                admin@itup.edu.vn
              </p>
            </div>
            <button
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              title="Đăng xuất"
            >
              <FaSignOutAlt className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
