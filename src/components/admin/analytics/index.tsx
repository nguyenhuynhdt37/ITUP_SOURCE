"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaEye,
  FaFileAlt,
  FaHeart,
  FaNewspaper,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import { GrowthChart } from "./GrowthChart";

interface AnalyticsData {
  totalMembers: number;
  totalEvents: number;
  totalNews: number;
  totalDocuments: number;
  totalViews: number;
  totalLikes: number;
  newMembersThisMonth: number;
  upcomingEvents: number;
  publishedNews: number;
  growthData: {
    month: string;
    members: number;
    events: number;
    news: number;
    views: number;
  }[];
  recentActivity: {
    type: string;
    title: string;
    date: string;
    count: number;
  }[];
}

export const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch basic counts
      const [
        membersResult,
        eventsResult,
        newsResult,
        documentsResult,
        growthResult,
        activityResult,
      ] = await Promise.all([
        // Total members
        supabase.from("members").select("id, created_at, status"),

        // Total events
        supabase
          .from("events")
          .select("id, created_at, start_time, is_cancelled"),

        // Total news
        supabase
          .from("news")
          .select("id, created_at, views, likes, is_published"),

        // Total documents
        supabase.from("resources").select("id, created_at"),

        // Growth data for charts
        fetchGrowthData(),

        // Recent activity
        fetchRecentActivity(),
      ]);

      if (membersResult.error) throw membersResult.error;
      if (eventsResult.error) throw eventsResult.error;
      if (newsResult.error) throw newsResult.error;
      if (documentsResult.error) throw documentsResult.error;

      const members = membersResult.data || [];
      const events = eventsResult.data || [];
      const news = newsResult.data || [];
      const documents = documentsResult.data || [];

      // Calculate metrics
      const totalMembers = members.length;
      const totalEvents = events.length;
      const totalNews = news.length;
      const totalDocuments = documents.length;

      const totalViews = news.reduce(
        (sum, item: any) => sum + (item.views || 0),
        0
      );
      const totalLikes = news.reduce(
        (sum, item: any) => sum + (item.likes || 0),
        0
      );

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newMembersThisMonth = members.filter((member: any) => {
        const memberDate = new Date(member.created_at as string);
        return (
          memberDate.getMonth() === currentMonth &&
          memberDate.getFullYear() === currentYear
        );
      }).length;

      const upcomingEvents = events.filter(
        (event: any) =>
          new Date(event.start_time) > new Date() && !event.is_cancelled
      ).length;

      const publishedNews = news.filter(
        (item: any) => item.is_published
      ).length;

      setData({
        totalMembers,
        totalEvents,
        totalNews,
        totalDocuments,
        totalViews,
        totalLikes,
        newMembersThisMonth,
        upcomingEvents,
        publishedNews,
        growthData: growthResult,
        recentActivity: activityResult,
      });
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowthData = async () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = date.toLocaleDateString("vi-VN", {
        month: "short",
        year: "numeric",
      });

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [members, events, news, views] = await Promise.all([
        supabase
          .from("members")
          .select("id")
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString()),
        supabase
          .from("events")
          .select("id")
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString()),
        supabase
          .from("news")
          .select("id")
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString()),
        supabase
          .from("news")
          .select("views")
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString()),
      ]);

      months.push({
        month: monthName,
        members: members.data?.length || 0,
        events: events.data?.length || 0,
        news: news.data?.length || 0,
        views:
          views.data?.reduce(
            (sum: number, item: any) => sum + (item.views || 0),
            0
          ) || 0,
      });
    }

    return months;
  };

  const fetchRecentActivity = async () => {
    const [recentMembers, recentEvents, recentNews] = await Promise.all([
      supabase
        .from("members")
        .select("full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("events")
        .select("title, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("news")
        .select("title, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const activities = [
      ...(recentMembers.data || []).map((item: any) => ({
        type: "member",
        title: item.full_name,
        date: item.created_at,
        count: 1,
      })),
      ...(recentEvents.data || []).map((item: any) => ({
        type: "event",
        title: item.title,
        date: item.created_at,
        count: 1,
      })),
      ...(recentNews.data || []).map((item: any) => ({
        type: "news",
        title: item.title,
        date: item.created_at,
        count: 1,
      })),
    ];

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Thống Kê & Phân Tích
              </h1>
              <p className="text-gray-300">
                Theo dõi hiệu suất và tăng trưởng của câu lạc bộ
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="3months">3 tháng gần đây</option>
                <option value="6months">6 tháng gần đây</option>
                <option value="1year">1 năm gần đây</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Tổng thành viên</p>
                <p className="text-3xl font-bold text-white">
                  {formatNumber(data.totalMembers)}
                </p>
                <div className="flex items-center mt-2">
                  <FaUserPlus className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">
                    +{data.newMembersThisMonth} tháng này
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Sự kiện</p>
                <p className="text-3xl font-bold text-white">
                  {formatNumber(data.totalEvents)}
                </p>
                <div className="flex items-center mt-2">
                  <FaCalendarCheck className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-blue-400 text-sm">
                    {data.upcomingEvents} sắp tới
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Tin tức</p>
                <p className="text-3xl font-bold text-white">
                  {formatNumber(data.totalNews)}
                </p>
                <div className="flex items-center mt-2">
                  <FaEye className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-sm">
                    {formatNumber(data.totalViews)} lượt xem
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <FaNewspaper className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Tài liệu</p>
                <p className="text-3xl font-bold text-white">
                  {formatNumber(data.totalDocuments)}
                </p>
                <div className="flex items-center mt-2">
                  <FaHeart className="w-4 h-4 text-red-400 mr-1" />
                  <span className="text-red-400 text-sm">
                    {formatNumber(data.totalLikes)} lượt thích
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FaFileAlt className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GrowthChart data={data.growthData} />

          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Hoạt Động Gần Đây
            </h3>
            <div className="space-y-4">
              {data.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "member"
                        ? "bg-blue-500/20"
                        : activity.type === "event"
                        ? "bg-purple-500/20"
                        : "bg-green-500/20"
                    }`}
                  >
                    {activity.type === "member" && (
                      <FaUsers className="w-4 h-4 text-blue-400" />
                    )}
                    {activity.type === "event" && (
                      <FaCalendarAlt className="w-4 h-4 text-purple-400" />
                    )}
                    {activity.type === "news" && (
                      <FaNewspaper className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">
                      {activity.title}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {new Date(activity.date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Hiệu Suất Nội Dung
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Tỷ lệ xuất bản</span>
                <span className="text-white font-medium">
                  {data.totalNews > 0
                    ? Math.round((data.publishedNews / data.totalNews) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Lượt xem trung bình</span>
                <span className="text-white font-medium">
                  {data.totalNews > 0
                    ? Math.round(data.totalViews / data.totalNews)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Lượt thích trung bình</span>
                <span className="text-white font-medium">
                  {data.totalNews > 0
                    ? Math.round(data.totalLikes / data.totalNews)
                    : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Thành Viên
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Thành viên mới tháng này</span>
                <span className="text-white font-medium">
                  {data.newMembersThisMonth}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Tăng trưởng</span>
                <span className="text-green-400 font-medium">
                  {data.newMembersThisMonth > 0 ? "+" : ""}
                  {data.newMembersThisMonth}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sự Kiện</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Sự kiện sắp tới</span>
                <span className="text-white font-medium">
                  {data.upcomingEvents}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Tổng sự kiện</span>
                <span className="text-white font-medium">
                  {data.totalEvents}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
