-- 商户表
CREATE TABLE merchants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shop_id INT NOT NULL UNIQUE,  -- 关联的店铺ID
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  phone VARCHAR(11) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- 骑手表
CREATE TABLE IF NOT EXISTS riders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(11) NOT NULL UNIQUE,
  id_card VARCHAR(18) NOT NULL UNIQUE,  -- 身份证号
  status TINYINT DEFAULT 1 COMMENT '1:空闲 2:配送中 3:休息',
  rating DECIMAL(2,1) DEFAULT 5.0,      -- 评分
  total_orders INT DEFAULT 0,           -- 总完成订单数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 骑手认证信息表
CREATE TABLE rider_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rider_id INT NOT NULL,
  id_card_front VARCHAR(200) NOT NULL,  -- 身份证正面照
  id_card_back VARCHAR(200) NOT NULL,   -- 身份证背面照
  health_cert VARCHAR(200) NOT NULL,    -- 健康证
  status TINYINT DEFAULT 1 COMMENT '1:待审核 2:已通过 3:未通过',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rider_id) REFERENCES riders(id)
);

-- 订单配送表
CREATE TABLE IF NOT EXISTS order_deliveries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(20) NOT NULL,
  rider_id INT NOT NULL,
  status TINYINT DEFAULT 1 COMMENT '1:待取货 2:配送中 3:已送达 4:异常',
  pickup_time TIMESTAMP NULL,           -- 取货时间
  delivery_time TIMESTAMP NULL,         -- 送达时间
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (rider_id) REFERENCES riders(id)
);

-- 骑手位置记录表
CREATE TABLE rider_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rider_id INT NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rider_id) REFERENCES riders(id)
);

-- 添加订单表的新字段
ALTER TABLE orders 
ADD COLUMN merchant_confirmed TINYINT DEFAULT 0 COMMENT '0:未确认 1:已确认' AFTER status,
ADD COLUMN estimated_delivery_time TIMESTAMP NULL AFTER delivery_time;

-- 添加索引
CREATE INDEX idx_merchant_shop ON merchants(shop_id);
CREATE INDEX idx_order_delivery_status ON order_deliveries(status);
CREATE INDEX idx_rider_status ON riders(status);
CREATE INDEX idx_rider_rating ON riders(rating); 