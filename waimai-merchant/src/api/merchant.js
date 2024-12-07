import api from './config'

export const merchantAPI = {
  // 商户登录
  login(data) {
    return api.post('/merchant/login', data)
  },

  // 获取商户信息
  getInfo() {
    return api.get('/merchant/info')
  },

  // 修改密码
  changePassword(data) {
    return api.post('/merchant/change-password', data)
  },

  // 获取统计数据
  getStatistics() {
    return api.get('/merchant/statistics')
  }
} 