import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allows access from external networks (e.g., AWS Lightsail)
    port: 5173,       // Ensures Vite runs on port 5173
    strictPort: true, // Prevents Vite from changing the port if 5173 is busy
    open: true,       // Opens the browser automatically when Vite starts
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Proxy API requests to your NestJS backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
