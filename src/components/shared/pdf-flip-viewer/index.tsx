"use client";

import { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function FlipBookViewer({ file }: { file: string }) {
  const [numPages, setNumPages] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;
      setSize({ width: w, height: h });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isClient]);

  if (!isClient)
    return (
      <div className="w-full h-[90vh] flex items-center justify-center text-white bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 rounded-xl">
        Đang khởi tạo trình xem PDF...
      </div>
    );

  const isMobile = size.width < 768;
  const pageWidth = isMobile
    ? Math.max(size.width - 10, 0)
    : size.width / 2 - 5;
  const pageHeight = size.height - 5;

  // ✅ nếu số trang là lẻ → thêm 1 trang trắng để đóng sách đẹp
  const totalPages = numPages % 2 === 0 ? numPages : numPages + 1;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[70vh] md:h-[50rem] p-5 flex justify-center items-center bg-gradient-to-br from-[#000033] via-[#001144] to-[#000033] overflow-hidden"
    >
      {size.width > 0 && (
        <Document
          file={file}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="text-white">Đang tải PDF...</div>}
        >
          <HTMLFlipBook
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            showCover={!isMobile} // ✅ Ẩn bìa riêng trên mobile để gọn hơn
            drawShadow={true}
            flippingTime={1200}
            maxShadowOpacity={0.6}
            mobileScrollSupport
            usePortrait={isMobile} // ✅ Mobile: 1 trang; Desktop: 2 trang song song
            minWidth={300}
            maxWidth={3000}
            minHeight={300}
            maxHeight={4000}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            className="book-viewer"
            style={{
              width: isMobile ? `${pageWidth}px` : `${pageWidth * 2}px`,
              height: `${pageHeight}px`,
            }}
            startPage={0}
          >
            {/* === CÁC TRANG PDF + trang trắng nếu cần === */}
            {Array.from({ length: totalPages }, (_, i) => {
              const isBlankPage = i + 1 > numPages;
              return (
                <div
                  key={i}
                  className={`page flex justify-center items-center relative overflow-hidden ${
                    isBlankPage
                      ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 italic"
                      : "bg-white"
                  } shadow-[0_8px_24px_rgba(0,0,0,0.3)]`}
                  style={{
                    width: `${pageWidth}px`,
                    height: `${pageHeight}px`,
                  }}
                >
                  {!isBlankPage ? (
                    <>
                      <Page
                        pageNumber={i + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={pageWidth}
                        height={pageHeight}
                      />
                      <span className="absolute bottom-3 right-6 text-xs text-gray-500">
                        Trang {i + 1}
                      </span>
                    </>
                  ) : (
                    <span>Trang trống</span>
                  )}
                </div>
              );
            })}
          </HTMLFlipBook>
        </Document>
      )}

      {/* ✨ hiệu ứng sáng gáy sách */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-20 bg-gradient-to-r from-black/25 via-white/10 to-transparent mix-blend-overlay" />
    </div>
  );
}
