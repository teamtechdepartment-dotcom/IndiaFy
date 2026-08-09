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

            // Heavy libraries — split so they only load on the pages that need them
            if (id.includes("three")) return "chunk-three";
            if (id.includes("gsap")) return "chunk-gsap";
            if (id.includes("ogl") || id.includes("cobe") || id.includes("simplex-noise")) return "chunk-canvas";
            if (id.includes("@tsparticles") || id.includes("tsparticles")) return "chunk-particles";
            if (id.includes("recharts") || id.includes("victory-") || id.includes("d3-")) return "chunk-charts";
            if (id.includes("leaflet") || id.includes("react-leaflet")) return "chunk-leaflet";
            if (id.includes("jspdf")) return "chunk-jspdf";
            if (id.includes("react-syntax-highlighter") || id.includes("highlight.js") || id.includes("prismjs")) return "chunk-syntax";
            if (id.includes("@react-three")) return "chunk-r3f";

            return "common";
          }
        },
      },
    },
  },
});