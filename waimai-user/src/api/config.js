import axios from 'axios'
import router from '../router'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response?.status === 401) {
      // 只有在非登录页面时才跳转
      if (router.currentRoute.value.path !== '/login') {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        ElMessage.error('登录已过期，请重新登录')
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }
    } else {
      ElMessage.error(error.response?.data?.msg || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default api 