const mysql = require('mysql2/promise');
const config = require('./index');

const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
pool.getConnection()
  .then(conn => {
    console.log('数据库连接成功');
    conn.release();
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

module.exports = pool; 