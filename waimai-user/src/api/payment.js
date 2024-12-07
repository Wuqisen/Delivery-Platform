import request from '../utils/request'

export const paymentAPI = {
  // 获取支付信息
  getPaymentInfo(orderId) {
    return request({
      url: `/payments/${orderId}`,  // 移除 /api 前缀
      method: 'get'
    })
  },

  // 支付订单
  payOrder(orderId, data) {
    return request({
      url: `/payments/${orderId}/pay`,  // 移除 /api 前缀
      method: 'post',
      data
    })
  }
} 