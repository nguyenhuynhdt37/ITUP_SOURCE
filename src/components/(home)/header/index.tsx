"use client";

import { useClub } from "@/hooks/useClub";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  console.log("user pathname", pathname);

  const { club, loading } = useClub();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems = [
    { name: "Trang Chủ", href: "/" },
    { name: "Giới thiệu", href: "/about" },
    { name: "Thành viên", href: "/members" },
    { name: "Tin tức", href: "/news" },
    { name: "Sự kiện", href: "/events" },
    { name: "Tài liệu", href: "/documents" },
    { name: "Liên hệ", href: "/contact" },

    { name: "Quiz", href: "/quiz" },
    { name: "Admin", href: "/admin" },
  ];

  if (!mounted) {
    return (
      <header className="bg-gradient-to-r from-[#2d2d66] via-[#2d2d66] to-[#2d2d66] shadow-xl sticky top-0 z-50 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="group">
                <div className="relative w-16 h-16 group-hover:scale-105 transition-transform duration-200 bg-white/20 rounded-full p-2 shadow-lg">
                  <Image
                    src="/logo/logo-simple.svg"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </Link>
            </div>
            {/* Placeholder for navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 mx-8">
              <div className="flex space-x-2">
                {navigationItems.map((item) => (
                  <div
                    key={item.name}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/90"
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
            {/* Mobile menu button placeholder */}
            <div className="lg:hidden flex-shrink-0">
              <div className="p-3 rounded-xl text-white">
                <FaBars className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-[#2d2d66] via-[#2d2d66] to-[#2d2d66] shadow-xl sticky top-0 z-50 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="group">
              <div className="relative w-16 h-16 group-hover:scale-105 transition-transform duration-200 bg-white/20 rounded-full p-2 shadow-lg">
                <Image
                  src={club?.logo_url || "/logo/logo-simple.svg"}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <div className="flex space-x-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 whitespace-nowrap ${
                      isActive
                        ? "bg-[#1a1a4d] text-white"
                        : "text-white/90 hover:bg-[#1a1a4d]/20 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 rounded-xl text-white hover:bg-[#1a1a4d]/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1a1a4d]/30 transition-all duration-200"
            >
              {isMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-4 pt-4 pb-6 space-y-2 bg-gradient-to-b from-[#2d2d66] to-[#2d2d66] rounded-2xl mt-4 shadow-2xl border border-[#1a1a4d]/30">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-6 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 border ${
                      isActive
                        ? "bg-[#1a1a4d] text-white border-[#1a1a4d]/50"
                        : "text-white hover:bg-[#1a1a4d]/20 hover:text-white border-transparent hover:border-[#1a1a4d]/30"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
