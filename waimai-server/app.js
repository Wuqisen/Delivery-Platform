const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS 配置
app.use(cors({
  origin: [
    'http://localhost:8080',  // Vue 开发服务器
    'http://localhost:8081',  // 商户端开发服务器
    'http://10005e36.r27.cpolar.top',  // 前端 cpolar 域名
    'https://10005e36.r27.cpolar.top',
    'http://57869f2b.r27.cpolar.top',  // 后端 cpolar 域名
    'https://57869f2b.r27.cpolar.top'
  ],
  credentials: true,  // 允许携带凭证
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400  // 预检请求缓存时间
}));

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/user', require('./routes/user'));
app.use('/api/shops', require('./routes/shop'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/merchant', require('./routes/merchant'));

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    msg: '服务器错误',
    data: null
  });
});

module.exports = app; 