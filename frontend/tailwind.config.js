// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#28a745",   // Màu cho các phần tử chính
        secondary: "#fd7e14", // Màu cho các phần tử phụ
        background: "#f8f9fa", // Màu nền xám nhạt
        textPrimary: "#343a40", // Màu chữ chính (đen đậm)
        textSecondary: "#6c757d", // Màu chữ phụ (xám nhạt)
        buttonHover: "#218838", // Màu hover cho nút chính (xanh lá cây đậm)
        buttonActive: "#d39e00", // Màu hover cho nút phụ (cam đậm)
      },
    },
  },
  plugins: [],
};
