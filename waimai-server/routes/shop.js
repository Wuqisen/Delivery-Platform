const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');
const auth = require('../middleware/auth');

// 获取商家列表
router.get('/', shopController.getShops);

// 获取商家详情
router.get('/:id', shopController.getShopDetail);

// 获取商家分类
router.get('/:id/categories', shopController.getShopCategories);

// 获取商家菜品
router.get('/:id/dishes', shopController.getShopDishes);

module.exports = router; 