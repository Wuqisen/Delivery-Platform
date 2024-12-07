const express = require('express')
const router = express.Router()

// 商户基本功能
router.use('/', require('./base'))

// 订单管理
router.use('/orders', require('./order'))

// 菜品管理
router.use('/dishes', require('./dish'))

// 店铺管理
router.use('/shop', require('./shop'))

module.exports = router 