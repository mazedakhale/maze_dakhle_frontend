import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
    allowedHosts: ["mazhedakhle.in", "www.mazhedakhle.in"],
    proxy: {
      "/api": {
        target: "https://mazhedakhle.in/api",
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: false, // Disable error overlay
      clientPort: 80 // <-- Add this line to use port 80 for HMR websocket client
    },
  },
});
