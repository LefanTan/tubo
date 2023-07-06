// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import '../../../src/assets/global.scss'
import './styles.scss'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
