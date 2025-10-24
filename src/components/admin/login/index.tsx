"use client";

import { getAdminUser } from "@/lib/getAdminUser";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaSpinner, FaUser } from "react-icons/fa";

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Kiểm tra user đã đăng nhập chưa khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, admin, error: adminCheckError } = await getAdminUser();
        if (!adminCheckError && admin && user) {
          router.push("/admin");
        }
      } catch (error) {
        console.log("Error checking authentication:", error);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Đăng nhập qua Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Kiểm tra quyền admin trực tiếp với user vừa đăng nhập
      const { data: admin, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("email", data.user?.email || "")
        .single();

      if (adminError || !admin) {
        setError("Bạn không có quyền truy cập admin.");
        setLoading(false);
        return;
      }

      // Session đã được Supabase quản lý tự động
      // Không cần lưu vào localStorage
      console.log("Admin logged in:", data.user?.email);

      // Chuyển hướng đến admin dashboard
      router.push("/admin");
    } catch (err) {
      setError("Có lỗi xảy ra khi đăng nhập");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#3b82f6]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#60a5fa]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo và Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-white font-bold text-2xl">IT</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-white/80 text-lg">Đăng nhập để quản lý hệ thống</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Email
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@itup.edu.vn"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-5 h-5 mr-2 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              © 2024 IT UP Club. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
