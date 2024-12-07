<template>
  <div class="order-detail">
    <div class="nav-bar">
      <div class="back" @click="$router.back()">
        <span>&lt;</span>
      </div>
      <h1>订单详情</h1>
    </div>

    <template v-if="order">
      <!-- 订单状态 -->
      <div class="status-section">
        <div class="status">{{ getStatusText(order.status) }}</div>
        <div class="status-desc">{{ getStatusDesc(order.status) }}</div>
      </div>

      <!-- 配送信息 -->
      <div class="delivery-info">
        <div class="address">
          <h3>配送地址</h3>
          <div class="address-detail">
            <p>{{ order.address.name }} {{ order.address.phone }}</p>
            <p>{{ order.address.address }}</p>
          </div>
        </div>
      </div>

      <!-- 商家信息 -->
      <div class="shop-info">
        <img :src="order.shopImageUrl" alt="店铺图片">
        <span>{{ order.shopName }}</span>
      </div>

      <!-- 商品列表 -->
      <div class="goods-list">
        <div 
          v-for="item in order.items" 
          :key="item.id"
          class="goods-item"
        >
          <img :src="item.imageUrl" alt="商品图片">
          <div class="goods-info">
            <div class="name">{{ item.name }}</div>
            <div class="price-count">
              <span class="price">¥{{ item.price }}</span>
              <span class="count">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="order-info">
        <div class="info-item">
          <span>订单编号：</span>
          <span>{{ order.id }}</span>
        </div>
        <div class="info-item">
          <span>下单时间：</span>
          <span>{{ formatTime(order.createTime) }}</span>
        </div>
        <div class="info-item">
          <span>支付方式：</span>
          <span>{{ order.paymentMethod === 1 ? '在线支付' : '货到付款' }}</span>
        </div>
        <div class="info-item">
          <span>配送费：</span>
          <span>¥{{ order.deliveryFee }}</span>
        </div>
        <div class="info-item total">
          <span>实付金额：</span>
          <span class="price">¥{{ order.totalAmount }}</span>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="bottom-actions" v-if="showActions">
        <template v-if="order.status === 1">
          <button @click="cancelOrder">取消订单</button>
          <button @click="goToPay" class="primary">去支付</button>
        </template>
        <template v-if="order.status === 3">
          <button @click="confirmOrder" class="primary">确认收货</button>
        </template>
        <template v-if="order.status === 4">
          <button @click="goToRate" class="primary">去评价</button>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import { orderAPI } from '@/api/order'

export default {
  name: 'OrderDetail',
  data() {
    return {
      order: null
    }
  },
  computed: {
    showActions() {
      return [1, 3, 4].includes(this.order?.status)
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
    getStatusText(status) {
      const statusMap = {
        1: '待支付',
        2: '待配送',
        3: '配送中',
        4: '已完成',
        5: '已取消'
      }
      return statusMap[status] || '未知状态'
    },
    getStatusDesc(status) {
      const descMap = {
        1: '请尽快完成支付',
        2: '商家正在准备您的商品',
        3: '骑手正在配送中',
        4: '订单已完成',
        5: '订单已取消'
      }
      return descMap[status] || ''
    },
    formatTime(time) {
      return new Date(time).toLocaleString()
    },
    async cancelOrder() {
      if (!confirm('确定要取消订单吗？')) return
      
      try {
        await orderAPI.cancelOrder(this.order.id)
        this.loadOrder()
      } catch (error) {
        console.error('取消订单失败:', error)
      }
    },
    async confirmOrder() {
      if (!confirm('确认已收到商品吗？')) return
      
      try {
        await orderAPI.confirmOrder(this.order.id)
        this.loadOrder()
      } catch (error) {
        console.error('确认收货失败:', error)
      }
    },
    goToPay() {
      this.$router.push(`/payment/${this.order.id}`)
    },
    goToRate() {
      this.$router.push(`/order/${this.order.id}/rate`)
    }
  },
  created() {
    this.loadOrder()
  }
}
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
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

.status-section {
  background: #1989fa;
  color: white;
  padding: 20px 15px;
}

.status {
  font-size: 18px;
  margin-bottom: 5px;
}

.status-desc {
  font-size: 14px;
  opacity: 0.8;
}

.delivery-info,
.shop-info,
.goods-list,
.order-info {
  background: white;
  margin-top: 10px;
  padding: 15px;
}

.address h3 {
  font-size: 14px;
  margin-bottom: 10px;
}

.address-detail {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.shop-info {
  display: flex;
  align-items: center;
}

.shop-info img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 10px;
}

.goods-item {
  display: flex;
  margin-bottom: 15px;
}

.goods-item:last-child {
  margin-bottom: 0;
}

.goods-item img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 10px;
}

.goods-info {
  flex: 1;
}

.name {
  font-size: 14px;
  margin-bottom: 5px;
}

.price-count {
  color: #666;
  font-size: 12px;
}

.price {
  color: #ff4d4f;
  margin-right: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item.total {
  color: #333;
  font-weight: bold;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 10px 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

button {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  border: 1px solid #ddd;
  background: white;
}

button.primary {
  background: #1989fa;
  color: white;
  border: none;
}
</style> 