import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// FEATURE 1: Aggressive Cache-Busting Timestamp Engine
// Captures the exact millisecond the build command is executed
const timestamp = new Date().getTime();

// https://vite.dev/config/
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
  },
  server: {
    hmr: {
      clientPort: 443, // Strictly required to fix WebSocket connection drops in GitHub Codespaces
    },
    proxy: {
      // Secure local proxies to strictly bypass browser CORS blocks
      '/api/bandsintown': {
        target: 'https://rest.bandsintown.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bandsintown/, '')
      },
      '/api/seatgeek': {
        target: 'https://api.seatgeek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/seatgeek/, '')
      },
      '/api/cricapi': {
        target: 'https://api.cricapi.com', // Strictly fixed domain to resolve 502 Bad Gateway
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cricapi/, '')
      }
    }
  }
})