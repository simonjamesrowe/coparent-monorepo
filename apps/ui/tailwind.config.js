/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm Harbor design system colors
        'calm': {
          50: '#f8f9fa',
          100: '#e8eef5',
          200: '#d0dce9',
          300: '#b8cadd',
          400: '#a0b8d1',
          500: '#88a6c5',
          600: '#7094b9',
          700: '#5882ad',
          800: '#4070a1',
          900: '#285e95',
        },
        'harbor': {
          50: '#f0f4f9',
          100: '#e1e9f2',
          200: '#c2d3e6',
          300: '#a3bdd9',
          400: '#84a7cd',
          500: '#6591c1',
          600: '#467bb5',
          700: '#3a65a0',
          800: '#2d4f8a',
          900: '#213975',
        },
      },
    },
  },
  plugins: [],
}
