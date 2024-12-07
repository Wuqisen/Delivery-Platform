import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录', hideNavBar: true, hideCart: true }
  },
  {
    path: '/shop/:id',
    name: 'Shop',
    component: () => import('../views/Shop.vue'),
    meta: { title: '商家详情' }
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('../views/Order.vue'),
    meta: { title: '订单', requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Order.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/User.vue'),
    meta: { title: '我的', requiresAuth: true }
  },
  {
    path: '/address',
    name: 'AddressManage',
    component: () => import('../components/AddressManage.vue'),
    meta: { title: '地址管理', requiresAuth: true, hideNavBar: true }
  },
  {
    path: '/address/add',
    name: 'AddressAdd',
    component: () => import('../components/AddressManage.vue'),
    meta: { title: '新增地址', requiresAuth: true, hideNavBar: true }
  },
  {
    path: '/address/edit/:id',
    name: 'AddressEdit',
    component: () => import('../components/AddressManage.vue'),
    meta: { title: '编辑地址', requiresAuth: true, hideNavBar: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/Checkout.vue'),
    meta: { 
      title: '订单结算',
      requiresAuth: true,
      hideNavBar: true
    }
  },
  {
    path: '/payment',
    name: 'Payment',
    component: () => import('../views/Payment.vue'),
    meta: { 
      title: '订单支付',
      requiresAuth: true,
      hideNavBar: true
    }
  },
  {
    path: '/register',
    name: 'UserRegister',
    component: () => import('@/views/register/UserRegister.vue'),
    meta: { 
      title: '用户注册',
      requiresAuth: false,
      hideNavBar: true,
      hideCart: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置标题
  document.title = to.meta.title || '外卖用户端'
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
