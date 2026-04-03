/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0E1015',
          panel: '#16181D',
          card: '#1E2026',
          primary: '#1D7AF2',
          accent: '#7000FF',
          text: '#FFFFFF',
          muted: '#8E8E93',
          green: '#22C55E',
          neon: '#D9F950',
          red: '#FF3B30'
        }
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
      animation: { 'fade-in': 'fadeIn 0.5s ease-out' },
      keyframes: { fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } } }
    },
  },
  plugins: [],
}