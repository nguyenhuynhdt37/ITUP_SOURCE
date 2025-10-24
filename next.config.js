/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },

  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "sufaegmzgctorjndvegd.supabase.co" },
    ],
  },

  webpack: (config, { isServer }) => {
    // 🚫 Không dùng các module Node trên client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        canvas: false, // <- tránh lỗi pdfjs
        encoding: false,
        stream: false,
        crypto: false,
      };
    }

    // ⚙️ Đảm bảo không SSR pdfjs/tesseract (chỉ chạy client)
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        "pdfjs-dist": "pdfjs-dist",
        "tesseract.js": "tesseract.js",
      });
    }

    // ⚙️ Cho phép WebWorker trong client build
    config.output.globalObject = "self";

    return config;
  },
};

module.exports = nextConfig;
