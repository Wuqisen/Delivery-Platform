const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const userController = {
  // 用户注册
  async register(req, res) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      const { phone, password, nickname } = req.body;

      // 参数验证
      if (!phone || !password || !nickname) {
        return res.status(400).json({
          code: 400,
          msg: '请填写完整注册信息',
          data: null
        });
      }

      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          code: 400,
          msg: '手机号格式不正确',
          data: null
        });
      }

      // 检查手机号是否已注册
      const [users] = await conn.query(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );

      if (users.length > 0) {
        return res.status(400).json({
          code: 400,
          msg: '该手机号已注册',
          data: null
        });
      }

      // 密码加密
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 创建用户
      const [result] = await conn.query(
        `INSERT INTO users (
          phone, password, nickname, created_at
        ) VALUES (?, ?, ?, NOW())`,
        [phone, hashedPassword, nickname]
      );

      await conn.commit();

      // 生成token
      const token = jwt.sign(
        { id: result.insertId },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        code: 0,
        msg: '注册成功',
        data: {
          token,
          userInfo: {
            id: result.insertId,
            phone,
            nickname
          }
        }
      });
    } catch (error) {
      await conn.rollback();
      console.error('用户注册失败:', error);
      res.status(500).json({
        code: 500,
        msg: error.message || '注册失败',
        data: null
      });
    } finally {
      conn.release();
    }
  },

  // 用户登录
  async login(req, res) {
    try {
      const { phone, password } = req.body;
      
      // 添加调试日志
      console.log('Login attempt:', { phone, password });

      // 查询用户
      const [users] = await db.query(
        'SELECT * FROM users WHERE phone = ?',
        [phone]
      );

      if (users.length === 0) {
        return res.status(400).json({
          code: 400,
          msg: '手机号或密码错误',
          data: null
        });
      }

      const user = users[0];

      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          code: 400,
          msg: '手机号或密码错误',
          data: null
        });
      }

      // 生成token
      const token = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        code: 0,
        msg: 'success',
        data: {
          token,
          userInfo: {
            id: user.id,
            phone: user.phone,
            nickname: user.nickname,
            avatar: user.avatar
          }
        }
      });
    } catch (error) {
      console.error('用户登录失败:', error);
      res.status(500).json({
        code: 500,
        msg: '服务器错误',
        data: null
      });
    }
  },

  // 获取用户信息
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      console.log('获取用户信息，用户ID:', userId);

      const [users] = await db.query(
        'SELECT id, phone, nickname, avatar FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '用户不存在',
          data: null
        });
      }

      res.json({
        code: 0,
        msg: 'success',
        data: users[0]
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({
        code: 500,
        msg: '获取用户信息失败',
        data: null
      });
    }
  },

  // 更新用户信息
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { nickname, avatar } = req.body;

      await db.execute(
        'UPDATE users SET nickname = ?, avatar = ? WHERE id = ?',
        [nickname, avatar, userId]
      );

      res.json({
        code: 0,
        msg: 'success',
        data: null
      });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.status(500).json({
        code: 500,
        msg: '更新用户信息失败',
        data: null
      });
    }
  },

  // 获取地址列表
  async getAddresses(req, res) {
    try {
      const userId = req.user.id;
      console.log('获取地址列表，用户ID:', userId);

      // 从数据库获取地址列表
      const [addresses] = await db.query(
        `SELECT 
          id, name, phone, address, is_default,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM addresses 
        WHERE user_id = ? 
        ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );

      console.log('查询到的地址列表:', addresses);

      res.json({
        code: 0,
        msg: 'success',
        data: addresses
      });
    } catch (error) {
      console.error('获取地址列表失败:', error);
      res.status(500).json({
        code: 500,
        msg: '获取地址列表失败',
        data: null
      });
    }
  },

  // 添加地址
  async addAddress(req, res) {
    try {
      const userId = req.user.id;
      const { name, phone, address, is_default = false } = req.body;
      console.log('添加地址，参数:', { userId, name, phone, address, is_default });

      // 参数验证
      if (!name || !phone || !address) {
        return res.status(400).json({
          code: 400,
          msg: '请填写完整地址信息',
          data: null
        });
      }

      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          code: 400,
          msg: '手机号格式不正确',
          data: null
        });
      }

      // 如果设为默认地址，先将其他地址设为非默认
      if (is_default) {
        await db.query(
          'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
          [userId]
        );
      }

      // 插入新地址
      const [result] = await db.query(
        `INSERT INTO addresses (
          user_id, name, phone, address, is_default, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, name, phone, address, is_default]
      );

      // 获取新插入的地址信息
      const [newAddress] = await db.query(
        `SELECT 
          id, name, phone, address, is_default,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM addresses 
        WHERE id = ?`,
        [result.insertId]
      );

      res.json({
        code: 0,
        msg: '添加成功',
        data: newAddress[0]
      });
    } catch (error) {
      console.error('添加地址失败:', error);
      res.status(500).json({
        code: 500,
        msg: '添加地址失败',
        data: null
      });
    }
  },

  // 更新地址
  async updateAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { name, phone, address, is_default = false } = req.body;

      // 参数验证
      if (!name || !phone || !address) {
        return res.status(400).json({
          code: 400,
          msg: '请填写完整地址信息',
          data: null
        });
      }

      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          code: 400,
          msg: '手机号格式不正确',
          data: null
        });
      }

      // 检查地址是否存在
      const [addresses] = await db.query(
        'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (addresses.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '地址不存在',
          data: null
        });
      }

      // 如���设为默认地址，先将其他地址设为非默认
      if (is_default) {
        await db.query(
          'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
          [userId]
        );
      }

      // 更新地址
      await db.query(
        `UPDATE addresses SET 
          name = ?, phone = ?, address = ?, is_default = ?
        WHERE id = ? AND user_id = ?`,
        [name, phone, address, is_default, id, userId]
      );

      // 获取更新后的地址信息
      const [updatedAddress] = await db.query(
        `SELECT 
          id, name, phone, address, is_default,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM addresses 
        WHERE id = ?`,
        [id]
      );

      res.json({
        code: 0,
        msg: '更新成功',
        data: updatedAddress[0]
      });
    } catch (error) {
      console.error('更新地址失败:', error);
      res.status(500).json({
        code: 500,
        msg: '更新地址失败',
        data: null
      });
    }
  },

  // 删除地址
  async deleteAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await db.execute(
        'DELETE FROM addresses WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      res.json({
        code: 0,
        msg: 'success',
        data: null
      });
    } catch (error) {
      console.error('删除地址失败:', error);
      res.status(500).json({
        code: 500,
        msg: '删除地址失败',
        data: null
      });
    }
  },

  // 设置默认地址
  async setDefaultAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await db.execute(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
        [userId]
      );

      await db.execute(
        'UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      res.json({
        code: 0,
        msg: 'success',
        data: null
      });
    } catch (error) {
      console.error('设置默认地址失败:', error);
      res.status(500).json({
        code: 500,
        msg: '设置默认地址失败',
        data: null
      });
    }
  }
};

module.exports = userController; 