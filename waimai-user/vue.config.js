const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 修改这里，使用绝对路径
  publicPath: '/',  // 改为绝对路径
  outputDir: 'dist',
  assetsDir: 'static',
  
  // 开发服务器配置
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
