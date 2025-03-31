import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // Allows external access (0.0.0.0 automatically handled)
    port: 5173,        // Ensures Vite runs on port 5173
    strictPort: true,  // Prevents Vite from changing the port if 5173 is busy
    open: false,       // Disable auto-opening (prevents `xdg-open ENOENT` error)
    watch: {
      usePolling: true, // Required for AWS Lightsail to detect file changes
    },
    proxy: {
      '/api': {
        target: 'http://3.6.61.72:3000', // Proxy API requests to NestJS backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

