"use client";
import { cn } from "@/lib/utils";
import "@/styles/content-display.css";
import { useEffect, useRef } from "react";

export default function ContentDisplay({
  content,
  className,
  variant = "default",
}: {
  content: string;
  className?: string;
  variant?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedOnce = useRef(false);

  useEffect(() => {
    if (renderedOnce.current) return; // ❗ ngăn render lại
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = content;

    // Lazy load ảnh 1 lần
    const imgs = container.querySelectorAll("img");
    imgs.forEach((img) => {
      img.loading = "lazy";
      img.decoding = "async";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
    });

    renderedOnce.current = true;
  }, [content]);

  return (
    <div ref={containerRef} className={cn("content-display", className)} />
  );
}
