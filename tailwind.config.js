/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1e293b',
          900: '#0f172a',
        },
        primary: '#3b82f6',
      },
      fontFamily: {
        'poppins': ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}