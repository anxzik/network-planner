/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        soho: '#4F46E5',
        enterprise: '#DC2626',
        sdn: '#059669',
        cloud: '#0284C7',
      },
    },
  },
  plugins: [],
}
