const express = require('express')
const router = express.Router()

// 商户相关路由
router.use('/merchant', require('./merchant'))

module.exports = router 