import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'

import '@quasar/extras/eva-icons/eva-icons.css'
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'
import './assets/global.scss'

import App from './App.vue'
import router from './router'
import userNavGuard from './lib/navguard'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: {}
})

userNavGuard(router)

app.mount('#app')
