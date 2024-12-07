<template>
  <div class="order-detail">
    <el-page-header @back="$router.back()" title="返回" content="订单详情" />
    
    <el-card class="detail-card" v-loading="loading">
      <!-- 订单状态 -->
      <div class="status-bar">
        <el-tag :type="getStatusType(orderInfo.status)" size="large">
          {{ getStatusText(orderInfo.status) }}
        </el-tag>
      </div>

      <!-- 订单信息 -->
      <div class="info-section">
        <h3>订单信息</h3>
        <div class="info-item">
          <span class="label">订单编号：</span>
          <span>{{ orderInfo.id }}</span>
        </div>
        <div class="info-item">
          <span class="label">下单时间：</span>
          <span>{{ orderInfo.create_time }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付方式：</span>
          <span>{{ orderInfo.payment_method === 1 ? '在线支付' : '货到付款' }}</span>
        </div>
        <div class="info-item">
          <span class="label">备注：</span>
          <span>{{ orderInfo.remark || '无' }}</span>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="info-section">
        <h3>收货信息</h3>
        <div class="info-item">
          <span class="label">收货人：</span>
          <span>{{ orderInfo.address?.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系电话：</span>
          <span>{{ orderInfo.address?.phone }}</span>
        </div>
        <div class="info-item">
          <span class="label">收货地址：</span>
          <span>{{ orderInfo.address?.address }}</span>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="info-section">
        <h3>商品信息</h3>
        <el-table :data="orderInfo.items" border style="width: 100%">
          <el-table-column label="商品" min-width="300">
            <template #default="{ row }">
              <div class="dish-info">
                <el-image
                  :src="row.imageUrl"
                  :preview-src-list="[row.imageUrl]"
                  class="dish-image"
                />
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="120">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="120" />
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              ¥{{ (row.price * row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 订单金额 -->
        <div class="amount-info">
          <div class="amount-item">
            <span>商品总额：</span>
            <span>¥{{ getSubtotal() }}</span>
          </div>
          <div class="amount-item">
            <span>配送费：</span>
            <span>¥{{ formatAmount(orderInfo.delivery_fee) }}</span>
          </div>
          <div class="amount-item total">
            <span>订单总额：</span>
            <span>¥{{ getTotalAmount() }}</span>
          </div>
        </div>
      </div>

      <!-- 骑手信息 -->
      <div v-if="orderInfo.rider" class="info-section">
        <h3>配送信息</h3>
        <div class="info-item">
          <span class="label">骑手姓名：</span>
          <span>{{ orderInfo.rider.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系电话：</span>
          <span>{{ orderInfo.rider.phone }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderAPI } from '@/api/order'

const route = useRoute()
const loading = ref(false)
const orderInfo = ref({
  items: [],
  address: {},
  delivery_fee: 0,
  total_amount: 0
})

// 获取订单详情
const getOrderDetail = async () => {
  try {
    loading.value = true
    const res = await orderAPI.getOrderDetail(route.params.id)
    orderInfo.value = {
      ...res.data,
      delivery_fee: parseFloat(res.data.delivery_fee) || 0,
      total_amount: parseFloat(res.data.total_amount) || 0
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 计算商品总额（不含配送费）
const getSubtotal = () => {
  if (!orderInfo.value.items) return '0.00'
  return orderInfo.value.items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0
    const quantity = parseInt(item.quantity) || 0
    return sum + (price * quantity)
  }, 0).toFixed(2)
}

// 计算订单总额（商品总额 + 配送费）
const getTotalAmount = () => {
  const subtotal = parseFloat(getSubtotal()) || 0
  const deliveryFee = parseFloat(orderInfo.value.delivery_fee) || 0
  return (subtotal + deliveryFee).toFixed(2)
}

// 格式化金额
const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

// 状态处理
const getStatusType = (status) => {
  const map = {
    1: 'info',    // 待支付
    2: 'warning', // 待确认
    3: 'primary', // 待配送
    4: '',        // 配送中
    5: 'success', // 已完成
    6: 'danger'   // 已取消
  }
  return map[status]
}

const getStatusText = (status) => {
  const map = {
    1: '待支付',
    2: '待确认',
    3: '待配送',
    4: '配送中',
    5: '已完成',
    6: '已取消'
  }
  return map[status]
}

onMounted(() => {
  getOrderDetail()
})
</script>

<style scoped>
.order-detail {
  padding: 20px;
}

.detail-card {
  margin-top: 20px;
}

.status-bar {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.info-section {
  margin-bottom: 30px;
}

.info-section h3 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: bold;
}

.info-item {
  margin-bottom: 10px;
  line-height: 1.5;
}

.label {
  color: #666;
  margin-right: 10px;
}

.dish-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dish-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.amount-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.amount-item {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.amount-item span:first-child {
  margin-right: 20px;
  color: #666;
}

.amount-item.total {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}
</style> 