const db = require('../../config/db')

const riderController = {
  // 获取可用骑手列表
  async getAvailableRiders(req, res) {
    try {
      console.log('获取可用骑手列表')
      
      // 获取可用骑手
      const [riders] = await db.query(`
        SELECT 
          id, name, phone, rating, total_orders,
          CASE 
            WHEN status = 1 THEN '空闲'
            WHEN status = 2 THEN '配送中'
            WHEN status = 3 THEN '休息中'
          END as status_text,
          status
        FROM riders 
        WHERE status = 1
        ORDER BY rating DESC, total_orders DESC
      `)

      console.log('查询到的骑手列表:', riders)

      res.json({
        code: 0,
        msg: 'success',
        data: riders
      })
    } catch (error) {
      console.error('获取骑手列表失败:', error)
      res.status(500).json({
        code: 500,
        msg: error.message || '获取骑手列表失败',
        data: null
      })
    }
  },

  // 分配骑手
  async assignRider(req, res) {
    const conn = await db.getConnection()
    try {
      await conn.beginTransaction()
      console.log('开始分配骑手, 参数:', { orderId: req.params.id, riderId: req.body.riderId })

      const { id } = req.params
      const { riderId } = req.body
      const shopId = req.merchant.shop_id

      // 检查订单状态
      const [orders] = await conn.query(
        'SELECT status FROM orders WHERE id = ? AND shop_id = ?',
        [id, shopId]
      )
      console.log('订单状态:', orders)

      if (orders.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '订单不存在',
          data: null
        })
      }

      if (orders[0].status !== 3) {
        return res.status(400).json({
          code: 400,
          msg: '订单状态错误，只能分配待配送状态的订单',
          data: null
        })
      }

      // 检查骑手状态
      const [riders] = await conn.query(
        'SELECT status FROM riders WHERE id = ?',
        [riderId]
      )
      console.log('骑手状态:', riders)

      if (riders.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '骑手不存在',
          data: null
        })
      }

      if (riders[0].status !== 1) {
        return res.status(400).json({
          code: 400,
          msg: '骑手当前不可接单',
          data: null
        })
      }

      // 创建配送记录
      await conn.query(
        `INSERT INTO order_deliveries (
          order_id, rider_id, status, created_at
        ) VALUES (?, ?, 1, NOW())`,
        [id, riderId]
      )

      // 更新订单状态
      await conn.query(
        'UPDATE orders SET status = 4 WHERE id = ?',
        [id]
      )

      // 更新骑手状态
      await conn.query(
        'UPDATE riders SET status = 2, total_orders = total_orders + 1 WHERE id = ?',
        [riderId]
      )

      await conn.commit()
      console.log('分配骑手成功')

      res.json({
        code: 0,
        msg: '分配成功',
        data: null
      })
    } catch (error) {
      await conn.rollback()
      console.error('分配骑手失败:', error)
      res.status(500).json({
        code: 500,
        msg: error.message || '分配骑手失败',
        data: null
      })
    } finally {
      conn.release()
    }
  }
}

module.exports = riderController 