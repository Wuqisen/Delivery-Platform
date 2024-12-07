import api from './config'

export const orderAPI = {
  // 获取订单列表
  getOrders(params) {
    return api.get('/merchant/orders', { params })
  },

  // 获取订单详情
  getOrderDetail(id) {
    return api.get(`/merchant/orders/${id}`)
  },

  // 确认订单
  confirmOrder(id) {
    return api.post(`/merchant/orders/${id}/confirm`)
  },

  // 分配骑手
  assignRider(orderId, riderId) {
    return api.post(`/merchant/orders/${orderId}/assign`, { riderId })
  },

  // 获取可用骑手列表
  getAvailableRiders() {
    return api.get('/merchant/riders/available')
  }
} 