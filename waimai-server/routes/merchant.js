const express = require('express')
const router = express.Router()
const merchantController = require('../controllers/merchant')
const orderController = require('../controllers/merchant/order')
const dishController = require('../controllers/merchant/dish')
const riderController = require('../controllers/merchant/rider')
const auth = require('../middleware/auth')

// 商户登录相关
router.post('/login', merchantController.login)
router.get('/info', auth, merchantController.getInfo)
router.get('/statistics', auth, merchantController.getStatistics)

// 订单相关
router.get('/orders', auth, orderController.getOrders)
router.post('/orders/:id/confirm', auth, orderController.confirmOrder)
router.get('/orders/:id', auth, orderController.getOrderDetail)

// 菜品相关
router.get('/dishes', auth, dishController.getDishes)
router.get('/dishes/categories', auth, dishController.getCategories)
router.post('/dishes', auth, dishController.addDish)
router.put('/dishes/:id', auth, dishController.updateDish)
router.delete('/dishes/:id', auth, dishController.deleteDish)

// 骑手相关
router.get('/riders/available', auth, riderController.getAvailableRiders)
router.post('/orders/:id/assign', auth, riderController.assignRider)

module.exports = router 