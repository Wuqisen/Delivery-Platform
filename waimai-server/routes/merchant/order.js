const express = require('express')
const router = express.Router()
const orderController = require('../../controllers/merchant/order')
const auth = require('../../middleware/auth')

// 获取订单列表
router.get('/', auth, orderController.getOrders)

// 确认订单
router.post('/:id/confirm', auth, orderController.confirmOrder)

// 分配骑手
router.post('/:id/assign', auth, orderController.assignRider)

// 获取可用骑手列表
router.get('/riders/available', auth, orderController.getAvailableRiders)

module.exports = router 