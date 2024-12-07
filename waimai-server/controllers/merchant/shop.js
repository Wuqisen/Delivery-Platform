const db = require('../../config/db')

const shopController = {
  // 获取店铺信息
  async getShopInfo(req, res) {
    try {
      const shopId = req.merchant.shop_id

      const [shops] = await db.execute(`
        SELECT 
          id, name, image, notice, phone, address,
          delivery_fee, min_delivery, delivery_time,
          status, rating, monthly_sales
        FROM shops 
        WHERE id = ?
      `, [shopId])

      if (shops.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '店铺不存在',
          data: null
        })
      }

      // 获取营业时间
      const [businessHours] = await db.execute(
        'SELECT * FROM shop_business_hours WHERE shop_id = ? ORDER BY id',
        [shopId]
      )

      const shop = shops[0]
      shop.businessHours = businessHours

      res.json({
        code: 0,
        msg: 'success',
        data: shop
      })
    } catch (error) {
      console.error('获取店铺信息失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  },

  // 更新店铺信息
  async updateShopInfo(req, res) {
    const conn = await db.getConnection()
    try {
      await conn.beginTransaction()

      const shopId = req.merchant.shop_id
      const {
        name, image, notice, phone, address,
        deliveryFee, minDelivery, deliveryTime,
        status, businessHours
      } = req.body

      // 更新店铺基本信息
      const updates = []
      const params = []

      if (name) {
        updates.push('name = ?')
        params.push(name)
      }
      if (image) {
        updates.push('image = ?')
        params.push(image)
      }
      if (notice !== undefined) {
        updates.push('notice = ?')
        params.push(notice)
      }
      if (phone) {
        updates.push('phone = ?')
        params.push(phone)
      }
      if (address) {
        updates.push('address = ?')
        params.push(address)
      }
      if (deliveryFee !== undefined) {
        updates.push('delivery_fee = ?')
        params.push(deliveryFee)
      }
      if (minDelivery !== undefined) {
        updates.push('min_delivery = ?')
        params.push(minDelivery)
      }
      if (deliveryTime !== undefined) {
        updates.push('delivery_time = ?')
        params.push(deliveryTime)
      }
      if (status !== undefined) {
        updates.push('status = ?')
        params.push(status)
      }

      if (updates.length > 0) {
        params.push(shopId)
        await conn.execute(
          `UPDATE shops SET ${updates.join(', ')} WHERE id = ?`,
          params
        )
      }

      // 更新营业时间
      if (businessHours && Array.isArray(businessHours)) {
        // 先删除旧的营业时间
        await conn.execute(
          'DELETE FROM shop_business_hours WHERE shop_id = ?',
          [shopId]
        )

        // 插入新的营业时间
        for (const time of businessHours) {
          await conn.execute(
            `INSERT INTO shop_business_hours (
              shop_id, start_time, end_time
            ) VALUES (?, ?, ?)`,
            [shopId, time.start, time.end]
          )
        }
      }

      await conn.commit()

      res.json({
        code: 0,
        msg: '更新成功',
        data: null
      })
    } catch (error) {
      await conn.rollback()
      console.error('更新店铺信息失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    } finally {
      conn.release()
    }
  },

  // 获取店铺分类列表
  async getCategories(req, res) {
    try {
      const shopId = req.merchant.shop_id

      const [categories] = await db.execute(
        'SELECT * FROM shop_categories WHERE shop_id = ? ORDER BY sort_order',
        [shopId]
      )

      res.json({
        code: 0,
        msg: 'success',
        data: categories
      })
    } catch (error) {
      console.error('获取分类列表失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  },

  // 添加分类
  async addCategory(req, res) {
    try {
      const shopId = req.merchant.shop_id
      const { name, sortOrder = 0 } = req.body

      const [result] = await db.execute(
        'INSERT INTO shop_categories (shop_id, name, sort_order) VALUES (?, ?, ?)',
        [shopId, name, sortOrder]
      )

      res.json({
        code: 0,
        msg: '添加成功',
        data: {
          id: result.insertId
        }
      })
    } catch (error) {
      console.error('添加分类失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  },

  // 更新分类
  async updateCategory(req, res) {
    try {
      const shopId = req.merchant.shop_id
      const { id } = req.params
      const { name, sortOrder } = req.body

      const [result] = await db.execute(
        'UPDATE shop_categories SET name = ?, sort_order = ? WHERE id = ? AND shop_id = ?',
        [name, sortOrder, id, shopId]
      )

      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '分类不存在',
          data: null
        })
      }

      res.json({
        code: 0,
        msg: '更新成功',
        data: null
      })
    } catch (error) {
      console.error('更新分类失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  },

  // 删除分类
  async deleteCategory(req, res) {
    const conn = await db.getConnection()
    try {
      await conn.beginTransaction()

      const shopId = req.merchant.shop_id
      const { id } = req.params

      // 检查分类下是否有菜品
      const [dishes] = await conn.execute(
        'SELECT COUNT(*) as count FROM dishes WHERE category_id = ?',
        [id]
      )

      if (dishes[0].count > 0) {
        return res.status(400).json({
          code: 400,
          msg: '分类下存在菜品，无法删除',
          data: null
        })
      }

      // 删除分类
      const [result] = await conn.execute(
        'DELETE FROM shop_categories WHERE id = ? AND shop_id = ?',
        [id, shopId]
      )

      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '分类不存在',
          data: null
        })
      }

      await conn.commit()

      res.json({
        code: 0,
        msg: '删除成功',
        data: null
      })
    } catch (error) {
      await conn.rollback()
      console.error('删除分类失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    } finally {
      conn.release()
    }
  }
}

module.exports = shopController 