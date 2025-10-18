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
    allowedHosts: ["mazedakhale.in", "www.mazedakhale.in"],
    proxy: {
      "/api": {
        target: "http://mazedakhale.in/api", // point to your domain's API path
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: false,          // disable error overlay in browser
      clientPort: 80,          // use port 80 for HMR websocket client
    },
  },
});
