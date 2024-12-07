const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '050513Wqs@'
  });

  try {
    // 读取 SQL 文件
    const schemaSQL = await fs.readFile(
      path.join(__dirname, 'database', 'schema.sql'),
      'utf8'
    );
    const initDataSQL = await fs.readFile(
      path.join(__dirname, 'database', 'init-data.sql'),
      'utf8'
    );

    // 执行数据库架构 SQL
    const schemaSQLs = schemaSQL.split(';').filter(sql => sql.trim());
    for (const sql of schemaSQLs) {
      if (sql.trim()) {
        await connection.query(sql);
      }
    }

    // 生成测试用户密码的哈希值
    const hashedPassword = await bcrypt.hash('123456', 10);
    const modifiedInitDataSQL = initDataSQL.replace(
      /\$2a\$10\$YourHashedPassword/g,
      hashedPassword
    );

    // 执行初始数据 SQL
    const initDataSQLs = modifiedInitDataSQL.split(';').filter(sql => sql.trim());
    for (const sql of initDataSQLs) {
      if (sql.trim()) {
        await connection.query(sql);
      }
    }

    console.log('数据库初始化成功！');
    console.log('测试用户账号：13800138000');
    console.log('测试用户密码：123456');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    await connection.end();
  }
}

initializeDatabase(); 