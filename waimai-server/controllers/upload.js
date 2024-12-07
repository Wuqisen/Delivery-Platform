const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD_PATH } = require('../config');

// 确保基础上传目录存在
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// 确保各类型上传目录存在
const types = ['shops', 'dishes', 'avatars'];
types.forEach(type => {
  const typePath = path.join(UPLOAD_PATH, type);
  if (!fs.existsSync(typePath)) {
    fs.mkdirSync(typePath, { recursive: true });
  }
});

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据上传类型选择目录
    const type = req.params.type || 'others';
    const uploadPath = path.join(UPLOAD_PATH, type);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // 生成文件名: 时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只允许上传图片
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只能上传图片文件！'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  }
});

const uploadController = {
  // 上传单个图片
  async uploadImage(req, res) {
    try {
      upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            code: 400,
            msg: '文件上传失败：' + err.message,
            data: null
          });
        } else if (err) {
          return res.status(400).json({
            code: 400,
            msg: err.message,
            data: null
          });
        }

        // 文件上传成功
        const type = req.params.type || 'others';
        res.json({
          code: 0,
          msg: '上传成功',
          data: {
            url: `/uploads/${type}/${req.file.filename}`
          }
        });
      });
    } catch (error) {
      console.error('文件上传失败:', error);
      res.status(500).json({
        code: 500,
        msg: '文件上传失败',
        data: null
      });
    }
  },

  // 上传多个图片
  async uploadImages(req, res) {
    try {
      upload.array('images', 5)(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            code: 400,
            msg: '文件上传失败：' + err.message,
            data: null
          });
        } else if (err) {
          return res.status(400).json({
            code: 400,
            msg: err.message,
            data: null
          });
        }

        // 文件上传成功
        const urls = req.files.map(file => `/uploads/${file.filename}`);
        res.json({
          code: 0,
          msg: '上传成功',
          data: {
            urls
          }
        });
      });
    } catch (error) {
      console.error('文件上传失败:', error);
      res.status(500).json({
        code: 500,
        msg: '文件上传失败',
        data: null
      });
    }
  }
};

module.exports = uploadController; 