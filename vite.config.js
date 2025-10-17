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
    // Allow both root and www subdomain to access the dev server
    allowedHosts: ["mazedakhale.in", "www.mazedakhale.in", "mazhedakhale.in","www.mazhedakhale.in"],
    proxy: {
      "/api": {
        target: "https://mazedakhale.in/api",
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: false, // Disable error overlay in browser
    },
  },
});
