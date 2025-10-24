"use client";

import { Analytics } from "@/components/admin/analytics";
import { getAdminUser } from "@/lib/getAdminUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AnalyticsPage = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, admin, error } = await getAdminUser();

        if (!user || !admin || error) {
          // User chưa đăng nhập hoặc không phải admin, redirect đến login
          router.push("/login");
          return;
        }

        // User là admin, cho phép truy cập
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.log("Error checking authentication:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Sẽ redirect trong useEffect
  }

  return <Analytics />;
};

export default AnalyticsPage;
