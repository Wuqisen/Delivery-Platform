<template>
  <div class="shop-container">
    <div class="shop-header">
      <img :src="getImageUrl(shop.image)" :alt="shop.name" class="shop-image">
      <div class="shop-info">
        <h2>{{ shop.name }}</h2>
        <div class="shop-stats">
          <el-rate v-model="shop.rating" disabled />
          <span class="sales">月售 {{ shop.monthly_sales }}单</span>
        </div>
        <div class="delivery-info">
          <div class="delivery-time">
            <el-icon><Timer /></el-icon>
            <span>{{ shop.delivery_time }}分钟</span>
          </div>
          <div class="price-info">
            <span>起送 ¥{{ shop.min_delivery }}</span>
            <span>配送费 ¥{{ shop.delivery_fee }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="menu-container">
      <el-tabs v-model="activeCategory" @tab-click="handleCategoryChange">
        <el-tab-pane 
          v-for="category in categories" 
          :key="category.id"
          :label="category.name"
          :name="category.id"
        >
          <div class="dish-list">
            <dish-card
              v-for="dish in dishes[category.id]"
              :key="dish.id"
              :dish="dish"
              @add-to-cart="handleAddToCart"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShopDetail'
}
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { shopAPI } from '../api/shop'
import { ElMessage } from 'element-plus'
import { cartStore } from '../store/cart'
import { Timer } from '@element-plus/icons-vue'
import DishCard from '../components/DishCard.vue'

const route = useRoute()
const shop = ref({})
const categories = ref([])
const dishes = ref({})
const activeCategory = ref('')

// 获取商家信息
const loadShopInfo = async () => {
  try {
    const shopId = route.params.id
    const [shopInfo, categoryList] = await Promise.all([
      shopAPI.getShopDetail(shopId),
      shopAPI.getCategories(shopId)
    ])
    
    shop.value = shopInfo.data
    categories.value = categoryList.data
    
    if (categories.value.length > 0) {
      activeCategory.value = categories.value[0].id
      await loadDishes(categories.value[0].id)
    }
  } catch (error) {
    console.error('加载商家信息失败:', error)
    ElMessage.error('加载商家信息失败')
  }
}

// 加载菜品
const loadDishes = async (categoryId) => {
  try {
    if (!dishes.value[categoryId]) {
      const response = await shopAPI.getDishes(route.params.id, {
        categoryId
      })
      dishes.value[categoryId] = response.data
    }
  } catch (error) {
    console.error('加载菜品失败:', error)
    ElMessage.error('加载菜品失败')
  }
}

// 添加到购物车
const handleAddToCart = (dish) => {
  cartStore.addItem({
    ...dish,
    shop_id: route.params.id,
    shop_name: shop.value.name
  })
  ElMessage({
    message: `已添加 ${dish.name} 到购物车`,
    type: 'success',
    duration: 2000
  })
}

// 处理分类变化
const handleCategoryChange = (tab) => {
  loadDishes(tab.paneName)
}

// 挂载时加载数据
onMounted(() => {
  loadShopInfo()
})

// 添加处理图片URL的方法
const getImageUrl = (url) => {
  // 如果是完整的URL（以http或https开头），直接返回
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url
  }
  // 否则返回原始路径
  return url
}
</script>

<style scoped>
.shop-container {
  padding-bottom: 60px;
}

.shop-header {
  padding: 16px;
  background: white;
  display: flex;
  gap: 16px;
}

.shop-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.shop-info {
  flex: 1;
}

.shop-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}

.sales {
  color: #666;
  font-size: 14px;
}

.delivery-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 14px;
  margin-top: 8px;
}

.delivery-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-info {
  display: flex;
  gap: 12px;
}

.menu-container {
  margin-top: 12px;
  background: white;
  padding: 16px;
}

.menu-categories {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-item {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item.active {
  border-color: #409eff;
  color: #409eff;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-section {
  margin-bottom: 20px;
}

.category-section h3 {
  margin: 10px 0;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.dish-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px;
}
</style> 