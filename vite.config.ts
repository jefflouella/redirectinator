import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    middlewareMode: false,
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps for production
    minify: 'esbuild', // Ensure minification is enabled
    assetsDir: 'assets',
    publicDir: 'public',
    copyPublicDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['clsx', 'tailwind-merge'],
        },
      },
    },
  },
});
