import request from '../utils/request'

export const uploadAPI = {
  // 上传图片
  uploadImage(file, type = 'common') {
    const formData = new FormData()
    formData.append('file', file)
    
    return request({
      url: `/upload/${type}/image`,  // 移除 /api 前缀
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
} 