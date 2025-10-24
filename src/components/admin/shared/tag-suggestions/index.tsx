"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { FaTag, FaTimes } from "react-icons/fa";

interface TagSuggestionsProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export const TagSuggestions = ({ value, onChange }: TagSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Fetch existing tags from database
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("news")
          .select("tags")
          .not("tags", "is", null);

        if (error) {
          console.log("Error fetching tags:", error);
          return;
        }

        // Extract all unique tags with proper typing
        const rows = (data as Array<{ tags: string[] | null }>) || [];
        const allTags = rows
          .flatMap((item) => item.tags ?? [])
          .filter((tag, index, self) => self.indexOf(tag) === index)
          .sort();

        setSuggestions(allTags);
      } catch (error) {
        console.log("Error fetching tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !value.includes(tag.trim())) {
      onChange([...value, tag.trim()]);
    }
    setInputValue("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tag)
  );

  return (
    <div className="space-y-4">
      {/* Current tags */}
      {value.length > 0 && (
        <div>
          <label className="block text-white/80 text-sm font-semibold mb-2">
            Tags đã chọn
          </label>
          <div className="flex flex-wrap gap-2">
            {value.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30"
              >
                <FaTag className="w-3 h-3 mr-2" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-300 hover:text-blue-200 transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tag input */}
      <div>
        <label className="block text-white/80 text-sm font-semibold mb-2">
          Thêm tag mới
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleInputKeyPress}
          placeholder="Nhập tag và nhấn Enter..."
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-300"
        />
      </div>

      {/* Suggestions */}
      {inputValue && filteredSuggestions.length > 0 && (
        <div>
          <label className="block text-white/80 text-sm font-semibold mb-2">
            Gợi ý từ bài viết cũ
          </label>
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.slice(0, 10).map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="px-3 py-1 bg-white/10 border border-white/20 text-white text-sm rounded-full hover:bg-white/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular tags */}
      {!inputValue && suggestions.length > 0 && (
        <div>
          <label className="block text-white/80 text-sm font-semibold mb-2">
            Tags phổ biến
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 8).map((tag, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAddTag(tag)}
                className="px-3 py-1 bg-white/10 border border-white/20 text-white text-sm rounded-full hover:bg-white/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
