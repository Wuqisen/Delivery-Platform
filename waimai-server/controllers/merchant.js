const db = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config')

const merchantController = {
  // 商户登录
  async login(req, res) {
    try {
      const { username, password } = req.body

      // 查询商户
      const [merchants] = await db.execute(
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

      // 返回商户信息
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

  // 获取商户信息
  async getInfo(req, res) {
    try {
      const merchantId = req.merchant.id

      const [merchants] = await db.execute(
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

  // 修改密码
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body
      const merchantId = req.merchant.id

      // 查询当前密码
      const [merchants] = await db.execute(
        'SELECT password FROM merchants WHERE id = ?',
        [merchantId]
      )

      if (merchants.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '商户不存在',
          data: null
        })
      }

      // 验证旧密码
      const isMatch = await bcrypt.compare(oldPassword, merchants[0].password)
      if (!isMatch) {
        return res.status(400).json({
          code: 400,
          msg: '原密��错误',
          data: null
        })
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // 更新密码
      await db.execute(
        'UPDATE merchants SET password = ? WHERE id = ?',
        [hashedPassword, merchantId]
      )

      res.json({
        code: 0,
        msg: '密码修改成功',
        data: null
      })
    } catch (error) {
      console.error('修改密码失败:', error)
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
      const merchantId = req.merchant.id
      const shopId = req.merchant.shop_id

      // 获取今日订单数和营业额
      const [todayStats] = await db.execute(`
        SELECT 
          COUNT(*) as order_count,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM orders 
        WHERE shop_id = ? 
        AND DATE(create_time) = CURDATE()
        AND status != 6
      `, [shopId])

      // 获取昨日订单数和营业额
      const [yesterdayStats] = await db.execute(`
        SELECT 
          COUNT(*) as order_count,
          COALESCE(SUM(total_amount), 0) as revenue
        FROM orders 
        WHERE shop_id = ? 
        AND DATE(create_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        AND status != 6
      `, [shopId])

      // 获取待处理订单数
      const [pendingOrders] = await db.execute(`
        SELECT COUNT(*) as count
        FROM orders 
        WHERE shop_id = ? AND status = 2
      `, [shopId])

      // 获取菜品统计
      const [dishStats] = await db.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active
        FROM dishes 
        WHERE shop_id = ?
      `, [shopId])

      // 获取营业额趋势
      const [revenueTrend] = await db.execute(`
        SELECT 
          DATE_FORMAT(create_time, '%Y-%m-%d') as date,
          SUM(total_amount) as revenue
        FROM orders 
        WHERE shop_id = ? 
        AND create_time >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND status != 6
        GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d')
        ORDER BY date
      `, [shopId])

      // 获取热销商品TOP5
      const [topDishes] = await db.execute(`
        SELECT 
          d.name,
          COUNT(*) as sales
        FROM order_items oi
        JOIN dishes d ON oi.dish_id = d.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.shop_id = ?
        AND o.create_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY d.id
        ORDER BY sales DESC
        LIMIT 5
      `, [shopId])

      // 计算同比
      const orderCompare = yesterdayStats[0].order_count === 0 ? 0 :
        ((todayStats[0].order_count - yesterdayStats[0].order_count) / yesterdayStats[0].order_count * 100).toFixed(2)
      
      const revenueCompare = yesterdayStats[0].revenue === 0 ? 0 :
        ((todayStats[0].revenue - yesterdayStats[0].revenue) / yesterdayStats[0].revenue * 100).toFixed(2)

      res.json({
        code: 0,
        msg: 'success',
        data: {
          todayOrders: todayStats[0].order_count,
          orderCompare: Number(orderCompare),
          todayRevenue: Number(todayStats[0].revenue),
          revenueCompare: Number(revenueCompare),
          pendingOrders: pendingOrders[0].count,
          totalDishes: dishStats[0].total,
          activeDishes: dishStats[0].active,
          revenueTrend: {
            dates: revenueTrend.map(item => item.date),
            values: revenueTrend.map(item => Number(item.revenue))
          },
          topDishes: topDishes.map(item => ({
            name: item.name,
            sales: item.sales
          }))
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