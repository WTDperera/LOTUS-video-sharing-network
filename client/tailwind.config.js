/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Netflix/YouTube inspired dark theme
        primary: {
          DEFAULT: '#E50914', // Netflix red
          dark: '#B20710',
        },
        dark: {
          100: '#303030',
          200: '#282828',
          300: '#181818',
          400: '#141414',
          500: '#0F0F0F',
        }
      },
    },
  },
  plugins: [],
}
