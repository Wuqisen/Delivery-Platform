<template>
  <div class="checkout-page">
    <div class="section">
      <h3>收货地址</h3>
      <div v-if="selectedAddress" class="address-card">
        <div class="address-info">
          <h4>{{ selectedAddress.name }} {{ selectedAddress.phone }}</h4>
          <p>{{ selectedAddress.address }}</p>
        </div>
        <el-button type="text" @click="showAddressSelect = true">修改</el-button>
      </div>
      <el-button v-else type="primary" @click="showAddressSelect = true">
        选择收货地址
      </el-button>
    </div>

    <div class="section">
      <h3>订单详情</h3>
      <div class="shop-info">
        <h4>{{ cartStore.shopName }}</h4>
      </div>
      <div class="order-items">
        <div v-for="item in cartStore.items" :key="item.id" class="order-item">
          <img :src="item.image" :alt="item.name">
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <div class="item-price">
              <span class="price">¥{{ item.price }}</span>
              <span class="quantity">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="fee-item">
        <span>商品总价</span>
        <span>¥{{ cartStore.total }}</span>
      </div>
      <div class="fee-item">
        <span>配送费</span>
        <span>¥{{ deliveryFee }}</span>
      </div>
      <div class="total-amount">
        <span>实付金额</span>
        <span class="price">¥{{ totalAmount }}</span>
      </div>
    </div>

    <div class="submit-bar">
      <div class="total">
        <span>合计:</span>
        <span class="price">¥{{ totalAmount }}</span>
      </div>
      <el-button type="primary" :loading="submitting" @click="submitOrder">
        提交订单
      </el-button>
    </div>

    <!-- 地址选择弹窗 -->
    <el-dialog
      v-model="showAddressSelect"
      title="选择收货地址"
      width="90%"
      :show-close="false"
    >
      <div class="address-list">
        <div
          v-for="address in addresses"
          :key="address.id"
          class="address-item"
          @click="selectAddress(address)"
        >
          <div class="address-info">
            <h4>{{ address.name }} {{ address.phone }}</h4>
            <p>{{ address.address }}</p>
          </div>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      <div class="dialog-footer">
        <el-button @click="showAddressSelect = false">取消</el-button>
        <el-button type="primary" @click="goToAddAddress">
          新增地址
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userAPI } from '../api/user'
import { orderAPI } from '../api/order'
import { ElMessage } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'

export default {
  name: 'CheckoutPage',
  components: {
    ArrowRight
  },
  setup() {
    const router = useRouter()
    const cartStore = inject('cartStore')
    const addresses = ref([])
    const selectedAddress = ref(null)
    const showAddressSelect = ref(false)
    const submitting = ref(false)
    const deliveryFee = ref(5) // 这里可以从商家信息中获取

    const totalAmount = computed(() => {
      return cartStore.total + deliveryFee.value
    })

    // 加载地址列表
    const loadAddresses = async () => {
      try {
        const response = await userAPI.getAddresses()
        addresses.value = response.data
        // 如果有默认地址，自动选中
        const defaultAddress = addresses.value.find(addr => addr.is_default)
        if (defaultAddress) {
          selectedAddress.value = defaultAddress
        }
      } catch (error) {
        console.error('获取地址列表失败:', error)
        ElMessage.error('获取地址列表失败')
      }
    }

    const selectAddress = (address) => {
      selectedAddress.value = address
      showAddressSelect.value = false
    }

    const goToAddAddress = () => {
      router.push('/address/add')
    }

    const submitOrder = async () => {
      if (!selectedAddress.value) {
        ElMessage.warning('请选择收货地址')
        return
      }

      try {
        submitting.value = true
        const orderData = {
          addressId: selectedAddress.value.id,
          items: cartStore.items.map(item => ({
            id: item.id,
            quantity: item.quantity
          })),
          shopId: cartStore.shopId,
          paymentMethod: 1,
          remark: ''
        }

        const response = await orderAPI.createOrder(orderData)
        ElMessage.success('订单提交成功')
        cartStore.clear()
        router.push({
          path: '/payment',
          query: { 
            orderId: response.data.orderId,
            amount: response.data.totalAmount
          }
        })
      } catch (error) {
        console.error('提交订单失败:', error)
        ElMessage.error(error.response?.data?.msg || '提交订单失败')
      } finally {
        submitting.value = false
      }
    }

    onMounted(() => {
      if (cartStore.items.length === 0) {
        ElMessage.warning('购物车为空')
        router.push('/')
        return
      }
      loadAddresses()
    })

    return {
      cartStore,
      addresses,
      selectedAddress,
      showAddressSelect,
      submitting,
      deliveryFee,
      totalAmount,
      selectAddress,
      goToAddAddress,
      submitOrder
    }
  }
}
</script>

<style scoped>
.checkout-page {
  padding-bottom: 60px;
}

.section {
  background: white;
  margin-bottom: 12px;
  padding: 16px;
}

.section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #333;
}

.address-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
}

.address-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
}

.address-info p {
  margin: 0;
  color: #666;
}

.order-items {
  margin-top: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 8px;
  font-size: 14px;
}

.item-price {
  display: flex;
  justify-content: space-between;
  color: #666;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #666;
}

.total-amount {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.address-item:hover {
  background: #f5f5f5;
}

.dialog-footer {
  margin-top: 20px;
  text-align: right;
}
</style> 