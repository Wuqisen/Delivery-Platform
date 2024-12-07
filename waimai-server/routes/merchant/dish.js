const express = require('express')
const router = express.Router()
const dishController = require('../../controllers/merchant/dish')
const auth = require('../../middleware/auth')

// 获取菜品列表和分类
router.get('/', auth, dishController.getDishes)

// 添加菜品
router.post('/', auth, dishController.addDish)

// 更新菜品
router.put('/:id', auth, dishController.updateDish)

// 删除菜品
router.delete('/:id', auth, dishController.deleteDish)

module.exports = router 