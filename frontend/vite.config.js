import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Check specifically for react, react-dom, react-router, react-router-dom
            if (
              id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/react-router/') || 
              id.includes('node_modules/react-router-dom/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/framer-motion/')) {
              return 'vendor-framer';
            }
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-lucide';
            }
            if (id.includes('node_modules/react-toastify/')) {
              return 'vendor-toast';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
  },
});
