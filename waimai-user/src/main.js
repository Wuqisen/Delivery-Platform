import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import { cartStore } from './store/cart'

const app = createApp(App)

// 先使用 ElementPlus
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册全局购物车状态
app.provide('cartStore', cartStore)

app.use(router)
app.mount('#app')
