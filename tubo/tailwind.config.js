/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: [
    './index.html',
    './src/**/*.vue',
    './static/.vitepress/**/*.js',
    './static/.vitepress/**/*.vue',
    './static/.vitepress/**/*.ts'
  ],
  theme: {
    extend: {
      fontFamily: {
        logo: ['Jua', 'sans-serif']
      },
      colors: {
        'primary-400': 'var(--primary-400)',
        'primary-600': 'var(--primary-600)'
      }
    }
  },
  plugins: []
}
