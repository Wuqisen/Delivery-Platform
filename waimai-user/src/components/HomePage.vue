<template>
  <div class="home">
    <div class="search-bar">
      <input 
        type="text" 
        placeholder="搜索商家和菜品" 
        v-model="searchTerm"
      />
    </div>

    <div class="ads-banner">
      <img src="/images/banner/banner1.jpg" alt="广告横幅">
    </div>

    <div class="category-section">
      <div v-for="category in categories" :key="category.id" class="category-item">
        <img :src="category.iconUrl" :alt="category.name">
        <span>{{ category.name }}</span>
      </div>
    </div>

    <div class="recommended-shops">
      <h2 class="section-title">推荐商家</h2>
      <div class="shop-list">
        <div v-for="shop in shops" :key="shop.id" class="shop-item" @click="goToShop(shop.id)">
          <img :src="shop.imageUrl" alt="店铺图片" class="shop-image">
          <div class="shop-info">
            <h3>{{ shop.name }}</h3>
            <div class="shop-rating">
              <span class="rating">★ {{ shop.rating }}</span>
              <span class="monthly-sales">月售 {{ shop.monthlySales }}</span>
            </div>
            <div class="delivery-info">
              <span>起送 ¥{{ shop.minDelivery }}</span>
              <span>配送 ¥{{ shop.deliveryFee }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { shopAPI } from '../api/shop'

export default {
  name: 'HomePage',
  data() {
    return {
      searchTerm: '',
      categories: [],
      shops: [],
      loading: false,
      shopAPI
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const { data } = await shopAPI.getCategories()
        this.categories = data
      } catch (error) {
        console.error('获取分类失败:', error)
      }
    },
    async fetchShops() {
      try {
        this.loading = true
        const params = {
          keyword: this.searchTerm,
          page: 1,
          pageSize: 10
        }
        const { data } = await shopAPI.getShops(params)
        this.shops = data.list
      } catch (error) {
        console.error('获取商家列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    goToShop(shopId) {
      this.$router.push(`/shop/${shopId}`)
    }
  },
  created() {
    this.fetchCategories()
    this.fetchShops()
  },
  watch: {
    searchTerm: {
      handler: function(val) {
        if (val) {
          this.fetchShops()
        }
      },
      debounce: 300
    }
  }
}
</script>

<style scoped>
.home {
  padding: 15px;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  padding: 10px;
  margin: -15px -15px 15px -15px;
}

.search-bar input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  background-color: #f5f5f5;
}

.ads-banner {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.ads-banner img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.category-section {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.category-item {
  text-align: center;
}

.category-item img {
  width: 40px;
  height: 40px;
  margin-bottom: 5px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 15px;
  font-weight: bold;
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.shop-item {
  display: flex;
  background: white;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
}

.shop-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.shop-info {
  flex: 1;
}

.shop-info h3 {
  margin-bottom: 8px;
  font-size: 16px;
}

.shop-rating {
  color: #666;
  font-size: 13px;
  margin-bottom: 8px;
}

.rating {
  color: #ff9500;
  margin-right: 10px;
}

.delivery-info {
  font-size: 12px;
  color: #999;
}

.delivery-info span {
  margin-right: 10px;
}
</style>
  