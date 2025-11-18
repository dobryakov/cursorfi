import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4000,
    proxy: {
      '/api': {
        target: process.env.CURSORFI_BACKEND_URL || 'http://backend:4001',
        changeOrigin: true,
      },
      '/ws': {
        target: process.env.CURSORFI_BACKEND_URL || 'ws://backend:4001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});

