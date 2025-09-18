/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#0D111C',
        'brand-surface': '#171B26',
        'brand-surface-2': '#212631',
        'brand-primary': '#4C82FB',
        'brand-primary-hover': '#6C9BFF',
        'brand-secondary': '#2C3140',
        'brand-text-primary': '#F0F0F0',
        'brand-text-secondary': '#A0A0A0',
        'brand-accent': '#FF4B4B',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}