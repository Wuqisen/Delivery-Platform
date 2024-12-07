-- 插入测试商户账号(关联已有的商家)
INSERT INTO merchants (shop_id, username, password, phone, created_at) VALUES
(1, 'chuanwei', '$2a$10$zYwYGpfv0c9NvOYRtDZ9UOYoNqYrpJ3e3bkJoVLAn7W6F0EOQgkaO', '13800138001', NOW()),
(2, 'yueshi', '$2a$10$zYwYGpfv0c9NvOYRtDZ9UOYoNqYrpJ3e3bkJoVLAn7W6F0EOQgkaO', '13800138002', NOW()),
(3, 'sushi', '$2a$10$zYwYGpfv0c9NvOYRtDZ9UOYoNqYrpJ3e3bkJoVLAn7W6F0EOQgkaO', '13800138003', NOW()),
(4, 'yimian', '$2a$10$zYwYGpfv0c9NvOYRtDZ9UOYoNqYrpJ3e3bkJoVLAn7W6F0EOQgkaO', '13800138004', NOW()),
(5, 'hanshi', '$2a$10$zYwYGpfv0c9NvOYRtDZ9UOYoNqYrpJ3e3bkJoVLAn7W6F0EOQgkaO', '13800138005', NOW()),
(6, 'laobj', '$2a$10$zYwYGpfv0c9NvOYRtDZ9UOYoNqYrpJ3e3bkJoVLAn7W6F0EOQgkaO', '13800138006', NOW()),
(7, 'huoguo', '$2a$10$zYwYGpfv0c9NvOYRtDZ9UOYoNqYrpJ3e3bkJoVLAn7W6F0EOQgkaO', '13800138007', NOW()),
(8, 'hangbang', '$2a$10$zYwYGpfv0c9NvOYRtDZ9UOYoNqYrpJ3e3bkJoVLAn7W6F0EOQgkaO', '13800138008', NOW());

-- 插入测试骑手
INSERT INTO riders (name, phone, id_card, status, rating, total_orders, created_at) VALUES
('张三', '13900138001', '110101199001011234', 1, 4.8, 156, NOW()),
('李四', '13900138002', '110101199001011235', 1, 4.9, 203, NOW()),
('王五', '13900138003', '110101199001011236', 1, 4.7, 178, NOW()),
('赵六', '13900138004', '110101199001011237', 1, 4.8, 189, NOW()),
('孙七', '13900138005', '110101199001011238', 2, 4.6, 167, NOW()),
('周八', '13900138006', '110101199001011239', 1, 4.9, 245, NOW()),
('吴九', '13900138007', '110101199001011240', 3, 4.7, 198, NOW()),
('郑十', '13900138008', '110101199001011241', 1, 4.8, 176, NOW());

-- 插入骑手认证信息
INSERT INTO rider_verifications (rider_id, id_card_front, id_card_back, health_cert, status, created_at) VALUES
(1, 'front1.jpg', 'back1.jpg', 'health1.jpg', 2, NOW()),
(2, 'front2.jpg', 'back2.jpg', 'health2.jpg', 2, NOW()),
(3, 'front3.jpg', 'back3.jpg', 'health3.jpg', 2, NOW()),
(4, 'front4.jpg', 'back4.jpg', 'health4.jpg', 2, NOW()),
(5, 'front5.jpg', 'back5.jpg', 'health5.jpg', 2, NOW()),
(6, 'front6.jpg', 'back6.jpg', 'health6.jpg', 2, NOW()),
(7, 'front7.jpg', 'back7.jpg', 'health7.jpg', 2, NOW()),
(8, 'front8.jpg', 'back8.jpg', 'health8.jpg', 2, NOW());

-- 更新订单表添加商户确认状态和预计送达时间
UPDATE orders SET 
merchant_confirmed = 1,
estimated_delivery_time = DATE_ADD(create_time, INTERVAL 30 MINUTE)
WHERE status >= 2;

-- 插入配送订单(关联已有订单和骑手)
INSERT INTO order_deliveries (order_id, rider_id, status, pickup_time, delivery_time, created_at)
SELECT 
  o.id,
  FLOOR(1 + RAND() * 8) as rider_id,
  CASE 
    WHEN o.status = 3 THEN 1
    WHEN o.status = 4 THEN 2
    WHEN o.status = 5 THEN 3
    ELSE 1
  END as status,
  CASE 
    WHEN o.status >= 4 THEN DATE_ADD(o.create_time, INTERVAL 10 MINUTE)
    ELSE NULL
  END as pickup_time,
  CASE 
    WHEN o.status = 5 THEN DATE_ADD(o.create_time, INTERVAL 30 MINUTE)
    ELSE NULL
  END as delivery_time,
  o.create_time
FROM orders o
WHERE o.status >= 3;

-- 插入骑手位置记录(随机生成测试数据)
INSERT INTO rider_locations (rider_id, latitude, longitude, updated_at)
SELECT 
  id as rider_id,
  39.900000 + RAND() * 0.100000 as latitude,
  116.300000 + RAND() * 0.100000 as longitude,
  NOW() as updated_at
FROM riders
WHERE status = 2; 