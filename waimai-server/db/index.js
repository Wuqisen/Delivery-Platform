const mysql = require('mysql2')
const config = require('../config')

const pool = mysql.createPool({
  host: config.DB_HOST || 'localhost',
  user: config.DB_USER || 'root',
  password: config.DB_PASSWORD || '050513Wqs@',
  database: config.DB_DATABASE || 'waimai_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// 测试连接
pool.getConnection((err, connection) => {
  if (err) {
    console.error('数据库连接失败:', err)
    return
  }
  console.log('数据库连接成功')
  connection.release()
})

// 确保数据库连接正确关闭
process.on('SIGINT', () => {
  connection.end();
  process.exit();
});

module.exports = pool.promise() 