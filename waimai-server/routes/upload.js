const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload');
const auth = require('../middleware/auth');

// 上传单个图片（带类型）
router.post('/:type/image', auth, uploadController.uploadImage);

// 上传多个图片（带类型）
router.post('/:type/images', auth, uploadController.uploadImages);

module.exports = router; 