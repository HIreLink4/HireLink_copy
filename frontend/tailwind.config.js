/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b9dfff',
          300: '#7cc4ff',
          400: '#36a5ff',
          500: '#0c87f0',
          600: '#006acc',
          700: '#0055a5',
          800: '#004988',
          900: '#003d70',
        },
        accent: {
          50: '#fdf4f3',
          100: '#fce8e6',
          200: '#fad5d1',
          300: '#f5b5ae',
          400: '#ed8b80',
          500: '#e16054',
          600: '#cd4538',
          700: '#ac372c',
          800: '#8f3129',
          900: '#772f28',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
