/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          input: '#334155',
        },
        accent: {
          primary: '#3b82f6',
          hover: '#2563eb',
        },
        status: {
          real: '#10b981',
          fake: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}