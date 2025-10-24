# Content Display CSS System

## Tổng quan

Hệ thống CSS này được thiết kế để ghi đè TailwindCSS cho tất cả nội dung HTML được nhúng vào ứng dụng, đảm bảo hiển thị nhất quán và đẹp mắt.

## Files

### 1. `content-display.css`

File CSS chính chứa tất cả các styles để ghi đè TailwindCSS cho nội dung HTML.

### 2. `ContentDisplay.tsx`

Component React wrapper để áp dụng CSS classes cho nội dung HTML.

## Cách sử dụng

### 1. Import CSS vào globals.css

```css
@import "tailwindcss";
@import "../styles/content-display.css";
```

### 2. Sử dụng ContentDisplay component

```tsx
import ContentDisplay from "@/components/shared/ContentDisplay";

// Sử dụng với variant mặc định
<ContentDisplay content={htmlContent} />

// Sử dụng với variant cụ thể
<ContentDisplay
  content={htmlContent}
  variant="prose"
  className="custom-class"
/>
```

### 3. Sử dụng trực tiếp CSS classes

```tsx
<div
  className="content-display"
  dangerouslySetInnerHTML={{ __html: content }}
/>
```

## Variants

### 1. `default` (content-display)

- Class: `.content-display`
- Sử dụng cho nội dung chung

### 2. `prose`

- Class: `.prose`
- Sử dụng cho nội dung văn bản dài

### 3. `rich`

- Class: `.rich-content`
- Sử dụng cho nội dung phong phú

### 4. `article`

- Class: `.article-content`
- Sử dụng cho bài viết

### 5. `event`

- Class: `.event-content`
- Sử dụng cho nội dung sự kiện

### 6. `news`

- Class: `.news-content`
- Sử dụng cho tin tức

## Features

### 1. Typography

- **Headings**: H1-H6 với kích thước và màu sắc phù hợp
- **Paragraphs**: Đoạn văn với line-height và margin tối ưu
- **Text formatting**: Bold, italic, underline

### 2. Lists

- **Ordered lists**: Danh sách có thứ tự với số
- **Unordered lists**: Danh sách không có thứ tự với bullet points
- **List items**: Các mục trong danh sách

### 3. Code

- **Code blocks**: Khối code với syntax highlighting
- **Inline code**: Code nội dòng với background
- **Syntax highlighting**: Màu sắc cho keywords, strings, numbers, etc.

### 4. Media

- **Images**: Hình ảnh responsive với border radius
- **Links**: Liên kết với màu sắc và hover effects

### 5. Layout

- **Text alignment**: Căn trái, phải, giữa, đều hai bên
- **Tables**: Bảng với border và background
- **Blockquotes**: Trích dẫn với border và background

### 6. Responsive

- **Mobile**: Font size và spacing tối ưu cho mobile
- **Tablet**: Layout phù hợp cho tablet
- **Desktop**: Hiển thị tối ưu cho desktop

### 7. Print

- **Print styles**: Tối ưu cho in ấn với màu đen trắng

## CSS Classes

### Base Classes

```css
.content-display
  .prose
  .rich-content
  .article-content
  .event-content
  .news-content;
```

### Element Classes

```css
/* Headings */
.content-display h1, .content-display h2, etc.

/* Paragraphs */
.content-display p

/* Lists */
.content-display ul, .content-display ol, .content-display li

/* Code */
.content-display pre, .content-display code

/* Media */
.content-display img, .content-display a

/* Tables */
.content-display table, .content-display th, .content-display td;
```

## Override TailwindCSS

### 1. Specificity

Sử dụng `!important` để ghi đè TailwindCSS:

```css
.content-display h1 {
  font-size: 2em !important;
  color: #ffffff !important;
}
```

### 2. Display Properties

Đảm bảo các elements hiển thị đúng:

```css
.content-display h1 {
  display: block !important;
}
```

### 3. Color Override

Ghi đè màu sắc của TailwindCSS:

```css
.content-display p {
  color: #ffffff !important;
}
```

## Best Practices

### 1. Sử dụng đúng variant

```tsx
// Cho bài viết
<ContentDisplay content={articleContent} variant="article" />

// Cho sự kiện
<ContentDisplay content={eventContent} variant="event" />

// Cho tin tức
<ContentDisplay content={newsContent} variant="news" />
```

### 2. Kết hợp với custom classes

```tsx
<ContentDisplay
  content={content}
  variant="prose"
  className="max-w-4xl mx-auto p-8"
/>
```

### 3. Responsive design

```tsx
<ContentDisplay content={content} className="text-sm md:text-base lg:text-lg" />
```

## Troubleshooting

### 1. TailwindCSS vẫn ghi đè

- Kiểm tra thứ tự import trong `globals.css`
- Đảm bảo sử dụng `!important`
- Kiểm tra specificity của CSS

### 2. Styles không áp dụng

- Kiểm tra class name có đúng không
- Kiểm tra HTML structure
- Kiểm tra CSS selector

### 3. Responsive issues

- Kiểm tra media queries
- Kiểm tra viewport meta tag
- Kiểm tra container width

## Examples

### 1. News Article

```tsx
<ContentDisplay
  content={newsArticle.content}
  variant="news"
  className="prose max-w-4xl mx-auto"
/>
```

### 2. Event Description

```tsx
<ContentDisplay
  content={event.description}
  variant="event"
  className="text-white"
/>
```

### 3. Rich Content

```tsx
<ContentDisplay
  content={richContent}
  variant="rich"
  className="bg-white/10 p-6 rounded-xl"
/>
```

## Maintenance

### 1. Thêm styles mới

- Thêm vào `content-display.css`
- Sử dụng `!important` để ghi đè TailwindCSS
- Test trên tất cả variants

### 2. Cập nhật colors

- Cập nhật color variables
- Đảm bảo contrast ratio
- Test trên dark/light themes

### 3. Responsive updates

- Cập nhật media queries
- Test trên các devices
- Đảm bảo readability
