import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// FEATURE 1: Aggressive Cache-Busting Timestamp Engine
// Captures the exact millisecond the build command is executed
const timestamp = new Date().getTime();

export default defineConfig({
  plugins: [react()],
  build: {
    // FEATURE 2: Strict Rollup Output Overrides
    // Appends the unique timestamp to every compiled asset, permanently destroying browser cache retention
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${timestamp}.js`,
        chunkFileNames: `assets/[name]-[hash]-${timestamp}.js`,
        assetFileNames: `assets/[name]-[hash]-${timestamp}.[ext]`
      }
    }
  }
})