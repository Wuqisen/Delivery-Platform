const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const auth = require('../middleware/auth');

// 生成支付二维码
router.get('/:orderId/qrcode', auth, paymentController.generatePaymentQRCode);

// 支付回调
router.post('/callback', paymentController.paymentCallback);

module.exports = router; 