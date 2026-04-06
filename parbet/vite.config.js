import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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