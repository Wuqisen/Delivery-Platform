const express = require('express')
const router = express.Router()
const shopController = require('../../controllers/merchant/shop')
const auth = require('../../middleware/auth')

// 获取店铺信息
router.get('/info', auth, shopController.getShopInfo)

// 更新店铺信息
router.put('/info', auth, shopController.updateShopInfo)

// 获取分类列表
router.get('/categories', auth, shopController.getCategories)

// 添加分类
router.post('/categories', auth, shopController.addCategory)

// 更新分类
router.put('/categories/:id', auth, shopController.updateCategory)

// 删除分类
router.delete('/categories/:id', auth, shopController.deleteCategory)

module.exports = router 