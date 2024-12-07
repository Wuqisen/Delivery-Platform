const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UPLOAD_PATH } = require('../config');
const db = require('../config/db');

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
      upload.single('image')(req, res, async function (err) {
        if (err) {
          return res.status(400).json({
            code: 400,
            msg: err.message,
            data: null
          });
        }

        try {
          // 生成完整的图片URL
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          const imageUrl = `${baseUrl}/uploads/${req.params.type}/${req.file.filename}`;
          
          // 将URL保存到image_urls表
          const [result] = await db.query(
            `INSERT INTO image_urls (
              resource_type, resource_id, url, created_at
            ) VALUES (?, ?, ?, NOW())`,
            [req.params.type, '0', imageUrl]  // resource_id暂时用0，后续会更新
          );

          res.json({
            code: 0,
            msg: '上传成功',
            data: {
              url: imageUrl,
              id: result.insertId
            }
          });
        } catch (error) {
          console.error('保存图片URL失败:', error);
          res.status(500).json({
            code: 500,
            msg: '保存图片URL失败',
            data: null
          });
        }
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
      upload.array('images', 5)(req, res, async function (err) {
        if (err) {
          return res.status(400).json({
            code: 400,
            msg: err.message,
            data: null
          });
        }

        try {
          const baseUrl = `${req.protocol}://${req.get('host')}`;
          const urls = [];
          
          // 保存每个图片的URL到数据库
          for (const file of req.files) {
            const imageUrl = `${baseUrl}/uploads/${req.params.type}/${file.filename}`;
            const [result] = await db.query(
              `INSERT INTO image_urls (
                resource_type, resource_id, url, created_at
              ) VALUES (?, ?, ?, NOW())`,
              [req.params.type, '0', imageUrl]
            );
            urls.push({
              url: imageUrl,
              id: result.insertId
            });
          }

          res.json({
            code: 0,
            msg: '上传成功',
            data: { urls }
          });
        } catch (error) {
          console.error('保存图片URL失败:', error);
          res.status(500).json({
            code: 500,
            msg: '保存图片URL失败',
            data: null
          });
        }
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
