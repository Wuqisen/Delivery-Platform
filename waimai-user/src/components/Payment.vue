/* eslint-disable */
<template>
  <div class="payment-page">
    <div class="nav-bar">
      <div class="back" @click="$router.back()">
        <i class="icon-back">←</i>
      </div>
      <h1>支付订单</h1>
    </div>

    <div class="amount-section">
      <div class="amount">
        <span class="currency">¥</span>
        <span class="number">{{ amount }}</span>
      </div>
    </div>

    <div class="payment-methods">
      <h3>选择支付方式</h3>
      <div class="methods-list">
        <div 
          v-for="method in paymentMethods" 
          :key="method.id"
          :class="['method-item', { active: selectedMethod === method.id }]"
          @click="selectedMethod = method.id"
        >
          <div class="method-info">
            <img :src="method.icon" :alt="method.name">
            <span class="name">{{ method.name }}</span>
          </div>
          <div class="check-icon" v-if="selectedMethod === method.id">✓</div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <button 
        class="pay-button"
        :disabled="loading"
        @click="handlePayment"
      >
        {{ loading ? '支付中...' : '立即支付' }}
      </button>
    </div>

    <div v-if="showResult" class="result-popup">
      <div class="result-content">
        <img 
          :src="paymentSuccess ? '/icons/success.png' : '/icons/fail.png'"
          :alt="paymentSuccess ? '支付成功' : '支付失败'"
        >
        <h3>{{ paymentSuccess ? '支付成功' : '支付失败' }}</h3>
        <p>{{ resultMessage }}</p>
        <div class="buttons">
          <button v-if="paymentSuccess" @click="goToOrderDetail">查看订单</button>
          <button v-else @click="retryPayment">重试</button>
          <button @click="goToOrders">返回订单列表</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/config'

export default {
  name: 'PaymentPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const amount = ref(0)
    const orderId = ref('')
    const selectedMethod = ref(1)
    const loading = ref(false)
    const showResult = ref(false)
    const paymentSuccess = ref(false)
    const resultMessage = ref('')

    const paymentMethods = [
      { id: 1, name: '微信支付', icon: '/icons/wechat-pay.png' },
      { id: 2, name: '支付宝支付', icon: '/icons/alipay.png' }
    ]

    onMounted(() => {
      amount.value = Number(route.query.amount || 0).toFixed(2)
      orderId.value = route.query.orderId
    })

    const handlePayment = async () => {
      if (loading.value) return
      
      try {
        loading.value = true
        await api.post('/payments', {
          orderId: orderId.value,
          amount: amount.value,
          method: selectedMethod.value
        })

        await new Promise(resolve => setTimeout(resolve, 1500))

        paymentSuccess.value = true
        resultMessage.value = '订单支付成功'
        showResult.value = true
      } catch (error) {
        console.error('Payment failed:', error)
        paymentSuccess.value = false
        resultMessage.value = error.response?.data?.message || '支付失败，请重试'
        showResult.value = true
      } finally {
        loading.value = false
      }
    }

    const retryPayment = () => {
      showResult.value = false
      handlePayment()
    }

    const goToOrderDetail = () => {
      router.push(`/order/${orderId.value}`)
    }

    const goToOrders = () => {
      router.push('/orders')
    }

    return {
      amount,
      selectedMethod,
      paymentMethods,
      loading,
      showResult,
      paymentSuccess,
      resultMessage,
      handlePayment,
      retryPayment,
      goToOrderDetail,
      goToOrders
    }
  }
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

.amount-section {
  background: white;
  padding: 30px 0;
  text-align: center;
  margin: 10px 0;
}

.amount {
  color: #ff4d4f;
}

.currency {
  font-size: 24px;
  margin-right: 4px;
}

.number {
  font-size: 36px;
  font-weight: bold;
}

.payment-methods {
  background: white;
  padding: 20px;
  margin: 10px 0;
}

.payment-methods h3 {
  margin: 0 0 15px;
  font-size: 16px;
  color: #333;
}

.method-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item:last-child {
  margin-bottom: 0;
}

.method-item.active {
  border-color: #1890ff;
  background: #e6f7ff;
}

.method-info {
  display: flex;
  align-items: center;
}

.method-info img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.check-icon {
  color: #1890ff;
  font-weight: bold;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 20px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}

.pay-button {
  width: 100%;
  height: 44px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.pay-button:hover {
  background: #40a9ff;
}

.pay-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.result-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  width: 80%;
  max-width: 300px;
}

.result-content img {
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
}

.result-content h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: #333;
}

.result-content p {
  margin: 0 0 20px;
  color: #666;
  font-size: 14px;
}

.buttons {
  display: flex;
  gap: 10px;
}

.buttons button {
  flex: 1;
  height: 36px;
  border: 1px solid #1890ff;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.buttons button:first-child {
  background: #1890ff;
  color: white;
}

.buttons button:first-child:hover {
  background: #40a9ff;
}

.buttons button:last-child {
  background: white;
  color: #1890ff;
}

.buttons button:last-child:hover {
  background: #f0f9ff;
}
</style> 