const db = require('../../config/db')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../../config')

const merchantController = {
  // 商户登录
  async login(req, res) {
    try {
      const { username, password } = req.body

      // 查询商户
      const [merchants] = await db.query(
        `SELECT m.*, s.name as shop_name, s.image as shop_image 
         FROM merchants m
         LEFT JOIN shops s ON m.shop_id = s.id
         WHERE m.username = ?`,
        [username]
      )

      if (merchants.length === 0) {
        return res.status(400).json({
          code: 400,
          msg: '用户名或密码错误',
          data: null
        })
      }

      const merchant = merchants[0]

      // 直接比较密码（临时测试用）
      if (password !== '123456') {
        return res.status(400).json({
          code: 400,
          msg: '用户名或密码错误',
          data: null
        })
      }

      // 生成token
      const token = jwt.sign(
        { id: merchant.id, shop_id: merchant.shop_id },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      res.json({
        code: 0,
        msg: 'success',
        data: {
          token,
          merchantInfo: {
            id: merchant.id,
            username: merchant.username,
            shop_id: merchant.shop_id,
            shop_name: merchant.shop_name,
            shop_image: merchant.shop_image
          }
        }
      })
    } catch (error) {
      console.error('商户登录失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  },

  // 获取商户息
  async getInfo(req, res) {
    try {
      const merchantId = req.merchant.id

      const [merchants] = await db.query(
        `SELECT m.*, s.name as shop_name, s.image as shop_image 
         FROM merchants m
         LEFT JOIN shops s ON m.shop_id = s.id
         WHERE m.id = ?`,
        [merchantId]
      )

      if (merchants.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '商户不存在',
          data: null
        })
      }

      const merchant = merchants[0]

      res.json({
        code: 0,
        msg: 'success',
        data: {
          id: merchant.id,
          username: merchant.username,
          shop_id: merchant.shop_id,
          shop_name: merchant.shop_name,
          shop_image: merchant.shop_image
        }
      })
    } catch (error) {
      console.error('获取商户信息失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  },

  // 获取商户统计数据
  async getStatistics(req, res) {
    try {
      const shopId = req.merchant.shop_id

      // 获取今日订单数和营业额
      const [todayOrders] = await db.query(`
        SELECT o.*, oi.price, oi.quantity
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.shop_id = ? 
        AND DATE(o.create_time) = CURDATE()
        AND o.status != 6
      `, [shopId])

      // 计算今日营业额（商品总额 + 配送费）
      const todayRevenue = todayOrders.reduce((total, order) => {
        const subtotal = order.price * order.quantity || 0
        const deliveryFee = parseFloat(order.delivery_fee) || 0
        return total + subtotal + deliveryFee
      }, 0)

      // 获取昨日订单数和营业额
      const [yesterdayOrders] = await db.query(`
        SELECT o.*, oi.price, oi.quantity
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.shop_id = ? 
        AND DATE(o.create_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        AND o.status != 6
      `, [shopId])

      // 计算昨日营业额
      const yesterdayRevenue = yesterdayOrders.reduce((total, order) => {
        const subtotal = order.price * order.quantity || 0
        const deliveryFee = parseFloat(order.delivery_fee) || 0
        return total + subtotal + deliveryFee
      }, 0)

      // 获取待处理订单数
      const [pendingOrders] = await db.query(`
        SELECT COUNT(*) as count
        FROM orders 
        WHERE shop_id = ? AND status = 2
      `, [shopId])

      // 获取菜品统计
      const [dishStats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active
        FROM dishes 
        WHERE shop_id = ?
      `, [shopId])

      res.json({
        code: 0,
        msg: 'success',
        data: {
          todayOrders: todayOrders.length,
          todayRevenue: todayRevenue.toFixed(2),
          orderCompare: yesterdayOrders.length === 0 ? 0 :
            ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length * 100).toFixed(2),
          revenueCompare: yesterdayRevenue === 0 ? 0 :
            ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(2),
          pendingOrders: pendingOrders[0].count,
          totalDishes: dishStats[0].total,
          activeDishes: dishStats[0].active
        }
      })
    } catch (error) {
      console.error('获取统计数据失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  }
}

module.exports = merchantController 