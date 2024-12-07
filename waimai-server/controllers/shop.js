const db = require('../config/db');

const shopController = {
  // 获取商家列表
  async getShops(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const { keyword } = req.query;
      const offset = (page - 1) * pageSize;

      let query = 'SELECT * FROM shops WHERE 1=1';
      const params = [];

      if (keyword) {
        query += ' AND name LIKE ?';
        params.push(`%${keyword}%`);
      }

      query += ' ORDER BY rating DESC, monthly_sales DESC';

      query += ' LIMIT ? OFFSET ?';
      params.push(pageSize, offset);

      const [shops] = await db.query(query, params);
      const [total] = await db.query('SELECT COUNT(*) as total FROM shops');

      res.json({
        code: 0,
        msg: 'success',
        data: {
          total: total[0].total,
          list: shops.map(shop => ({
            ...shop,
            imageUrl: shop.image ? `${req.protocol}://${req.get('host')}/uploads/shops/${shop.image}` : null
          }))
        }
      });
    } catch (error) {
      console.error('获取商家列表失败:', error);
      res.status(500).json({
        code: 500,
        msg: '获取商家列表失败',
        data: null
      });
    }
  },

  // 获取商家详情
  async getShopDetail(req, res) {
    try {
      const [shops] = await db.query(
        'SELECT * FROM shops WHERE id = ?',
        [req.params.id]
      );

      if (shops.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '商家不存在',
          data: null
        });
      }

      res.json({
        code: 0,
        msg: 'success',
        data: shops[0]
      });
    } catch (error) {
      console.error('获取商家详情失败:', error);
      res.status(500).json({
        code: 500,
        msg: '获取商家详情失败',
        data: null
      });
    }
  },

  // 获取商家分类
  async getShopCategories(req, res) {
    try {
      const { id } = req.params;
      const [categories] = await db.query(
        'SELECT * FROM shop_categories WHERE shop_id = ? ORDER BY sort_order ASC',
        [id]
      );

      res.json({
        code: 0,
        msg: 'success',
        data: categories
      });
    } catch (error) {
      console.error('获取商家分类失败:', error);
      res.status(500).json({
        code: 500,
        msg: '获取商家分类失败',
        data: null
      });
    }
  },

  // 获取商家菜品
  async getShopDishes(req, res) {
    try {
      const { id } = req.params;
      const { categoryId } = req.query;

      let query = 'SELECT * FROM dishes WHERE shop_id = ?';
      const params = [id];

      if (categoryId) {
        const catId = parseInt(categoryId);
        if (!isNaN(catId)) {
          query += ' AND category_id = ?';
          params.push(catId);
        }
      }

      query += ' ORDER BY sales DESC';

      const [dishes] = await db.query(query, params);

      if (dishes.length === 0) {
        console.log(`No dishes found for shop ${id} and category ${categoryId}`);
      }

      res.json({
        code: 0,
        msg: 'success',
        data: dishes.map(dish => ({
          ...dish,
          imageUrl: dish.image ? `${dish.image}` : null
        }))
      });
    } catch (error) {
      console.error('获取商家菜品失败:', error);
      res.status(500).json({
        code: 500,
        msg: '获取商家菜品失败',
        data: null
      });
    }
  }
};

module.exports = shopController;

// 添加错误处理
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
}); 