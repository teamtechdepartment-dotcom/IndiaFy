import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Enable source maps for debugging (fixes 'missing source maps' in Best Practices)
    sourcemap: true,
    // Use esbuild for minification (built-in, no extra dependency)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React bundle
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            // Animation library (heavy, ~120KB)
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            // Icons library (~80KB)
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            // Toast notifications
            if (id.includes('react-toastify')) {
              return 'vendor-toast';
            }
            // Zustand state management
            if (id.includes('zustand')) {
              return 'vendor-zustand';
            }
            // Axios HTTP client
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            // Everything else
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    // CSS code splitting
    cssCodeSplit: true,
    // Asset inlining threshold (4kb)
    assetsInlineLimit: 4096,
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios'],
  },
});
