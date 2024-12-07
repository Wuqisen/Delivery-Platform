<template>
  <div class="payment-page">
    <div class="payment-info">
      <h2>订单支付</h2>
      <div class="amount">
        <span>支付金额</span>
        <span class="price">¥{{ amount }}</span>
      </div>
    </div>

    <div class="payment-methods">
      <h3>选择支付方式</h3>
      <div class="method-list">
        <div 
          class="method-item"
          :class="{ active: selectedMethod === 1 }"
          @click="selectedMethod = 1"
        >
          <img src="https://wuqisen.oss-cn-hangzhou.aliyuncs.com/wechat.jpg" alt="微信支付">
          <span>微信支付</span>
        </div>
        <div 
          class="method-item"
          :class="{ active: selectedMethod === 2 }"
          @click="selectedMethod = 2"
        >
          <img src="https://wuqisen.oss-cn-hangzhou.aliyuncs.com/alipay.png" alt="支付宝">
          <span>支付宝</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <el-button @click="cancel">取消支付</el-button>
      <el-button type="primary" :loading="paying" @click="pay">
        确定支付
      </el-button>
    </div>

    <!-- 支付二维码弹窗 -->
    <el-dialog
      v-model="showQRCode"
      title="请扫码支付"
      width="300px"
      center
      :show-close="false"
    >
      <div class="qrcode-container">
        <img :src="'https://wuqisen.oss-cn-hangzhou.aliyuncs.com/pay.png'" alt="支付二维码">
        <div class="amount">¥{{ amount }}</div>
      </div>
      <template #footer>
        <el-button @click="showQRCode = false">取消</el-button>
        <el-button type="primary" @click="checkPaymentStatus">
          已完成支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderAPI } from '../api/order'
import { ElMessage } from 'element-plus'

export default {
  name: 'PaymentPage',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const orderId = route.query.orderId
    const amount = ref(route.query.amount)
    const selectedMethod = ref(1)
    const paying = ref(false)
    const showQRCode = ref(false)
    const qrcode = ref('')

    // 获取支付二维码
    const getPaymentQRCode = async () => {
      try {
        const response = await orderAPI.getPaymentInfo(orderId)
        qrcode.value = response.data.qrcode
        showQRCode.value = true
      } catch (error) {
        console.error('获取支付信息失败:', error)
        ElMessage.error('获取支付信息失败')
      }
    }

    // 支付
    const pay = async () => {
      paying.value = true
      try {
        await getPaymentQRCode()
      } finally {
        paying.value = false
      }
    }

    // 检查支付状态
    const checkPaymentStatus = async () => {
      try {
        await orderAPI.payOrder(orderId)
        ElMessage.success('支付成功')
        router.push('/order')
      } catch (error) {
        console.error('支付失败:', error)
        ElMessage.error('支付失败，请重试')
      }
    }

    // 取消支付
    const cancel = () => {
      router.push('/order')
    }

    onMounted(() => {
      if (!orderId || !amount.value) {
        ElMessage.error('订单信息不完整')
        router.push('/')
      }
    })

    return {
      amount,
      selectedMethod,
      paying,
      showQRCode,
      qrcode,
      pay,
      cancel,
      checkPaymentStatus
    }
  }
}
</script>

<style scoped>
.payment-page {
  padding: 20px;
}

.payment-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.amount {
  margin-top: 20px;
  font-size: 16px;
}

.amount .price {
  color: #f56c6c;
  font-size: 24px;
  font-weight: bold;
  margin-left: 10px;
}

.payment-methods {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.method-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.method-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.method-item img {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.qrcode-container {
  text-align: center;
}

.qrcode-container img {
  width: 200px;
  height: 200px;
  margin-bottom: 16px;
}
</style> 