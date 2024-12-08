import request from '../utils/request'

export const userAPI = {
  // 用户注册
  register(data) {
    return request({
      url: '/user/register',
      method: 'post',
      data
    })
  },

  // 用户登录
  login(data) {
    return request({
      url: '/user/login',
      method: 'post',
      data: {
        phone: data.phone,
        password: data.password
      }
    })
  },

  // 获取用户信息
  getProfile() {
    return request({
      url: '/user/profile',
      method: 'get'
    })
  },

  // 更新用户信息
  updateProfile(data) {
    return request({
      url: '/user/profile',
      method: 'put',
      data
    })
  },

  // 获取地址列表
  getAddresses() {
    return request({
      url: '/user/addresses',
      method: 'get'
    })
  },

  // 添加地址
  addAddress(data) {
    return request({
      url: '/user/addresses',
      method: 'post',
      data
    })
  },

  // 更新地址
  updateAddress(id, data) {
    return request({
      url: `/user/addresses/${id}`,
      method: 'put',
      data
    })
  },

  // 删除地址
  deleteAddress(id) {
    return request({
      url: `/user/addresses/${id}`,
      method: 'delete'
    })
  },

  // 设置默认地址
  setDefaultAddress(id) {
    return request({
      url: `/user/addresses/${id}/default`,
      method: 'post'
    })
  },

  // 上传头像
  uploadAvatar(formData) {
    return request({
      url: '/upload/avatar',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
} 