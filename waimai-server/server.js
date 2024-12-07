const app = require('./app')
const db = require('./db')

const PORT = process.env.PORT || 3001

// 优雅关闭服务器
function gracefulShutdown() {
  console.log('正在关闭服务器...')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
}

// 创建 HTTP 服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})

// 处理进程信号
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err)
  gracefulShutdown()
})

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
}) 