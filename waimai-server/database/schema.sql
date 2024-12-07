-- 创建数据库
CREATE DATABASE IF NOT EXISTS waimai_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE waimai_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(11) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  avatar VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 地址表
CREATE TABLE addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(11) NOT NULL,
  address TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 商家表
CREATE TABLE shops (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  image VARCHAR(200) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 5.0,
  monthly_sales INT DEFAULT 0,
  delivery_time INT DEFAULT 30,
  delivery_fee DECIMAL(10,2) NOT NULL,
  min_delivery DECIMAL(10,2) NOT NULL,
  notice TEXT,
  status TINYINT DEFAULT 1 COMMENT '1:营业中 2:休息中',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商家分类表
CREATE TABLE shop_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shop_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- 菜品表
CREATE TABLE dishes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shop_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  image VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sales INT DEFAULT 0,
  status TINYINT DEFAULT 1 COMMENT '1:上架 2:下架',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id),
  FOREIGN KEY (category_id) REFERENCES shop_categories(id)
);

-- 订单表
CREATE TABLE orders (
  id VARCHAR(20) PRIMARY KEY,
  user_id INT NOT NULL,
  shop_id INT NOT NULL,
  address_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1:待支付 2:待配送 3:配送中 4:已完成 5:已取消',
  payment_method TINYINT NOT NULL COMMENT '1:在线支付 2:货到付款',
  remark TEXT,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pay_time TIMESTAMP NULL,
  delivery_time TIMESTAMP NULL,
  complete_time TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shop_id) REFERENCES shops(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- 订单商品表
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(20) NOT NULL,
  dish_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (dish_id) REFERENCES dishes(id)
);

-- 订单评价表
CREATE TABLE order_ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(20) NOT NULL,
  user_id INT NOT NULL,
  shop_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  images TEXT COMMENT 'JSON格式存储图片URL数组',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- 支付记录表
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method TINYINT NOT NULL COMMENT '1:微信 2:支付宝',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1:待支付 2:已支付 3:已退款',
  transaction_id VARCHAR(50),
  pay_time TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 添加索引
CREATE INDEX idx_user_phone ON users(phone);
CREATE INDEX idx_shop_rating ON shops(rating);
CREATE INDEX idx_shop_sales ON shops(monthly_sales);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_shop ON orders(shop_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_create_time ON orders(create_time);

-- 添加唯一索引
ALTER TABLE shops
ADD UNIQUE INDEX idx_shop_name (name);
  