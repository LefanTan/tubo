import './assets/global.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'

import '@quasar/extras/eva-icons/eva-icons.css'

// Import Quasar css

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: {}
})

app.mount('#app')
