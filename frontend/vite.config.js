import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor";
            }
            if (id.includes("framer-motion")) return "framer";
            if (id.includes("lucide-react")) return "lucide";
            if (id.includes("zustand")) return "state";
            if (id.includes("axios")) return "network";
            return "common";
          }
        },
      },
    },
  },
});