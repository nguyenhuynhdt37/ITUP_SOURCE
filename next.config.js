/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase body size limit for file uploads (100MB)
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // API route body size limit
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sufaegmzgctorjndvegd.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude canvas module for browser builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        os: false,
        // Add support for pdf-parse
        stream: false,
        crypto: false,
      };
    }

    // Add external modules for pdf-parse
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        "pdf-parse": "pdf-parse",
      });
    }

    return config;
  },
};

module.exports = nextConfig;
