import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    global: 'window', // Polyfill global thành window để khắc phục lỗi sockjs-client
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://websitebandogiadung-dqzs.onrender.com/',
        changeOrigin: true,
        ws: true, // Kích hoạt proxy WebSocket
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Tùy chọn để tối ưu hóa build nếu cần
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'axios', 'sockjs-client', '@stomp/stompjs'],
        },
      },
    },
  },
});