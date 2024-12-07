-- 插入测试用户
INSERT INTO users (phone, password, nickname) VALUES
('13800138000', '123456', '测试用户')
ON DUPLICATE KEY UPDATE
password = '123456',
nickname = '测试用户';

-- 插入测试地址
INSERT INTO addresses (user_id, name, phone, address, is_default) VALUES
(1, '张三', '13800138000', '北京市朝阳区某某街道1号', 1);

-- 插入测试订单
INSERT INTO orders (
  id, user_id, shop_id, address_id, 
  total_amount, delivery_fee, status, 
  payment_method, create_time
) VALUES 
('202403010001', 1, 6, 1, 88.00, 5.00, 2, 1, NOW()),
('202403010002', 1, 6, 1, 66.00, 5.00, 3, 1, NOW());

-- 插入订单商品
INSERT INTO order_items (order_id, dish_id, quantity, price) VALUES 
('202403010001', 68, 2, 24.00),
('202403010001', 69, 1, 32.00),
('202403010002', 70, 2, 12.00),
('202403010002', 71, 2, 10.00);

-- 插入测试骑手数据
INSERT INTO riders (name, phone, id_card, status, rating, total_orders) VALUES 
('张三', '13900138001', '110101199001011234', 1, 4.8, 156),
('李四', '13900138002', '110101199001011235', 1, 4.9, 203),
('王五', '13900138003', '110101199001011236', 1, 4.7, 178); 