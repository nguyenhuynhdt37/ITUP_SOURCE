# Giai đoạn 1: Build & Cài dependency
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Cài đặt thư viện đồ hoạ C++ cho canvas (tránh lỗi font/hình ảnh khi build)
RUN apt-get update && apt-get install -y \
    libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
# Xoá package-lock.json cũ (vốn được tạo trên Mac) để npm tải lại đúng các file binary (như lightningcss) cho Linux ARM64
RUN rm -f package-lock.json && npm install --legacy-peer-deps

COPY . .
# Cấm NodeJS ăn lố RAM khi build
ENV NODE_OPTIONS="--max-old-space-size=2048"
RUN npm run build

# Giai đoạn 2: Chạy Production (Siêu nhẹ với chế độ standalone)
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV production

# Cài thư viện chạy cho canvas ở chế độ runtime
RUN apt-get update && apt-get install -y \
    libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

# Chỉ copy những file thực sự cần thiết từ bản build standalone (Giảm 80% dung lượng)
COPY --from=builder /app/public ./public

# Tự động copy file build standalone (đã cấu hình output: 'standalone' trong next.config.js)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]