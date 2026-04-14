import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * FEATURE: Enterprise-Grade React/Vite Compiler Config
 * This configuration ensures that JSX is properly transpiled and 
 * minified for production deployment on Vercel Edge.
 */
export default defineConfig({
  plugins: [
    // Enables Fast Refresh and JSX support
    react()
  ],
  resolve: {
    alias: {
      // Allows for clean imports using '@/' instead of relative paths
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // Standard Vercel output directory
    outDir: 'dist',
    // Generates source maps for debugging (optional, can be disabled for privacy)
    sourcemap: true,
    // Ensures the build is optimized for modern browsers
    target: 'esnext',
    // Cleans the output directory before each build
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // FEATURE: Dynamic Chunking Engine (Permanent Fix for Vite 8 / Rolldown)
        // Replaces the static object with a dynamic function to safely process vendor libraries
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Chunk React Core separately for optimal caching
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-core';
            }
            // Chunk Firebase SDK to prevent blocking main UI thread
            if (id.includes('firebase')) {
              return 'firebase-sdk';
            }
            // Chunk Framer Motion, Lucide Icons, and Zustand state manager
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('zustand')) {
              return 'ui-vendor';
            }
            // Group any remaining dependencies into a fallback vendor chunk
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    // Port 5175 for local development
    port: 5175,
    // Prevents issues when running inside nested environments
    host: true,
    strictPort: true,
  }
});