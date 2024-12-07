const db = require('../../config/db')

const dishController = {
  // 获取菜品列表
  async getDishes(req, res) {
    try {
      const shopId = req.merchant.shop_id
      const { name, categoryId, page = 1, pageSize = 10 } = req.query
      const offset = (page - 1) * pageSize

      let query = `
        SELECT 
          d.*,
          c.name as category_name,
          i.url as image_url
        FROM dishes d
        LEFT JOIN shop_categories c ON d.category_id = c.id
        LEFT JOIN image_urls i ON i.resource_type = 'dish' AND i.resource_id = d.id
        WHERE d.shop_id = ?
      `
      const params = [shopId]

      if (name) {
        query += ' AND d.name LIKE ?'
        params.push(`%${name}%`)
      }

      if (categoryId) {
        query += ' AND d.category_id = ?'
        params.push(parseInt(categoryId))
      }

      // 获取总数
      const [totalRows] = await db.query(
        'SELECT COUNT(*) as total FROM dishes WHERE shop_id = ?',
        [shopId]
      )

      // 获取分页数据
      query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?'
      params.push(parseInt(pageSize), parseInt(offset))

      const [dishes] = await db.query(query, params)

      res.json({
        code: 0,
        msg: 'success',
        data: {
          total: totalRows[0].total,
          list: dishes
        }
      })
    } catch (error) {
      console.error('获取菜品列表失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  },

  // 获取菜品分类
  async getCategories(req, res) {
    try {
      const shopId = req.merchant.shop_id

      const [categories] = await db.query(
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

  // 添加菜品
  async addDish(req, res) {
    const conn = await db.getConnection()
    try {
      await conn.beginTransaction()

      const shopId = req.merchant.shop_id
      const { name, categoryId, price, image, description = '', status = 1 } = req.body

      // 创建菜品
      const [result] = await conn.query(
        `INSERT INTO dishes (
          shop_id, category_id, name, description, 
          price, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [shopId, categoryId, name, description, price, status]
      )

      // 更新image_urls表中的resource_id
      if (image) {
        await conn.query(
          `UPDATE image_urls SET resource_id = ? WHERE url = ?`,
          [result.insertId.toString(), image]
        )
      }

      await conn.commit()

      res.json({
        code: 0,
        msg: '添加成功',
        data: {
          id: result.insertId
        }
      })
    } catch (error) {
      await conn.rollback()
      console.error('添加菜品失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    } finally {
      conn.release()
    }
  },

  // 更新菜品
  async updateDish(req, res) {
    const conn = await db.getConnection()
    try {
      await conn.beginTransaction()

      const shopId = req.merchant.shop_id
      const { id } = req.params
      const { name, categoryId, price, image, description, status } = req.body

      // 更新菜品基本信息
      const updates = []
      const params = []

      if (name) {
        updates.push('name = ?')
        params.push(name)
      }
      if (categoryId) {
        updates.push('category_id = ?')
        params.push(categoryId)
      }
      if (price) {
        updates.push('price = ?')
        params.push(price)
      }
      if (description !== undefined) {
        updates.push('description = ?')
        params.push(description)
      }
      if (status !== undefined) {
        updates.push('status = ?')
        params.push(status)
      }

      if (updates.length > 0) {
        params.push(id, shopId)
        await conn.query(
          `UPDATE dishes SET ${updates.join(', ')} WHERE id = ? AND shop_id = ?`,
          params
        )
      }

      // 更新图片URL
      if (image) {
        // 先删除旧的图片URL
        await conn.query(
          'DELETE FROM image_urls WHERE resource_type = ? AND resource_id = ?',
          ['dish', id.toString()]
        )
        // 添加新的图片URL
        await conn.query(
          `INSERT INTO image_urls (
            resource_type, resource_id, url, created_at
          ) VALUES ('dish', ?, ?, NOW())`,
          [id.toString(), image]
        )
      }

      await conn.commit()

      res.json({
        code: 0,
        msg: '更新成功',
        data: null
      })
    } catch (error) {
      await conn.rollback()
      console.error('更新菜品失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    } finally {
      conn.release()
    }
  },

  // 删除菜品
  async deleteDish(req, res) {
    try {
      const shopId = req.merchant.shop_id
      const { id } = req.params

      const [result] = await db.query(
        'DELETE FROM dishes WHERE id = ? AND shop_id = ?',
        [id, shopId]
      )

      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '菜品不存在',
          data: null
        })
      }

      res.json({
        code: 0,
        msg: '删除成功',
        data: null
      })
    } catch (error) {
      console.error('删除菜品失败:', error)
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      })
    }
  }
}

module.exports = dishController 