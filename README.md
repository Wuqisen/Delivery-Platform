# 外卖平台项目

- 一个基于 Vue 3 + Express + MySQL 的外卖平台系统。

## 项目结构

```
delivery-platform/
├── waimai-user/          # 用户端前端项目
├── waimai-server/        # 总体后端项目
├── waimai-merchant/      # 商家端前端项目
```

## 技术栈

- 前端：Vue 3 + Element Plus + Vue Router
- 后端：Express + MySQL
- 工具：Webpack、Babel、ESLint

## 功能特性

### 用户端：

- 商家列表浏览
- 商品浏览和购物车
- 订单管理
- 地址管理
- 支付功能

### 商家端：

- 商家登录
- 订单管理
- 商品管理
- 分类管理

## 本地开发

### 1.  克隆项目

```bash
git clone https://github.com/你的用户名/delivery-platform.git
cd delivery-platform
```

### 2. 安装依赖

```bash
# 用户端前端
cd waimai-user
npm install

# 用户端后端
cd ../waimai-server
npm install

# 商家端前端
cd ../waimai-merchant
npm install

# 商家端后端
cd ../waimai-merchant-server
npm install
```

### 3. 配置数据库

- 创建 MySQL 数据
- 导入 schema.sql 和 init-data.sql

### 4. 启动项目

```bash
# 用户端前端
cd waimai-user
npm run serve

# 用户端后端
cd ../waimai-server
npm run dev

# 商家端前端
cd ../waimai-merchant
npm run serve

# 商家端后端
cd ../waimai-merchant-server
npm run dev
```

## 公网访问

###  1. 前端部署步骤：

```bash
# 1. 进入前端项目目录
cd waimai-user

# 2. 构建生产环境代码
npm run build

# 3. 使用 serve 托管静态文件
serve -s dist -l 8080 --single

# 4. 新开终端，使用 cpolar 暴露前端服务
cpolar http 8080
```

### 2. 后端部署步骤：

```bash
# 1. 进入后端项目目录
cd waimai-server

# 2. 启动后端服务
npm run dev

# 3. 新开终端，使用 cpolar 暴露后端服务
cpolar http 3001
```

### 3. 配置文件修改：

#### a. 修改前端请求配置 (`waimai-user/src/utils/request.js`) 和生产环境:

```javascript
const request = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://你的后端cpolar域名/api'  // 替换为实际的后端域名
    : 'http://localhost:3001/api',
  timeout: 5000,
  withCredentials: true
})
```

#### b. 修改后端 CORS 配置 (`waimai-server/app.js`):

```javascript
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://你的前端cpolar域名',
    'https://你的前端cpolar域名'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400
}));
```

## 贡献指南

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT 