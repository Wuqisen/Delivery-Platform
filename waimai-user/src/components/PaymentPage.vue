/* eslint-disable */
<template>
  <div class="payment-page">
    <!-- 导航栏 -->
    <div class="nav-bar">
      <div class="back" @click="router.back()">
        <span class="icon-back">&lt;</span>
      </div>
      <h1>订单支付</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 支付内容 -->
    <template v-else-if="paymentInfo">
      <!-- 支付金额 -->
      <div class="amount-section">
        <p class="label">支付金额</p>
        <div class="amount">
          <span class="currency">¥</span>
          <span class="number">{{ formatAmount(paymentInfo.amount) }}</span>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="order-info">
        <div class="info-item">
          <span class="label">订单编号</span>
          <span class="value">{{ paymentInfo.orderId }}</span>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-methods">
        <h3>选择支付方式</h3>
        <div class="methods-list">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id"
            :class="['method-item', { active: selectedMethod === method.id }]"
            @click="selectPaymentMethod(method.id)"
          >
            <div class="method-info">
              <img :src="method.icon" :alt="method.name">
              <span class="name">{{ method.name }}</span>
            </div>
            <div class="check-icon" v-show="selectedMethod === method.id">✓</div>
          </div>
        </div>
      </div>

      <!-- 支付二维码 -->
      <div v-if="qrcode" class="qrcode-section">
        <div class="qrcode-wrapper">
          <img :src="qrcode" alt="支付二维码">
        </div>
        <p class="qrcode-tip">请使用{{ getSelectedMethodName() }}扫码支付</p>
        <div class="countdown" v-if="countdown > 0">
          二维码有效期：{{ countdown }}秒
        </div>
      </div>
    </template>

    <!-- 错误状态 -->
    <div v-else class="error-state">
      <p>{{ error || '加载失败' }}</p>
      <button class="retry-btn" @click="loadPaymentInfo">重新加载</button>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-bar" v-if="paymentInfo && !qrcode">
      <button 
        class="pay-button" 
        :disabled="submitting || !selectedMethod"
        @click="handlePayment"
      >
        {{ submitting ? '支付中...' : '确认支付' }}
      </button>
    </div>

    <!-- 支付结果弹窗 -->
    <div v-if="showResult" class="result-popup">
      <div class="result-content">
        <div :class="['result-icon', { success: paymentSuccess }]">
          {{ paymentSuccess ? '✓' : '×' }}
        </div>
        <h3>{{ paymentSuccess ? '支付成功' : '支付失败' }}</h3>
        <p>{{ resultMessage }}</p>
        <div class="result-actions">
          <template v-if="paymentSuccess">
            <button class="primary" @click="goToOrderDetail">查看订单</button>
            <button @click="goToOrders">返回订单列表</button>
          </template>
          <template v-else>
            <button class="primary" @click="retryPayment">重新支付</button>
            <button @click="goToOrders">返回订单列表</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/config'

export default {
  name: 'PaymentPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const paymentInfo = ref(null)
    const selectedMethod = ref(1)
    const loading = ref(true)
    const error = ref('')
    const submitting = ref(false)
    const showResult = ref(false)
    const paymentSuccess = ref(false)
    const resultMessage = ref('')
    const qrcode = ref('')
    const countdown = ref(300) // 5分钟倒计时
    let countdownTimer = null
    let checkPaymentTimer = null

    const paymentMethods = [
      { id: 1, name: '微信支付', icon: '/icons/wechat-pay.png' },
      { id: 2, name: '支付宝', icon: '/icons/alipay.png' }
    ]

    // 加载支付信息
    const loadPaymentInfo = async () => {
      try {
        loading.value = true
        error.value = ''
        const orderId = route.query.orderId
        const response = await api.get(`/orders/${orderId}/payment`)
        paymentInfo.value = response.data.data
      } catch (err) {
        error.value = err.response?.data?.message || '获取支付信息失败'
        console.error('获取支付信息失败:', err)
      } finally {
        loading.value = false
      }
    }

    // 选择支付方式
    const selectPaymentMethod = async (methodId) => {
      selectedMethod.value = methodId
      try {
        const response = await api.post(`/orders/${paymentInfo.value.orderId}/qrcode`, {
          method: methodId
        })
        qrcode.value = response.data.data.qrcode
        startCountdown()
      } catch (err) {
        console.error('获取支付二维码失败:', err)
        alert('获取支付二维码失败，请重试')
      }
    }

    // 开始倒计时
    const startCountdown = () => {
      countdown.value = 300
      if (countdownTimer) clearInterval(countdownTimer)
      countdownTimer = setInterval(() => {
        if (countdown.value > 0) {
          countdown.value--
        } else {
          clearInterval(countdownTimer)
          qrcode.value = ''
        }
      }, 1000)
    }

    // 获取选中的支付方式名称
    const getSelectedMethodName = () => {
      const method = paymentMethods.find(m => m.id === selectedMethod.value)
      return method?.name || ''
    }

    // 处理支付
    const handlePayment = async () => {
      if (!selectedMethod.value) {
        alert('请选择支付方式')
        return
      }

      try {
        submitting.value = true
        await api.post(`/orders/${paymentInfo.value.orderId}/pay`, {
          method: selectedMethod.value
        })
        showPaymentResult(true, '支付成功')
        startCheckPayment()
      } catch (err) {
        console.error('支付失败:', err)
        showPaymentResult(false, err.response?.data?.message || '支付失败，请重试')
      } finally {
        submitting.value = false
      }
    }

    // 显示支付结果
    const showPaymentResult = (success, message) => {
      paymentSuccess.value = success
      resultMessage.value = message
      showResult.value = true
    }

    // 开始检查支付状态
    const startCheckPayment = () => {
      if (checkPaymentTimer) clearInterval(checkPaymentTimer)
      checkPaymentTimer = setInterval(async () => {
        try {
          const response = await api.get(`/orders/${paymentInfo.value.orderId}`)
          if (response.data.data.status === 2) { // 支付成功
            showPaymentResult(true, '支付成功')
            clearInterval(checkPaymentTimer)
          }
        } catch (err) {
          console.error('检查支付状态失败:', err)
        }
      }, 3000)
    }

    // 重试支付
    const retryPayment = () => {
      showResult.value = false
      qrcode.value = ''
      handlePayment()
    }

    // 跳转到订单详情
    const goToOrderDetail = () => {
      router.replace(`/order/${paymentInfo.value.orderId}`)
    }

    // 跳转到订单列表
    const goToOrders = () => {
      router.replace('/orders')
    }

    // 格式化金额
    const formatAmount = (amount) => {
      return Number(amount).toFixed(2)
    }

    onMounted(() => {
      loadPaymentInfo()
    })

    onUnmounted(() => {
      if (countdownTimer) clearInterval(countdownTimer)
      if (checkPaymentTimer) clearInterval(checkPaymentTimer)
    })

    return {
      router,
      paymentInfo,
      selectedMethod,
      loading,
      error,
      submitting,
      showResult,
      paymentSuccess,
      resultMessage,
      qrcode,
      countdown,
      paymentMethods,
      loadPaymentInfo,
      selectPaymentMethod,
      getSelectedMethodName,
      handlePayment,
      retryPayment,
      goToOrderDetail,
      goToOrders,
      formatAmount
    }
  }
}
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120px;
  position: relative;
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.back {
  padding: 10px;
  margin-left: -10px;
  cursor: pointer;
}

.icon-back {
  font-size: 18px;
}

.nav-bar h1 {
  flex: 1;
  text-align: center;
  font-size: 16px;
  margin: 0;
}

.loading-state, .error-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.amount-section {
  background: white;
  padding: 30px 20px;
  text-align: center;
  margin: 10px 0;
}

.amount-section .label {
  color: #666;
  margin-bottom: 10px;
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

.order-info {
  background: white;
  padding: 15px;
  margin: 10px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.info-item .label {
  color: #666;
}

.payment-methods {
  background: white;
  padding: 20px;
  margin: 10px 0;
}

.payment-methods h3 {
  font-size: 16px;
  margin: 0 0 15px;
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

.qrcode-section {
  background: white;
  padding: 30px 20px;
  text-align: center;
  margin: 10px 0;
}

.qrcode-wrapper {
  width: 200px;
  height: 200px;
  margin: 0 auto 15px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.qrcode-wrapper img {
  width: 100%;
  height: 100%;
}

.qrcode-tip {
  color: #666;
  margin-bottom: 10px;
}

.countdown {
  color: #ff4d4f;
  font-size: 14px;
}

.bottom-bar {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  padding: 15px 20px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 99;
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
  font-weight: 500;
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

.result-icon {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: white;
  background: #ff4d4f;
}

.result-icon.success {
  background: #52c41a;
}

.result-content h3 {
  margin: 0 0 10px;
  font-size: 18px;
}

.result-content p {
  margin: 0 0 20px;
  color: #666;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.result-actions button {
  flex: 1;
  height: 36px;
  border: 1px solid #1890ff;
  border-radius: 18px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-actions button.primary {
  background: #1890ff;
  color: white;
}

.result-actions button:not(.primary) {
  background: white;
  color: #1890ff;
}

.retry-btn {
  padding: 8px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 隐藏底部导航栏 */
:deep(.nav-bar) {
  display: none !important;
}
</style> 