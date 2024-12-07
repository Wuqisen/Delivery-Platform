import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/login/index.vue'
import LayoutView from '../views/layout/index.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: LayoutView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Overview',
        component: () => import('../views/dashboard/index.vue')
      },
      {
        path: '/orders',
        name: 'Orders',
        component: () => import('../views/order/index.vue')
      },
      {
        path: '/orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/order/detail.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/dishes',
        name: 'Dishes',
        component: () => import('../views/dish/index.vue')
      },
      {
        path: '/dishes/edit/:id?',
        name: 'DishEdit',
        component: () => import('../views/dish/edit.vue')
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('../views/setting/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('merchant_token')
  console.log('Current route:', to.path, 'Token:', token) // 添加调试日志
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 