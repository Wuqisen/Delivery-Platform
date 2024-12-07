<template>
  <div class="shop-detail">
    <!-- 商家信息 -->
    <div class="shop-info">
      <img :src="shop.imageUrl" :alt="shop.name" class="shop-image">
      <div class="shop-text">
        <h2>{{ shop.name }}</h2>
        <div class="shop-stats">
          <span>评分 {{ shop.rating }}</span>
          <span>月售 {{ shop.monthly_sales }}</span>
          <span>配送时间 {{ shop.delivery_time }}分钟</span>
        </div>
        <div class="delivery-info">
          <span>起送 ¥{{ shop.min_delivery }}</span>
          <span>配送费 ¥{{ shop.delivery_fee }}</span>
        </div>
        <div class="notice" v-if="shop.notice">
          公告：{{ shop.notice }}
        </div>
      </div>
    </div>

    <!-- 分类和菜品列表 -->
    <div class="menu-container">
      <!-- 分类列表 -->
      <div class="categories">
        <div 
          v-for="category in categories" 
          :key="category.id"
          :class="['category-item', { active: currentCategory === category.id }]"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </div>
      </div>

      <!-- 菜品列表 -->
      <div class="dishes">
        <div v-for="dish in dishes" :key="dish.id" class="dish-item">
          <img :src="dish.imageUrl" :alt="dish.name" class="dish-image">
          <div class="dish-info">
            <h3>{{ dish.name }}</h3>
            <p class="description">{{ dish.description }}</p>
            <div class="dish-bottom">
              <span class="price">¥{{ dish.price }}</span>
              <div class="quantity-control">
                <el-button 
                  v-if="getCartQuantity(dish.id) > 0"
                  size="small" 
                  circle 
                  @click="removeFromCart(dish)"
                >-</el-button>
                <span v-if="getCartQuantity(dish.id) > 0" class="quantity">
                  {{ getCartQuantity(dish.id) }}
                </span>
                <el-button 
                  size="small" 
                  type="primary" 
                  circle 
                  @click="addToCart(dish)"
                >+</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { shopAPI } from '../api/shop'
import { ElMessage } from 'element-plus'

export default {
  name: 'ShopDetail',
  setup() {
    const route = useRoute()
    const cart = inject('cartStore')
    
    const shop = ref({})
    const categories = ref([])
    const dishes = ref([])
    const currentCategory = ref(null)

    // 获取商家信息
    const loadShopInfo = async () => {
      try {
        const response = await shopAPI.getShopDetail(route.params.id)
        shop.value = response.data
      } catch (error) {
        console.error('Failed to load shop info:', error)
        ElMessage.error('获取商家信息失败')
      }
    }

    // 获取分类列表
    const loadCategories = async () => {
      try {
        const response = await shopAPI.getCategories(route.params.id)
        categories.value = response.data
        if (categories.value.length > 0) {
          currentCategory.value = categories.value[0].id
          loadDishes(currentCategory.value)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
        ElMessage.error('获取分类失败')
      }
    }

    // 获取菜品列表
    const loadDishes = async (categoryId) => {
      try {
        const response = await shopAPI.getDishes(route.params.id, { categoryId })
        dishes.value = response.data
      } catch (error) {
        console.error('Failed to load dishes:', error)
        ElMessage.error('获取菜品失败')
      }
    }

    // 选择分类
    const selectCategory = (categoryId) => {
      currentCategory.value = categoryId
      loadDishes(categoryId)
    }

    // 获取购物车中商品数量
    const getCartQuantity = (dishId) => {
      const item = cart.items.find(item => item.id === dishId)
      return item ? item.quantity : 0
    }

    // 添加到购物车
    const addToCart = (dish) => {
      const item = {
        id: dish.id,
        name: dish.name,
        price: dish.price,
        shopId: parseInt(route.params.id)
      }
      cart.addItem(item)
    }

    // 从购物车移除
    const removeFromCart = (dish) => {
      cart.removeItem(dish.id)
    }

    onMounted(() => {
      loadShopInfo()
      loadCategories()
    })

    return {
      shop,
      categories,
      dishes,
      currentCategory,
      selectCategory,
      getCartQuantity,
      addToCart,
      removeFromCart
    }
  }
}
</script>

<style scoped>
.shop-detail {
  padding-bottom: 50px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.shop-info {
  padding: 16px;
  background: white;
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.shop-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.shop-text {
  flex: 1;
}

.shop-stats {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.shop-stats span {
  margin-right: 16px;
}

.delivery-info {
  font-size: 14px;
  color: #666;
}

.delivery-info span {
  margin-right: 16px;
}

.notice {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.menu-container {
  display: flex;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.categories {
  width: 80px;
  border-right: 1px solid #f5f5f5;
  background: #fafafa;
}

.category-item {
  padding: 16px 8px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
}

.category-item.active {
  background: white;
  color: #1989fa;
  font-weight: bold;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 16px;
    background-color: #1989fa;
  }
}

.dishes {
  flex: 1;
  padding: 16px;
  background: white;
}

.dish-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child {
    border-bottom: none;
  }
}

.dish-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  &:hover {
    transform: scale(1.05);
  }
}

.dish-info {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dish-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.description {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dish-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  color: #f56c6c;
  font-size: 16px;
  font-weight: bold;
  &::before {
    content: '¥';
    font-size: 12px;
    margin-right: 2px;
  }
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  .el-button {
    padding: 6px;
    &.is-circle {
      padding: 6px;
    }
  }
}

.quantity {
  min-width: 24px;
  text-align: center;
  font-size: 14px;
  color: #333;
}
</style>
