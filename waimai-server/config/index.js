const path = require('path')

module.exports = {
  JWT_SECRET: 'waimai_platform_secret_key',
  DB_HOST: 'localhost',
  DB_USER: 'root',
  DB_PASSWORD: '050513Wqs@',
  DB_DATABASE: 'waimai_db',
  UPLOAD_PATH: path.join(__dirname, '../uploads'),
  JWT_EXPIRE: '7d'
} 