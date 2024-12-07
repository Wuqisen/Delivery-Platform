const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        msg: '未提供认证令牌',
        data: null
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        code: 401,
        msg: '认证令牌格式错误',
        data: null
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (req.originalUrl.includes('/merchant/')) {
      req.merchant = { id: decoded.id, shop_id: decoded.shop_id };
    } else {
      req.user = { id: decoded.id };
    }
    
    next();
  } catch (error) {
    console.error('Token验证失败:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        msg: '登录已过期，请重新登录',
        data: null
      });
    }
    return res.status(401).json({
      code: 401,
      msg: '无效的认证令牌',
      data: null
    });
  }
}; 