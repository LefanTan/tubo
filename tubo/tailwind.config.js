/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ['./index.html', './src/**/*.vue'],
  theme: {
    extend: {
      fontFamily: {
        logo: ['Jua', 'sans-serif']
      },
      colors: {
        'primary-400': 'var(--primary-400)'
      }
    }
  },
  plugins: []
}
