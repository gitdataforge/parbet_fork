/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Institutional Brand Palette
        parbetGreen: '#8cc63f',      // Primary Brand Green
        parbetHover: '#458731',      // Deep Green Interaction State
        parbetDark: '#1a1a1a',       // Primary Obsidian Text
        parbetMuted: '#54626c',      // Secondary Slate Text
        parbetBorder: '#e2e2e2',     // Enterprise Border Gray
        parbetSurface: '#f8f9fa'     // Subtle Background Surface
      },
      fontWeight: {
        black: '900',
        extrabold: '800',
        bold: '700',
        medium: '500',
      },
      animation: {
        // Hardware-accelerated 60fps animations
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      boxShadow: {
        'enterprise': '0 12px 40px rgba(0,0,0,0.04)',
        'elevated': '0 20px 50px rgba(0,0,0,0.06)'
      }
    },
  },
  plugins: [
    // Strictly required plugin to enable invisible scrollbars for modern browsers
    function ({ addUtilities }) {
      addUtilities({
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
}