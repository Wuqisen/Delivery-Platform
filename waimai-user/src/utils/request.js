import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

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
// 创建axios实例
const request = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  timeout: 5000,
  withCredentials: true  // 允许跨域携带 cookie
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加调试日志
    console.log('Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    })
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码不是0，说明接口出错了
    if (res.code !== 0) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  error => {
    console.error('响应错误:', error)
    
    // 处理401错误
    if (error.response?.status === 401) {
      // 清除token和用户信息
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      // 跳转到登录页
      router.push('/login')
    }
    
    ElMessage.error(error.response?.data?.msg || '请求失败')
    return Promise.reject(error)
  }
)

export default request 