import request from '../utils/request'

export const orderAPI = {
  // 创建订单
  createOrder(data) {
    return request({
      url: '/orders',
      method: 'post',
      data
    })
  },

  // 获取订单列表
  getOrders(params) {
    return request({
      url: '/orders',
      method: 'get',
      params
    })
  },

  // 获取订单详情
  getOrderDetail(id) {
    return request({
      url: `/orders/${id}`,
      method: 'get'
    })
  },

  // 取消订单
  cancelOrder(id) {
    return request({
      url: `/orders/${id}/cancel`,
      method: 'post'
    })
  },

  // 确认收货
  confirmOrder(id) {
    return request({
      url: `/orders/${id}/confirm`,
      method: 'post'
    })
  },

  // 评价订单
  rateOrder(id, data) {
    return request({
      url: `/orders/${id}/rate`,
      method: 'post',
      data
    })
  },

  // 获取支付信息
  getPaymentInfo(id) {
    return request({
      url: `/orders/${id}/payment`,
      method: 'get'
    })
  },

  // 支付订单
  payOrder(id, data) {
    return request({
      url: `/orders/${id}/pay`,
      method: 'post',
      data
    })
  }
} 