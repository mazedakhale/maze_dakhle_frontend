import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: false,
    watch: {
      usePolling: true,
    },
    allowedHosts: ['mazedakhale.in'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: false, // ✅ This disables the error overlay
    },
  },
});
