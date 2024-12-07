-- 按照正确的顺序删除数据（先删除有外键引用的表）
SET FOREIGN_KEY_CHECKS = 0;  -- 临时禁用外键检查

-- 清空所有表数据
TRUNCATE TABLE payments;
TRUNCATE TABLE order_ratings;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE dishes;
TRUNCATE TABLE shop_categories;
TRUNCATE TABLE addresses;
TRUNCATE TABLE shops;

-- 重置自增ID
ALTER TABLE shops AUTO_INCREMENT = 1;
ALTER TABLE shop_categories AUTO_INCREMENT = 1;
ALTER TABLE dishes AUTO_INCREMENT = 1;
ALTER TABLE addresses AUTO_INCREMENT = 1;
ALTER TABLE payments AUTO_INCREMENT = 1;
ALTER TABLE order_ratings AUTO_INCREMENT = 1;
ALTER TABLE order_items AUTO_INCREMENT = 1;

-- 删除重复的商家数据
DELETE s1 FROM shops s1
INNER JOIN shops s2
WHERE s1.id > s2.id 
AND s1.name = s2.name;

SET FOREIGN_KEY_CHECKS = 1;  -- 重新启用外键检查