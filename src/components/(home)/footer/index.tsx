"use client";

import { useClub } from "@/hooks/useClub";
import Image from "next/image";
import Link from "next/link";
import {
  FaEnvelope,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { club } = useClub();

  const quickLinks = [
    { name: "Trang Chủ", href: "/" },
    { name: "Giới thiệu", href: "/about" },
    { name: "Thành viên", href: "/members" },
    { name: "Tin tức", href: "/news" },
    { name: "Tài liệu", href: "/documents" },
    { name: "Đại biểu", href: "/delegates" },
    { name: "Liên hệ", href: "/contact" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebook,
      href: "#",
      color: "hover:text-[#3b82f6]",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      href: "#",
      color: "hover:text-[#3b82f6]",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "#",
      color: "hover:text-[#3b82f6]",
    },
    {
      name: "YouTube",
      icon: FaYoutube,
      href: "#",
      color: "hover:text-[#3b82f6]",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      href: "#",
      color: "hover:text-[#3b82f6]",
    },
    {
      name: "GitHub",
      icon: FaGithub,
      href: "#",
      color: "hover:text-[#3b82f6]",
    },
  ];

  return (
    <footer className="bg-gradient-to-r from-[#000033] via-[#000033] to-[#000033] text-white border-t border-[#1a1a4d]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-12 h-12">
                <Image
                  src={club?.logo_url || "/logo/logo-simple.svg"}
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">IT UP</h3>
                <p className="text-sm text-white/70">
                  Câu lạc bộ Bình dân học vụ số
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Câu lạc bộ IT UP - Bình dân học vụ số trực thuộc Đoàn Trường Đại
              học Vinh, hoạt động dưới sự giám sát của Ban Thường vụ Đoàn
              Trường.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Thông tin liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-4 h-4 mt-1 text-white/70" />
                <div className="text-sm text-white/70">
                  <p>182 Lê Duẩn, phường Trường Vinh</p>
                  <p>Nghệ An, Việt Nam</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="w-4 h-4 text-white/70" />
                <a
                  href="mailto:nguyenhuynhdt37@gmail.com"
                  className="text-sm text-white/70 hover:text-white transition-colors duration-200"
                >
                  nguyenhuynhdt37@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="w-4 h-4 text-white/70" />
                <a
                  href="tel:+84586955678"
                  className="text-sm text-white/70 hover:text-white transition-colors duration-200"
                >
                  (058) 695 5678
                </a>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Theo dõi chúng tôi</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`w-10 h-10 bg-[#1a1a4d] rounded-full flex items-center justify-center text-white transition-all duration-200 hover:bg-[#000033] ${social.color}`}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <div className="mt-4">
              <p className="text-sm text-white/70">
                Kết nối với chúng tôi để cập nhật tin tức mới nhất
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#1a1a4d]/30 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-white/70">
              <p>
                Copyright © {currentYear} IT UP Club. Tất cả quyền được bảo lưu.
              </p>
              <p className="mt-1">Thiết kế & Phát triển bởi nguyenhuynhdt37</p>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                Chính sách bảo mật
              </Link>
              <Link
                href="/terms"
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                Điều khoản sử dụng
              </Link>
              <Link
                href="/sitemap"
                className="text-white/70 hover:text-white transition-colors duration-200"
              >
                Sơ đồ trang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
