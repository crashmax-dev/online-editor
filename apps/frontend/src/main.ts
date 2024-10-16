import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app.vue'
import 'xp.css/dist/XP.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
