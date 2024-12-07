import api from './config'

export const dishAPI = {
  // 获取菜品列表
  getDishes(params) {
    return api.get('/merchant/dishes', { params })
  },

  // 获取菜品分类
  getCategories() {
    return api.get('/merchant/dishes/categories')
  },

  // 添加菜品
  addDish(data) {
    return api.post('/merchant/dishes', data)
  },

  // 更新菜品
  updateDish(id, data) {
    return api.put(`/merchant/dishes/${id}`, data)
  },

  // 删除菜品
  deleteDish(id) {
    return api.delete(`/merchant/dishes/${id}`)
  },

  // 更新菜品状态
  updateDishStatus(id, status) {
    return api.put(`/merchant/dishes/${id}/status`, { status })
  }
} 