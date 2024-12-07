const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const auth = require('../middleware/auth');

// 所有订单接口都需要认证
router.use(auth);

// 创建订单
router.post('/', orderController.createOrder);

// 获取订单列表
router.get('/', orderController.getOrders);

// 获取订单详情
router.get('/:id', orderController.getOrderDetail);

// 取消订单
router.post('/:id/cancel', orderController.cancelOrder);

// 确认收货
router.post('/:id/confirm', orderController.confirmOrder);

// 评价订单
router.post('/:id/rate', orderController.rateOrder);

// 获取支付信息
router.get('/:id/payment', orderController.getPaymentInfo);

// 支付订单
router.post('/:id/pay', orderController.payOrder);

module.exports = router; 