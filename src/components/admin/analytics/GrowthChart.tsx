"use client";

import { FaArrowDown, FaArrowUp, FaChartLine } from "react-icons/fa";

interface GrowthData {
  month: string;
  members: number;
  events: number;
  news: number;
  views: number;
}

interface GrowthChartProps {
  data: GrowthData[];
}

export const GrowthChart = ({ data }: GrowthChartProps) => {
  const getMaxValue = () => {
    return Math.max(
      ...data.flatMap((item) => [
        item.members,
        item.events,
        item.news,
        item.views,
      ])
    );
  };

  const getPercentage = (value: number) => {
    const max = getMaxValue();
    return max > 0 ? (value / max) * 100 : 0;
  };

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">
          Biểu Đồ Tăng Trưởng
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <FaChartLine className="w-4 h-4" />
          <span>6 tháng gần đây</span>
        </div>
      </div>

      <div className="space-y-6">
        {data.map((item, index) => {
          const previous = index > 0 ? data[index - 1] : null;
          const membersGrowth = previous
            ? getGrowthRate(item.members, previous.members)
            : 0;
          const eventsGrowth = previous
            ? getGrowthRate(item.events, previous.events)
            : 0;
          const newsGrowth = previous
            ? getGrowthRate(item.news, previous.news)
            : 0;
          const viewsGrowth = previous
            ? getGrowthRate(item.views, previous.views)
            : 0;

          return (
            <div key={item.month} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">{item.month}</h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-300">Thành viên:</span>
                    <span className="text-white font-medium">
                      {item.members}
                    </span>
                    {membersGrowth !== 0 && (
                      <div
                        className={`flex items-center ${
                          membersGrowth > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {membersGrowth > 0 ? (
                          <FaArrowUp className="w-3 h-3" />
                        ) : (
                          <FaArrowDown className="w-3 h-3" />
                        )}
                        <span className="text-xs ml-1">
                          {Math.abs(membersGrowth).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-300">Thành viên</span>
                    </div>
                    <span className="text-sm text-white">{item.members}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(item.members)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-300">Sự kiện</span>
                    </div>
                    <span className="text-sm text-white">{item.events}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(item.events)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-300">Tin tức</span>
                    </div>
                    <span className="text-sm text-white">{item.news}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(item.news)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-300">Lượt xem</span>
                    </div>
                    <span className="text-sm text-white">
                      {item.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getPercentage(item.views)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">Thành viên</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-300">Sự kiện</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-300">Tin tức</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-300">Lượt xem</span>
          </div>
        </div>
      </div>
    </div>
  );
};
