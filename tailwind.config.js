/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1B2A4A',
        gold: '#C9A84C',
        amber: '#E07B2A',
        red: '#C0392B',
        'light-gold': '#FFF8E7',
        'light-navy': '#EEF1F6',
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
