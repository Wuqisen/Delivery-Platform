<template>
  <div class="home">
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索商家"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="shop-list">
      <div v-if="shops.length > 0" class="shop-grid">
        <div
          v-for="shop in shops"
          :key="shop.id"
          class="shop-item"
          @click="goToShop(shop.id)"
        >
          <div class="shop-image">
            <img :src="`/images/shops/${shop.image}`" :alt="shop.name">
          </div>
          <div class="shop-info">
            <h3 class="shop-name">{{ shop.name }}</h3>
            <div class="shop-rating">
              <el-rate
                v-model="shop.rating"
                disabled
                text-color="#ff9900"
                score-template="{value}"
              />
              <span class="monthly-sales">月售 {{ shop.monthly_sales }}单</span>
            </div>
            <div class="delivery-info">
              <div class="delivery-time">
                <el-icon><Timer /></el-icon>
                <span>{{ shop.delivery_time }}分钟</span>
              </div>
              <div class="delivery-distance">
                <el-icon><Location /></el-icon>
                <span>500m</span>
              </div>
            </div>
            <div class="price-info">
              <div class="min-price">
                起送 ¥{{ shop.min_delivery }}
              </div>
              <div class="delivery-fee">
                配送费 ¥{{ shop.delivery_fee }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无商家" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { shopAPI } from '../api/shop'
import { Search, Timer, Location } from '@element-plus/icons-vue'

export default {
  name: 'HomePage',
  components: {
    Search,
    Timer,
    Location
  },
  setup() {
    const router = useRouter()
    const shops = ref([])
    const searchKeyword = ref('')
    const loading = ref(false)

    const loadShops = async () => {
      try {
        loading.value = true
        const response = await shopAPI.getShops({
          keyword: searchKeyword.value
        })
        shops.value = response.data.list
      } catch (error) {
        console.error('加载商家列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    const goToShop = (shopId) => {
      router.push(`/shop/${shopId}`)
    }

    onMounted(() => {
      loadShops()
    })

    return {
      shops,
      searchKeyword,
      goToShop
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-input {
  border-radius: 20px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.shop-list {
  padding: 16px;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.shop-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.shop-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.shop-image {
  position: relative;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.shop-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shop-info {
  padding: 12px;
}

.shop-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shop-rating {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.monthly-sales {
  margin-left: 8px;
  font-size: 12px;
  color: #666;
}

.delivery-info {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.delivery-time,
.delivery-distance {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.min-price,
.delivery-fee {
  display: flex;
  align-items: center;
}

:deep(.el-rate) {
  height: 16px;
  line-height: 1;
}

:deep(.el-rate__icon) {
  font-size: 16px;
  margin-right: 2px;
}

:deep(.el-icon) {
  font-size: 14px;
}
</style> 