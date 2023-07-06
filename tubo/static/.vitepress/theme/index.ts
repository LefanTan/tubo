// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import './tailwind.postcss'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
