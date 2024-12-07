import axios from 'axios'
import router from '../router'

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // 后端API基础URL
  timeout: 5000
})

// 请求拦截器 - 添加token等认证信息
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // 未登录或token过期
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

export default api 