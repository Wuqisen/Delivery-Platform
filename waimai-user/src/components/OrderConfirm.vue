<template>
  <div class="order-confirm">
    <div class="nav-bar">
      <div class="back" @click="router.back()">
        <span>&lt;</span>
      </div>
      <h1>确认订单</h1>
    </div>

    <!-- 地址选择 -->
    <div class="section address" @click="goToAddress">
      <div v-if="selectedAddress" class="address-info">
        <div class="user-info">
          <span class="name">{{ selectedAddress.name }}</span>
          <span class="phone">{{ selectedAddress.phone }}</span>
        </div>
        <div class="detail">{{ selectedAddress.address }}</div>
      </div>
      <div v-else class="no-address">
        请选择收货地址 >
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="section items">
      <div class="shop-name">{{ shopInfo.name }}</div>
      <div class="item" v-for="item in cartStore.items" :key="item.id">
        <img :src="item.image" class="item-image" alt="商品图片">
        <div class="item-info">
          <div class="name">{{ item.name }}</div>
          <div class="price-count">
            <span class="price">¥{{ item.price }}</span>
            <span class="count">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 配送费 -->
    <div class="section delivery">
      <div class="fee-item">
        <span>配送费</span>
        <span>¥{{ shopInfo.delivery_fee || 0 }}</span>
      </div>
    </div>

    <!-- 备注 -->
    <div class="section remark">
      <textarea v-model="remark" placeholder="请输入备注信息"></textarea>
    </div>

    <!-- 底部结算栏 -->
    <div class="bottom-bar">
      <div class="total">
        合计: <span class="price">¥{{ totalAmount }}</span>
      </div>
      <button class="submit-btn" @click="submitOrder" :disabled="!selectedAddress">
        提交订单
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/config'

export default {
  name: 'OrderConfirm',
  setup() {
    const cartStore = inject('cartStore')
    const router = useRouter()
    const selectedAddress = ref(null)
    const shopInfo = ref({})
    const remark = ref('')

    // 计算总金额
    const totalAmount = computed(() => {
      if (!cartStore?.items) return 0
      const itemsTotal = cartStore.items.reduce((total, item) => {
        return total + (Number(item.price) * item.quantity)
      }, 0)
      const deliveryFee = Number(shopInfo.value.delivery_fee || 0)
      return (itemsTotal + deliveryFee).toFixed(2)
    })

    // 加载默认地址
    const loadDefaultAddress = async () => {
      try {
        const response = await api.get('/users/addresses')
        const addresses = response.data.data
        if (addresses && addresses.length > 0) {
          // 检查URL中是否有选中的地址ID
          const addressId = router.currentRoute.value.query.addressId
          if (addressId) {
            selectedAddress.value = addresses.find(addr => addr.id === parseInt(addressId))
          }
          // 如果URL中没有地址ID或找不到对应地址，则使用默认地址
          if (!selectedAddress.value) {
            selectedAddress.value = addresses.find(addr => addr.is_default) || addresses[0]
          }
        }
      } catch (error) {
        console.error('加载地址失败:', error)
      }
    }

    // 加载商家信息
    const loadShopInfo = async () => {
      if (!cartStore?.shopId) {
        router.replace('/')
        return
      }
      try {
        const response = await api.get(`/shops/${cartStore.shopId}`)
        shopInfo.value = response.data.data
      } catch (error) {
        console.error('加载商家信息失败:', error)
      }
    }

    // 跳转到地址选择
    const goToAddress = () => {
      router.push({
        path: '/address',
        query: { redirect: router.currentRoute.value.fullPath }
      })
    }

    // 提交订单
    const submitOrder = async () => {
      if (!selectedAddress.value) {
        alert('请选择收货地址')
        return
      }

      if (!cartStore?.items?.length) {
        alert('购物车为空')
        router.replace('/')
        return
      }

      try {
        // 确保所有必需字段都有值
        if (!cartStore.shopId) {
          alert('商家信息无效')
          return
        }

        const orderData = {
          addressId: selectedAddress.value.id,
          shopId: cartStore.shopId,
          items: cartStore.items.map(item => ({
            id: item.id,
            quantity: item.quantity
          })),
          remark: remark.value || '',  // 确保备注为空字符串而不是undefined
          paymentMethod: 1  // 默认使用在线支付
        }

        // 验证所有必需字段
        if (!orderData.addressId || !orderData.shopId || !orderData.items.length) {
          alert('订单信息不完整，请重试')
          return
        }

        console.log('提交订单数据:', orderData)  // 添加日志
        const response = await api.post('/orders', orderData)
        console.log('订单创建响应:', response.data)  // 添加日志
        
        const orderId = response.data.data.id
        
        // 清空购物车
        cartStore.clearCart()
        
        // 跳转到支付页面
        router.push(`/payment?orderId=${orderId}`)
      } catch (error) {
        console.error('创建订单失败:', error)
        alert(error.response?.data?.message || '创建订单失败，请重试')
      }
    }

    onMounted(() => {
      // 确保购物车存在且有商品
      if (!cartStore?.items?.length) {
        router.replace('/')
        return
      }
      loadDefaultAddress()
      loadShopInfo()
    })

    // 监听路由参数变化，重新加载地址
    watch(() => router.currentRoute.value.query.addressId, () => {
      loadDefaultAddress()
    })

    return {
      cartStore,
      selectedAddress,
      shopInfo,
      remark,
      totalAmount,
      goToAddress,
      submitOrder,
      router
    }
  }
}
</script>

<style scoped>
.order-confirm {
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
  position: sticky;
  top: 0;
  z-index: 100;
}

.back {
  padding: 10px;
  margin-left: -10px;
  cursor: pointer;
}

.nav-bar h1 {
  flex: 1;
  text-align: center;
  font-size: 16px;
  margin: 0;
}

.section {
  background: white;
  margin-top: 12px;
  padding: 16px;
}

.address {
  cursor: pointer;
}

.address-info {
  line-height: 1.5;
}

.user-info {
  margin-bottom: 8px;
}

.name {
  font-weight: bold;
  margin-right: 12px;
}

.phone {
  color: #666;
}

.detail {
  color: #333;
  font-size: 14px;
}

.no-address {
  color: #666;
  text-align: center;
}

.shop-name {
  font-weight: bold;
  margin-bottom: 12px;
}

.item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 12px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.price-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.count {
  color: #666;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remark textarea {
  width: 100%;
  height: 60px;
  border: 1px solid #ddd;
  padding: 8px;
  font-size: 14px;
  resize: none;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.total {
  flex: 1;
  font-size: 14px;
}

.total .price {
  font-size: 20px;
}

.submit-btn {
  padding: 8px 24px;
  background: #1989fa;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style> 