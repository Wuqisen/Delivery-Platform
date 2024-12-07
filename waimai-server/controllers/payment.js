const db = require('../config/db');
const QRCode = require('qrcode');

const paymentController = {
  // 生成支付二维码
  async generatePaymentQRCode(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      // 检查订单状态
      const [orders] = await db.execute(
        'SELECT total_amount FROM orders WHERE id = ? AND user_id = ? AND status = 1',
        [orderId, userId]
      );

      if (orders.length === 0) {
        return res.status(400).json({
          code: 400,
          msg: '订单不可支付',
          data: null
        });
      }

      // 生成支付记录
      await db.execute(
        `INSERT INTO payments (order_id, amount, method, status) 
        VALUES (?, ?, 1, 1)`,
        [orderId, orders[0].total_amount]
      );

      // 生成支付二维码（这里使用模拟数据）
      const paymentUrl = `https://pay.example.com/pay/${orderId}`;
      const qrcode = await QRCode.toDataURL(paymentUrl);

      res.json({
        code: 0,
        msg: 'success',
        data: {
          orderId,
          amount: orders[0].total_amount,
          qrcode
        }
      });
    } catch (error) {
      console.error('生成支付二维码失败:', error);
      res.status(500).json({
        code: 500,
        msg: '生成支付二维码失败',
        data: null
      });
    }
  },

  // 支付回调
  async paymentCallback(req, res) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { orderId, transactionId } = req.body;

      // 更新支付记录
      await conn.execute(
        `UPDATE payments 
        SET status = 2, transaction_id = ?, pay_time = CURRENT_TIMESTAMP 
        WHERE order_id = ? AND status = 1`,
        [transactionId, orderId]
      );

      // 更新订单状态
      await conn.execute(
        `UPDATE orders 
        SET status = 2, pay_time = CURRENT_TIMESTAMP 
        WHERE id = ? AND status = 1`,
        [orderId]
      );

      await conn.commit();

      res.json({
        code: 0,
        msg: 'success',
        data: null
      });
    } catch (error) {
      await conn.rollback();
      console.error('支付回调处理失败:', error);
      res.status(500).json({
        code: 500,
        msg: '支付回调处理失败',
        data: null
      });
    } finally {
      conn.release();
    }
  }
};

module.exports = paymentController;