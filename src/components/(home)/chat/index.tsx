"use client";

import { useClub } from "@/hooks/useClub";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  FaCopy,
  FaDownload,
  FaPaperPlane,
  FaRobot,
  FaSpinner,
  FaTimes,
  FaUser,
} from "react-icons/fa";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  sources?: Source[];
}

interface Source {
  id: string;
  title: string;
  description: string;
  file_type: string;
  file_size: number;
  category: string;
  created_at: string;
  download_url: string;
}

export const ChatComponent = () => {
  const { club } = useClub();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "🎉 Xin chào! Tôi là ITUP - trợ lý ảo nhiệt tình của Câu lạc bộ IT UP! 💻✨\n\nTôi rất vui được giúp bạn khám phá về:\n📚 Tài liệu và quy chế câu lạc bộ\n🎯 Các sự kiện và hoạt động sắp tới\n👥 Thông tin thành viên và ban chủ nhiệm\n💡 Hướng dẫn tham gia câu lạc bộ\n\nBạn muốn tìm hiểu gì về ITUP nhỉ? 😊",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (isMounted) {
      const savedMessages = localStorage.getItem("itup-chat-history");
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            setMessages(parsedMessages);
          }
        } catch (e) {
          console.error("Error loading chat history:", e);
        }
      }
    }
  }, [isMounted]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (isMounted && messages.length > 1) {
      // Don't save if only initial message
      const limitedMessages = limitChatHistory(messages);
      localStorage.setItem(
        "itup-chat-history",
        JSON.stringify(limitedMessages)
      );
    }
  }, [messages, isMounted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Clear chat history and start new conversation
  const clearChatHistory = () => {
    const initialMessage: Message = {
      id: "1",
      type: "bot",
      content:
        "🎉 Xin chào! Tôi là ITUP - trợ lý ảo nhiệt tình của Câu lạc bộ IT UP! 💻✨\n\nTôi rất vui được giúp bạn khám phá về:\n📚 Tài liệu và quy chế câu lạc bộ\n🎯 Các sự kiện và hoạt động sắp tới\n👥 Thông tin thành viên và ban chủ nhiệm\n💡 Hướng dẫn tham gia câu lạc bộ\n\nBạn muốn tìm hiểu gì về ITUP nhỉ? 😊",
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    localStorage.removeItem("itup-chat-history");
  };

  // Limit chat history to last 10 messages
  const limitChatHistory = (messages: Message[]) => {
    if (messages.length > 10) {
      return messages.slice(-10);
    }
    return messages;
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: input.trim(),
          chatHistory: messages.slice(-5), // Gửi 5 tin nhắn gần nhất
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.answer || "Xin lỗi, tôi không thể trả lời câu hỏi này.",
        timestamp: new Date(),
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      {/* Chat Toggle Button - ITUP Logo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#1a1a4d] to-[#2d2d6d] hover:from-[#000033] hover:to-[#1a1a4d] text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group border border-white/20 ${
          isMounted && isOpen ? "hidden sm:block" : "block"
        }`}
      >
        {isOpen ? (
          <FaTimes className="w-6 h-6" />
        ) : (
          <div className="relative w-10 h-10">
            {club?.logo_url ? (
              <Image
                src={club.logo_url}
                alt="ITUP Logo"
                width={40}
                height={40}
                className="object-contain group-hover:animate-bounce"
              />
            ) : (
              <FaRobot className="w-6 h-6 group-hover:animate-bounce" />
            )}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>

      {/* Chat Window - ITUP Style */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] sm:max-w-[calc(100vw-3rem)] sm:max-h-[calc(100vh-8rem)] z-40 bg-gradient-to-br from-[#1a1a4d]/95 to-[#2d2d6d]/95 backdrop-blur-lg sm:rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
          {/* Close Button - Top Right */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-20 right-4 z-50 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/20 sm:top-4 sm:p-1 sm:text-white/60 sm:hover:bg-white/10"
          >
            <FaTimes className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>

          {/* Header - ITUP Branding */}
          <div className="bg-gradient-to-r from-[#1a1a4d] to-[#2d2d6d] text-white p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                {club?.logo_url ? (
                  <Image
                    src={club.logo_url}
                    alt="ITUP Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                ) : (
                  <FaRobot className="w-6 h-6 text-white" />
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">ITUP Assistant</h3>
                <p className="text-xs text-white/80">
                  Trợ lý ảo Câu lạc bộ IT UP
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-xs text-green-300">Đang hoạt động</span>
                </div>
              </div>
            </div>
            <button
              onClick={clearChatHistory}
              className="text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 text-xs"
              title="Bắt đầu chat mới"
            >
              <span className="hidden sm:inline">Bắt đầu mới</span>
              <span className="sm:hidden">🔄</span>
            </button>
          </div>

          {/* Messages - ITUP Style */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-[#1a1a4d]/5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white border border-white/20"
                      : "bg-white/10 text-white border border-white/20 backdrop-blur-sm"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === "bot" && (
                      <div className="w-6 h-6 mt-1 flex-shrink-0">
                        {club?.logo_url ? (
                          <Image
                            src={club.logo_url}
                            alt="ITUP Logo"
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        ) : (
                          <FaRobot className="w-4 h-4" />
                        )}
                      </div>
                    )}
                    {message.type === "user" && (
                      <FaUser className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm leading-relaxed whitespace-pre-wrap text-justify">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convert bold markdown to HTML
                              .replace(/\*(.*?)\*/g, "<em>$1</em>") // Convert italic markdown to HTML
                              .replace(/`(.*?)`/g, "<code>$1</code>") // Convert code markdown to HTML
                              .replace(/#{1,6}\s/g, "") // Remove headers
                              .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
                              .replace(/\n{3,}/g, "\n\n"), // Limit multiple newlines
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.type === "bot" && (
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="text-xs opacity-70 hover:opacity-100 transition-opacity ml-2"
                          >
                            <FaCopy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sources - Simple Style */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="text-xs text-white/70 mb-2">
                        📚 Nguồn: {message.sources.length} tài liệu
                      </div>
                      {message.sources.map((source, index) => (
                        <div
                          key={source.id}
                          className="bg-white/5 rounded-lg p-2 mb-2 text-xs border border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-white text-xs">
                                {source.title}
                              </div>
                              <div className="text-white/60 text-xs mt-1">
                                {source.file_type} •{" "}
                                {formatFileSize(source.file_size)}
                              </div>
                            </div>
                            <a
                              href={source.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors ml-2"
                            >
                              <FaDownload className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator - ITUP Logo */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white rounded-2xl px-4 py-3 max-w-[80%] border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-8 h-8">
                      {club?.logo_url ? (
                        <Image
                          src={club.logo_url}
                          alt="ITUP Logo"
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      ) : (
                        <FaRobot className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaSpinner className="w-3 h-3 animate-spin text-[#3b82f6]" />
                      <span className="text-sm text-white/80">
                        ITUP đang suy nghĩ...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input - ITUP Style */}
          <div className="p-4 border-t border-white/10 bg-gradient-to-r from-[#1a1a4d]/10 to-[#2d2d6d]/10">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="💬 Hỏi ITUP về câu lạc bộ..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent backdrop-blur-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] hover:from-[#2563eb] hover:to-[#3b82f6] disabled:from-gray-500 disabled:to-gray-600 text-white p-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaPaperPlane className="w-4 h-4" />
                )}
              </button>
            </form>
            <div className="text-xs text-white/60 mt-2 text-center">
              💡 Gợi ý: "ITUP được thành lập khi nào?" hoặc "Có sự kiện nào sắp
              tới không?"
            </div>
          </div>
        </div>
      )}
    </>
  );
};
