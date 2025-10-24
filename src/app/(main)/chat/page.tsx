"use client";

import { useClub } from "@/hooks/useClub";
import Image from "next/image";

export default function ChatPage() {
  const { club } = useClub();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d] py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            {club?.logo_url && (
              <div className="relative w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/20 mr-4">
                <Image
                  src={club.logo_url}
                  alt="ITUP Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">
                💬 Chat với ITUP Assistant
              </h1>
              <p className="text-lg text-white/80">
                Trợ lý ảo thông minh của Câu lạc bộ IT UP
              </p>
            </div>
          </div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Trò chuyện với trợ lý ảo của Câu lạc bộ IT UP. Tôi có thể giúp bạn
            tìm hiểu về các sự kiện, tài liệu và thông tin của câu lạc bộ.
          </p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="relative w-24 h-24 bg-gradient-to-r from-[#1a1a4d] to-[#2d2d6d] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-lg">
              {club?.logo_url ? (
                <Image
                  src={club.logo_url}
                  alt="ITUP Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <span className="text-3xl">🤖</span>
              )}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              ITUP Assistant
            </h2>
            <p className="text-white/80 text-lg">
              Trợ lý ảo thông minh của Câu lạc bộ IT UP
            </p>
            <div className="flex items-center justify-center mt-3">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-300 text-sm font-semibold">Đang hoạt động</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 text-center border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-white font-bold mb-3 text-lg">Tài liệu</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Tìm kiếm và tham khảo các tài liệu của câu lạc bộ
              </p>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 text-center border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-white font-bold mb-3 text-lg">Sự kiện</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Thông tin về các hoạt động và sự kiện sắp tới
              </p>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-6 text-center border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-white font-bold mb-3 text-lg">Hỗ trợ</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Trả lời các câu hỏi về câu lạc bộ và hoạt động
              </p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-blue-200 font-semibold text-lg mb-3">
              💡 Gợi ý câu hỏi:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-100 text-sm">
              <div className="flex items-center">
                <span className="mr-2">•</span>
                "Câu lạc bộ IT UP được thành lập khi nào?"
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                "Có sự kiện nào sắp diễn ra không?"
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                "Tài liệu về quy chế hoạt động ở đâu?"
              </div>
              <div className="flex items-center">
                <span className="mr-2">•</span>
                "Làm thế nào để tham gia câu lạc bộ?"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
