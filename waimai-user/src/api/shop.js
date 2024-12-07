import request from '../utils/request'

export const shopAPI = {
  // 获取商家列表
  getShops(params) {
    return request({
      url: '/shops',  // 移除 /api 前缀
      method: 'get',
      params
    })
  },

  // 获取商家详情
  getShopDetail(id) {
    return request({
      url: `/shops/${id}`,  // 移除 /api 前缀
      method: 'get'
    })
  },

  // 获取商家分类
  getCategories(shopId) {
    return request({
      url: `/shops/${shopId}/categories`,  // 移除 /api 前缀
      method: 'get'
    })
  },

  // 获取商家菜品
  getDishes(shopId, params) {
    return request({
      url: `/shops/${shopId}/dishes`,  // 移除 /api 前缀
      method: 'get',
      params
    })
  }
} 