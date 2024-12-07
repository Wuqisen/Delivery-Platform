const express = require('express')
const router = express.Router()
const merchantController = require('../../controllers/merchant')
const auth = require('../../middleware/auth')

// 商户登录
router.post('/login', merchantController.login)

// 获取商户信息
router.get('/info', auth, merchantController.getInfo)

// 修改密码
router.post('/change-password', auth, merchantController.changePassword)

// 获取商户统计数据
router.get('/statistics', auth, merchantController.getStatistics)

module.exports = router 