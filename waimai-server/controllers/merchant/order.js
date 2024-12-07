const db = require('../../config/db')

const orderController = {
  // 获取订单列表
  async getOrders(req, res) {
    try {
      const shopId = req.merchant.shop_id
      const { orderId, status, page = 1, pageSize = 10 } = req.query
      const offset = (page - 1) * pageSize

      let query = `
        SELECT 
          o.*,
          u.nickname as user_name,
          u.phone as user_phone,
          a.name as address_name,
          a.phone as address_phone,
          a.address as address_detail
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN addresses a ON o.address_id = a.id
        WHERE o.shop_id = ?
      `
      let params = [shopId]

      if (orderId) {
        query += ' AND o.id = ?'
        params.push(orderId)
      }

      if (status) {
        query += ' AND o.status = ?'
        params.push(parseInt(status))
      }

      // 获取总数
      const [totalRows] = await db.query(
        'SELECT COUNT(*) as total FROM orders WHERE shop_id = ?',
        [shopId]
      )

      // 获取分页数据
      query += ' ORDER BY o.create_time DESC LIMIT ? OFFSET ?'
      params.push(parseInt(pageSize), parseInt(offset))

      console.log('Query:', query)
      console.log('Params:', params)

      const [orders] = await db.query(query, params)

      // 获取订单商品
      for (const order of orders) {
        const [items] = await db.query(`
          SELECT 
            oi.*,
            d.name,
            d.image
          FROM order_items oi
          LEFT JOIN dishes d ON oi.dish_id = d.id
          WHERE oi.order_id = ?
        `, [order.id])

        order.items = items.map(item => ({
          ...item,
          imageUrl: item.image ? `${item.image}` : null
        }))

        // 格式化地址信息
        order.address = {
          name: order.address_name,
          phone: order.address_phone,
          address: order.address_detail
        }

        // 删除冗余字段
        delete order.address_name
        delete order.address_phone
        delete order.address_detail
      }

      console.log('Shop ID:', shopId);
      console.log('Query:', query);
      console.log('Params:', params);
      console.log('Total Rows:', totalRows);
      console.log('Orders:', orders);

      res.json({
        code: 0,
        msg: 'success',
        data: {
          total: totalRows[0].total,
          list: orders
        }
      })
    } catch (error) {
      console.error('获取订单列表失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  },

  // 确认订单
  async confirmOrder(req, res) {
    const conn = await db.getConnection()
    try {
      await conn.beginTransaction()

      const { id } = req.params
      const shopId = req.merchant.shop_id

      // 检查订单状态
      const [orders] = await conn.query(
        'SELECT status FROM orders WHERE id = ? AND shop_id = ?',
        [id, shopId]
      )

      if (orders.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '订单不存在',
          data: null
        })
      }

      if (orders[0].status !== 2) {
        return res.status(400).json({
          code: 400,
          msg: '订单状态错误',
          data: null
        })
      }

      // 更新订单状态
      await conn.query(
        'UPDATE orders SET status = 3, merchant_confirmed = 1 WHERE id = ?',
        [id]
      )

      await conn.commit()

      res.json({
        code: 0,
        msg: '确认成功',
        data: null
      })
    } catch (error) {
      await conn.rollback()
      console.error('确认订单失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    } finally {
      conn.release()
    }
  },

  // 获取订单详情
  async getOrderDetail(req, res) {
    try {
      const { id } = req.params
      const shopId = req.merchant.shop_id

      // 获取订单基本信息
      const [orders] = await db.query(`
        SELECT 
          o.*,
          u.nickname as user_name,
          u.phone as user_phone,
          a.name as address_name,
          a.phone as address_phone,
          a.address as address_detail,
          r.name as rider_name,
          r.phone as rider_phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN addresses a ON o.address_id = a.id
        LEFT JOIN order_deliveries od ON o.id = od.order_id
        LEFT JOIN riders r ON od.rider_id = r.id
        WHERE o.id = ? AND o.shop_id = ?
      `, [id, shopId])

      if (orders.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '订单不存在',
          data: null
        })
      }

      const order = orders[0]

      // 获取订单商品
      const [items] = await db.query(`
        SELECT 
          oi.*,
          d.name,
          d.image
        FROM order_items oi
        LEFT JOIN dishes d ON oi.dish_id = d.id
        WHERE oi.order_id = ?
      `, [id])

      // 处理数据格式
      order.items = items.map(item => ({
        ...item,
        imageUrl: item.image ? `${req.protocol}://${req.get('host')}/uploads/dishes/${item.image}` : null
      }))

      order.address = {
        name: order.address_name,
        phone: order.address_phone,
        address: order.address_detail
      }

      if (order.rider_name) {
        order.rider = {
          name: order.rider_name,
          phone: order.rider_phone
        }
      }

      // 删除冗余字段
      delete order.address_name
      delete order.address_phone
      delete order.address_detail
      delete order.rider_name
      delete order.rider_phone

      res.json({
        code: 0,
        msg: 'success',
        data: order
      })
    } catch (error) {
      console.error('获取订单详情失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  }
}

module.exports = orderController 