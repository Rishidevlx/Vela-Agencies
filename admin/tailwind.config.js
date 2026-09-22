/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#C70E17',
        footer: '#2F415D',
        primary: '#FBF3F3',
      },
      fontFamily: {
        body: ['Roboto', 'sans-serif'],
        heading: ['Montenegrin Gothic One', 'sans-serif'], // Fallback if not available
      }
    },
  },
  plugins: [],
}
