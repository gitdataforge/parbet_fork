/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        parbetGreen: '#8cc63f',
        parbetHover: '#458731',
        parbetDark: '#1a1a1a',
        parbetMuted: '#54626c',
        parbetBorder: '#e2e2e2',
        parbetBg: '#f8f9fa'
      },
      fontWeight: { black: '900', extrabold: '800' }
    },
  },
  plugins: [],
}