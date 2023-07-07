// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import './styles.scss'
import '../../../src/assets/global.scss'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
