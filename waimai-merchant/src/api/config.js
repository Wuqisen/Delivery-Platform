import axios from 'axios'
import router from '../router'
import { ElMessage } from 'element-plus'

// 根据环境确定 baseURL
// const getBaseURL = () => {
//   // 生产环境
//   if (process.env.NODE_ENV === 'production') {
//     return 'https://57869f2b.r27.cpolar.top/api'
//   }
//   console.log('Current ENV:', process.env.NODE_ENV) // 调试用
//   console.log('API URL:', process.env.VUE_APP_API_URL)
//   // 开发环境
//   // return 'http://localhost:3001/api'
//   return process.env.VUE_APP_API_URL
// }

// 创建 axios 实例
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 5000,
  withCredentials: true
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('merchant_token')
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
      localStorage.removeItem('merchant_token')
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(error.response?.data?.msg || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default api 