<div align="center">

# 🎓 ITUP - Information Technology University Platform

![ITUP Logo](public/logo/logo-large.svg)

**Nền tảng quản lý thông tin và cộng đồng sinh viên Công nghệ Thông tin**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.76.1-green?style=for-the-badge&logo=supabase)](https://supabase.com/)

</div>

---

## 📋 Mục lục

- [🎯 Giới thiệu](#-giới-thiệu)
- [✨ Tính năng](#-tính-năng)
- [🛠️ Công nghệ sử dụng](#️-công-nghệ-sử-dụng)
- [📦 Cài đặt](#-cài-đặt)
- [⚙️ Cấu hình](#️-cấu-hình)
- [🚀 Chạy dự án](#-chạy-dự-án)
- [📁 Cấu trúc dự án](#-cấu-trúc-dự-án)
- [🔧 Scripts](#-scripts)
- [📱 Giao diện](#-giao-diện)
- [🤝 Đóng góp](#-đóng-góp)
- [📄 License](#-license)

---

## 🎯 Giới thiệu

**ITUP** là một nền tảng quản lý thông tin toàn diện dành cho cộng đồng sinh viên Công nghệ Thông tin. Dự án cung cấp các tính năng quản lý thành viên, sự kiện, tin tức, tài liệu và hệ thống chat thông minh với AI.

### 🌟 Điểm nổi bật

- 🎨 **Giao diện hiện đại**: Thiết kế responsive với Tailwind CSS
- 🤖 **AI Chat**: Tích hợp Gemini AI cho hỗ trợ thông minh
- 📄 **Quản lý tài liệu**: Upload và xem PDF với flip viewer
- 👥 **Quản lý thành viên**: Hệ thống quản lý thành viên hoàn chỉnh
- 📅 **Sự kiện**: Tạo và quản lý sự kiện
- 📰 **Tin tức**: Hệ thống tin tức với rich text editor
- 🔐 **Bảo mật**: Xác thực với Supabase Auth

---

## ✨ Tính năng

### 🏠 Trang chủ

- Hiển thị thông tin tổng quan
- Navigation thân thiện
- Responsive design

### 👥 Quản lý thành viên

- ✅ Danh sách thành viên
- ➕ Thêm thành viên mới
- ✏️ Chỉnh sửa thông tin
- 👤 Xem chi tiết thành viên

### 📅 Quản lý sự kiện

- ✅ Danh sách sự kiện
- ➕ Tạo sự kiện mới
- ✏️ Chỉnh sửa sự kiện
- 📋 Xem chi tiết sự kiện

### 📰 Quản lý tin tức

- ✅ Danh sách tin tức
- ➕ Tạo tin tức mới
- ✏️ Chỉnh sửa tin tức
- 📖 Xem chi tiết tin tức

### 📄 Quản lý tài liệu

- ✅ Danh sách tài liệu
- ➕ Upload tài liệu
- ✏️ Chỉnh sửa tài liệu
- 📖 Xem tài liệu PDF

### 🤖 Chat AI

- 💬 Tích hợp Gemini AI
- 🧠 Hỗ trợ thông minh
- 📝 Xử lý ngôn ngữ tự nhiên

### 🔐 Hệ thống Admin

- 🛡️ Bảo mật cao
- 📊 Dashboard quản lý
- ⚙️ Cấu hình hệ thống

---

## 🛠️ Công nghệ sử dụng

### Frontend

- **Next.js 15.5.4** - React framework
- **React 19.1.0** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4.0** - Styling
- **React Icons** - Icon library

### Backend & Database

- **Supabase** - Backend as a Service
- **Supabase Auth** - Authentication
- **Supabase Storage** - File storage

### AI & Processing

- **Gemini AI** - AI chat integration
- **PDF Processing** - Document handling
- **Canvas** - Image processing

### Development Tools

- **Turbopack** - Fast bundling
- **SWR** - Data fetching
- **Zustand** - State management

---

## 📦 Cài đặt

### Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 hoặc **yarn**: >= 1.22.0
- **Git**: >= 2.0.0

### Bước 1: Clone repository

```bash
git clone https://github.com/your-username/ITUP_SOURCE.git
cd ITUP_SOURCE
```

### Bước 2: Cài đặt dependencies

```bash
# Sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install

# Hoặc sử dụng pnpm
pnpm install
```

### Bước 3: Cài đặt dependencies bổ sung (nếu cần)

```bash
# Cài đặt canvas cho image processing
npm install canvas

# Cài đặt sharp cho image optimization
npm install sharp
```

---

## ⚙️ Cấu hình

### 1. Tạo file `.env.local`

Tạo file `.env.local` trong thư mục gốc của dự án:

```bash
touch .env.local
```

### 2. Cấu hình Supabase

Thêm các biến môi trường sau vào file `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Cấu hình Supabase Database

Tạo các bảng cần thiết trong Supabase:

```sql
-- Bảng thành viên
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  student_id VARCHAR(50),
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng sự kiện
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng tin tức
CREATE TABLE news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng tài liệu
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Cấu hình Storage Buckets

Trong Supabase Dashboard, tạo các storage buckets:

- `avatars` - Lưu trữ ảnh đại diện
- `events` - Lưu trữ ảnh sự kiện
- `news` - Lưu trữ ảnh tin tức
- `documents` - Lưu trữ tài liệu PDF

---

## 🚀 Chạy dự án

### Development Mode

```bash
# Chạy development server
npm run dev

# Hoặc với yarn
yarn dev

# Hoặc với pnpm
pnpm dev
```

Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### Production Build

```bash
# Build cho production
npm run build

# Chạy production server
npm run start
```

### Với Docker (Tùy chọn)

```bash
# Build Docker image
docker build -t itup-app .

# Chạy container
docker run -p 3000:3000 itup-app
```

---

## 📁 Cấu trúc dự án

```
ITUP_SOURCE/
├── 📁 public/
│   └── 📁 logo/                 # Logo và assets
├── 📁 src/
│   ├── 📁 app/                  # Next.js App Router
│   │   ├── 📁 (main)/          # Main layout
│   │   │   ├── 📁 (home)/      # Home pages
│   │   │   └── 📁 admin/        # Admin pages
│   │   ├── 📁 api/             # API routes
│   │   └── 📁 chat/            # Chat pages
│   ├── 📁 components/          # React components
│   │   ├── 📁 (home)/          # Home components
│   │   ├── 📁 admin/            # Admin components
│   │   └── 📁 shared/          # Shared components
│   ├── 📁 hooks/               # Custom hooks
│   ├── 📁 lib/                 # Utilities và helpers
│   ├── 📁 providers/           # Context providers
│   └── 📁 styles/              # Global styles
├── 📄 package.json
├── 📄 next.config.js
├── 📄 tailwind.config.js
└── 📄 tsconfig.json
```

### Chi tiết các thư mục

#### 🏠 App Router (`src/app/`)

- **`(main)/(home)/`**: Trang chủ, about, members, events, news, documents
- **`(main)/admin/`**: Trang quản trị
- **`api/`**: API endpoints
- **`chat/`**: Trang chat AI

#### 🧩 Components (`src/components/`)

- **`(home)/`**: Components cho trang chủ
- **`admin/`**: Components cho admin
- **`shared/`**: Components dùng chung

#### 🔧 Utilities (`src/lib/`)

- **`supabaseClient.ts`**: Supabase client
- **`uploadFile.ts`**: File upload utilities
- **`promptGemini.ts`**: AI integration
- **`extratTextPDF.ts`**: PDF processing

---

## 🔧 Scripts

| Script               | Mô tả                                 |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Chạy development server với Turbopack |
| `npm run build`      | Build ứng dụng cho production         |
| `npm run start`      | Chạy production server                |
| `npm run lint`       | Kiểm tra code quality                 |
| `npm run type-check` | Kiểm tra TypeScript types             |

---

## 📱 Giao diện

### 🏠 Trang chủ

- Hero section với logo ITUP
- Navigation menu responsive
- Quick access buttons
- Footer với thông tin liên hệ

### 👥 Quản lý thành viên

- Grid layout hiển thị thành viên
- Search và filter
- Modal thêm/chỉnh sửa
- Avatar upload

### 📅 Quản lý sự kiện

- Timeline view
- Calendar integration
- Event details modal
- Image gallery

### 📰 Quản lý tin tức

- Card layout
- Rich text editor
- Image upload
- SEO optimization

### 📄 Quản lý tài liệu

- PDF viewer với flip animation
- File upload với drag & drop
- Document preview
- Download functionality

### 🤖 Chat AI

- Modern chat interface
- Message history
- Typing indicators
- AI response formatting

---

## 🎨 Customization

### Thay đổi logo

Thay thế các file trong `public/logo/`:

- `logo.svg` - Logo chính
- `logo-large.svg` - Logo lớn
- `logo-small.svg` - Logo nhỏ
- `logo-responsive.svg` - Logo responsive

### Thay đổi màu sắc

Chỉnh sửa `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
      },
    },
  },
};
```

### Thay đổi fonts

Cập nhật `src/app/fonts.ts`:

```typescript
import { Inter, Poppins } from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository**
2. **Set environment variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   GEMINI_API_KEY
   ```
3. **Deploy automatically**

### Netlify

1. **Build command**: `npm run build`
2. **Publish directory**: `.next`
3. **Environment variables**: Same as Vercel

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Đóng góp

### Cách đóng góp

1. **Fork repository**
2. **Tạo feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Tạo Pull Request**

### Code Style

- Sử dụng **TypeScript** cho type safety
- Tuân thủ **ESLint** và **Prettier** rules
- Viết **JSDoc** cho functions
- Sử dụng **conventional commits**

### Testing

```bash
# Chạy tests
npm run test

# Chạy tests với coverage
npm run test:coverage

# Chạy E2E tests
npm run test:e2e
```

---

## 📄 License

Dự án này được phân phối dưới [MIT License](LICENSE).

---

## 📞 Liên hệ

- **Email**: contact@itup.edu.vn
- **Website**: https://itup.edu.vn
- **GitHub**: https://github.com/itup-org
- **Discord**: https://discord.gg/itup

---

<div align="center">

**Được phát triển với ❤️ bởi ITUP Team**

![ITUP Logo](public/logo/logo-simple.svg)

</div>
