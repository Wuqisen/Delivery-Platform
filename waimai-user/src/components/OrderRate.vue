<template>
  <div class="order-rate">
    <div class="nav-bar">
      <div class="back" @click="$router.back()">
        <span>&lt;</span>
      </div>
      <h1>评价订单</h1>
    </div>

    <!-- 商家信息 -->
    <div class="shop-info">
      <img :src="order?.shopImageUrl" alt="店铺图片">
      <span>{{ order?.shopName }}</span>
    </div>

    <!-- 评分 -->
    <div class="rating-section">
      <div class="stars">
        <span 
          v-for="n in 5" 
          :key="n"
          :class="['star', { active: n <= rating }]"
          @click="rating = n"
        >★</span>
      </div>
      <div class="rating-text">{{ getRatingText() }}</div>
    </div>

    <!-- 评价内容 -->
    <div class="comment-section">
      <textarea 
        v-model="comment"
        placeholder="请输入评价内容（可选）"
        rows="4"
      ></textarea>
    </div>

    <!-- 图片上传 -->
    <div class="upload-section">
      <h3>上传图片（可选）</h3>
      <image-upload
        v-model="images"
        type="rating"
        :multiple="true"
        :maxCount="6"
      />
    </div>

    <!-- 提交按钮 -->
    <div class="submit-section">
      <button 
        :disabled="!rating || submitting" 
        @click="submitRating"
      >
        提交评价
      </button>
    </div>
  </div>
</template>

<script>
import { orderAPI } from '@/api/order'
import ImageUpload from '@/components/common/ImageUpload.vue'

export default {
  name: 'OrderRate',
  components: {
    ImageUpload
  },
  data() {
    return {
      order: null,
      rating: 0,
      comment: '',
      images: [],
      submitting: false
    }
  },
  methods: {
    async loadOrder() {
      try {
        const orderId = this.$route.params.id
        const { data } = await orderAPI.getOrderDetail(orderId)
        this.order = data
      } catch (error) {
        console.error('获取订单详情失败:', error)
      }
    },
    getRatingText() {
      const texts = ['', '很差', '一般', '还行', '不错', '很好']
      return texts[this.rating] || ''
    },
    async submitRating() {
      if (!this.rating) {
        alert('请选择评分')
        return
      }

      try {
        this.submitting = true
        await orderAPI.rateOrder(this.order.id, {
          rating: this.rating,
          comment: this.comment,
          images: this.images
        })
        
        this.$router.replace('/my-orders')
      } catch (error) {
        console.error('提交评价失败:', error)
        alert('提交评价失败，请重试')
      } finally {
        this.submitting = false
      }
    }
  },
  created() {
    this.loadOrder()
  }
}
</script>

<style scoped>
.order-rate {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.nav-bar {
  background: white;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.back {
  padding: 10px;
  margin-left: -10px;
}

.nav-bar h1 {
  flex: 1;
  text-align: center;
  font-size: 16px;
  margin: 0;
}

.shop-info {
  background: white;
  padding: 15px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.shop-info img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 10px;
}

.rating-section {
  background: white;
  padding: 20px;
  text-align: center;
  margin-bottom: 10px;
}

.stars {
  font-size: 40px;
  color: #ddd;
}

.star {
  margin: 0 5px;
  cursor: pointer;
}

.star.active {
  color: #ffb800;
}

.rating-text {
  margin-top: 10px;
  color: #666;
}

.comment-section {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  resize: none;
}

.upload-section {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
}

.upload-section h3 {
  font-size: 14px;
  margin-bottom: 10px;
  color: #666;
}

.submit-section {
  padding: 20px 15px;
}

button {
  width: 100%;
  padding: 12px;
  background: #1989fa;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
