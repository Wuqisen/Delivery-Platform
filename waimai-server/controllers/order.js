const db = require('../config/db');

const orderController = {
  // 创建订单
  async createOrder(req, res) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { shopId, addressId, items, remark = '', paymentMethod = 1 } = req.body;
      const userId = req.user.id;

      // 参数验证
      if (!shopId || !addressId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          code: 400,
          msg: '参数错误',
          data: null
        });
      }

      // 生成订单号: 时间戳 + 4位随机数
      const orderId = `${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // 计算订单总金额
      let subtotal = 0;
      const orderItems = [];

      // 获取所有菜品价格并计算商品总额
      for (const item of items) {
        if (!item.id || !item.quantity) {
          throw new Error('商品信息不完整');
        }

        const [dishes] = await conn.query(
          'SELECT price FROM dishes WHERE id = ? AND shop_id = ?',
          [item.id, shopId]
        );

        if (dishes.length === 0) {
          throw new Error(`商品 ${item.id} 不存在`);
        }

        const price = parseFloat(dishes[0].price);
        const quantity = parseInt(item.quantity);
        subtotal += price * quantity;
        
        orderItems.push({
          dishId: item.id,
          quantity: quantity,
          price: price
        });
      }

      // 获取配送费
      const [shops] = await conn.query(
        'SELECT delivery_fee FROM shops WHERE id = ?',
        [shopId]
      );

      if (shops.length === 0) {
        throw new Error('商家不存在');
      }

      const deliveryFee = parseFloat(shops[0].delivery_fee);
      const totalAmount = subtotal + deliveryFee;

      // 创建订单
      await conn.query(
        `INSERT INTO orders (
          id, user_id, shop_id, address_id, total_amount, 
          delivery_fee, status, payment_method, remark, create_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          orderId,
          userId,
          shopId,
          addressId,
          totalAmount,
          deliveryFee,
          1, // status: 1 = 待支付
          paymentMethod,
          remark
        ]
      );

      // 创建订单商品记录
      for (const item of orderItems) {
        await conn.query(
          `INSERT INTO order_items (
            order_id, dish_id, quantity, price
          ) VALUES (?, ?, ?, ?)`,
          [orderId, item.dishId, item.quantity, item.price]
        );

        // 更新菜品销量
        await conn.query(
          'UPDATE dishes SET sales = sales + ? WHERE id = ?',
          [item.quantity, item.dishId]
        );
      }

      // 更新商家月销量
      await conn.query(
        'UPDATE shops SET monthly_sales = monthly_sales + 1 WHERE id = ?',
        [shopId]
      );

      await conn.commit();

      res.json({
        code: 0,
        msg: 'success',
        data: {
          orderId,
          totalAmount: totalAmount.toFixed(2),
          status: 1
        }
      });
    } catch (error) {
      await conn.rollback();
      console.error('创建订单失败:', error);
      res.status(500).json({
        code: 500,
        msg: error.message || '创建订单失败',
        data: null
      });
    } finally {
      conn.release();
    }
  },

  // 获取订单列表
  async getOrders(req, res) {
    try {
      const status = parseInt(req.query.status) || 0;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const userId = req.user.id;
      const offset = (page - 1) * pageSize;

      let query = `
        SELECT 
          o.*, 
          s.name as shop_name, 
          s.image as shop_image
        FROM orders o
        LEFT JOIN shops s ON o.shop_id = s.id
        WHERE o.user_id = ?
      `;
      const params = [userId];

      if (status > 0) {
        query += ' AND o.status = ?';
        params.push(status);
      }

      // 先获取总数
      const [total] = await db.query(
        `SELECT COUNT(*) as total FROM orders o WHERE o.user_id = ?${status > 0 ? ' AND o.status = ?' : ''}`,
        status > 0 ? [userId, status] : [userId]
      );

      // 获取分页数据
      query += ' ORDER BY o.create_time DESC LIMIT ? OFFSET ?';
      const [orders] = await db.query(query, [...params, pageSize, offset]);

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
        `, [order.id]);

        order.items = items.map(item => ({
          ...item,
          imageUrl: item.image ? `${req.protocol}://${req.get('host')}/uploads/dishes/${item.image}` : null
        }));
        order.shopImageUrl = order.shop_image ? `${req.protocol}://${req.get('host')}/uploads/shops/${order.shop_image}` : null;
      }

      res.json({
        code: 0,
        msg: 'success',
        data: {
          total: total[0].total,
          list: orders
        }
      });
    } catch (error) {
      console.error('获取订单列表失败:', error);
      res.status(500).json({
        code: 500,
        msg: '获取订单列表失败',
        data: null
      });
    }
  },

  // 获取订单详情
  async getOrderDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // 获取订单基本信息
      const [orders] = await db.execute(`
        SELECT 
          o.*,
          s.name as shop_name,
          s.image as shop_image,
          a.name as address_name,
          a.phone as address_phone,
          a.address as address_detail
        FROM orders o
        LEFT JOIN shops s ON o.shop_id = s.id
        LEFT JOIN addresses a ON o.address_id = a.id
        WHERE o.id = ? AND o.user_id = ?
      `, [id, userId]);

      if (orders.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '订单不存在',
          data: null
        });
      }

      const order = orders[0];

      // 获取订单商品
      const [items] = await db.execute(`
        SELECT 
          oi.*,
          d.name,
          d.image
        FROM order_items oi
        LEFT JOIN dishes d ON oi.dish_id = d.id
        WHERE oi.order_id = ?
      `, [id]);

      order.items = items.map(item => ({
        ...item,
        imageUrl: `${req.protocol}://${req.get('host')}/uploads/dishes/${item.image}`
      }));
      order.shopImageUrl = `${req.protocol}://${req.get('host')}/uploads/shops/${order.shop_image}`;

      // 格式化地址信息
      order.address = {
        name: order.address_name,
        phone: order.address_phone,
        address: order.address_detail
      };

      res.json({
        code: 0,
        msg: 'success',
        data: order
      });
    } catch (error) {
      console.error('获取订单详情失败:', error);
      res.status(500).json({
        code: 500,
        msg: '获取订单详情失败',
        data: null
      });
    }
  },

  // 取消订单
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const [result] = await db.execute(
        'UPDATE orders SET status = 5 WHERE id = ? AND user_id = ? AND status = 1',
        [id, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({
          code: 400,
          msg: '订单无法取消',
          data: null
        });
      }

      res.json({
        code: 0,
        msg: 'success',
        data: null
      });
    } catch (error) {
      console.error('取消订单失败:', error);
      res.status(500).json({
        code: 500,
        msg: '取消订单失败',
        data: null
      });
    }
  },

  // 确认收货
  async confirmOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const [result] = await db.execute(
        'UPDATE orders SET status = 4 WHERE id = ? AND user_id = ? AND status = 3',
        [id, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({
          code: 400,
          msg: '订单无法确认收货',
          data: null
        });
      }

      res.json({
        code: 0,
        msg: 'success',
        data: null
      });
    } catch (error) {
      console.error('确认收货失败:', error);
      res.status(500).json({
        code: 500,
        msg: '确认收货失败',
        data: null
      });
    }
  },

  // 评价订单
  async rateOrder(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment, images = [] } = req.body;
      const userId = req.user.id;

      // 检查订单状态
      const [orders] = await db.execute(
        'SELECT shop_id FROM orders WHERE id = ? AND user_id = ? AND status = 4',
        [id, userId]
      );

      if (orders.length === 0) {
        return res.status(400).json({
          code: 400,
          msg: '订单不可评价',
          data: null
        });
      }

      // 创建评价
      await db.execute(
        `INSERT INTO order_ratings (
          order_id, user_id, shop_id, rating, comment, images
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, userId, orders[0].shop_id, rating, comment, JSON.stringify(images)]
      );

      // 更新商家评分
      const [ratings] = await db.execute(
        'SELECT AVG(rating) as avg_rating FROM order_ratings WHERE shop_id = ?',
        [orders[0].shop_id]
      );

      await db.execute(
        'UPDATE shops SET rating = ? WHERE id = ?',
        [ratings[0].avg_rating, orders[0].shop_id]
      );

      res.json({
        code: 0,
        msg: 'success',
        data: null
      });
    } catch (error) {
      console.error('评价订单失败:', error);
      res.status(500).json({
        code: 500,
        msg: '评价订单失败',
        data: null
      });
    }
  },

  // 获取支付信息
  async getPaymentInfo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const [orders] = await db.execute(
        'SELECT total_amount FROM orders WHERE id = ? AND user_id = ? AND status = 1',
        [id, userId]
      );

      if (orders.length === 0) {
        return res.status(400).json({
          code: 400,
          msg: '订单不可支付',
          data: null
        });
      }

      // 这里可以集成实际的支付系统，生成支付二维码等
      // 这里只返回一个模拟的支付信息
      res.json({
        code: 0,
        msg: 'success',
        data: {
          orderId: id,
          amount: orders[0].total_amount,
          qrcode: 'mock_qrcode_url'
        }
      });
    } catch (error) {
      console.error('获取支付信息失败:', error);
      res.status(500).json({
        code: 500,
        msg: '获取支付信息失败',
        data: null
      });
    }
  },

  // 支付订单
  async payOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // 这里应该验证支付结果，这里简化处理，直接更新订单状态
      const [result] = await db.execute(
        `UPDATE orders 
        SET status = 2, pay_time = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ? AND status = 1`,
        [id, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({
          code: 400,
          msg: '订单支付失败',
          data: null
        });
      }

      res.json({
        code: 0,
        msg: 'success',
        data: null
      });
    } catch (error) {
      console.error('支付订单失败:', error);
      res.status(500).json({
        code: 500,
        msg: '支付订单失败',
        data: null
      });
    }
  }
};

module.exports = orderController; 