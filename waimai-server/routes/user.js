const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const auth = require('../middleware/auth');

// 用户登录注册（不需要认证）
router.post('/login', userController.login);
router.post('/register', userController.register);

// 需要认证的接口
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// 地址相关接口
router.get('/addresses', auth, userController.getAddresses);
router.post('/addresses', auth, userController.addAddress);
router.put('/addresses/:id', auth, userController.updateAddress);
router.delete('/addresses/:id', auth, userController.deleteAddress);
router.post('/addresses/:id/default', auth, userController.setDefaultAddress);

module.exports = router; 