/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf9f4',
          100: '#f5f0e4',
          200: '#ebdcc5',
          300: '#dec29f',
          400: '#cfa276',
          500: '#c5a059', // Primary Divisha Gold / Bronze
          600: '#b08b46',
          700: '#8f6f36',
          800: '#735830',
          900: '#5e482b',
          950: '#342614'
        },
        slate: {
          850: '#141c2e',
          900: '#0f172a',
          950: '#080d1a'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(197, 160, 89, 0.3)',
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
      }
    }
  },
  plugins: []
};
