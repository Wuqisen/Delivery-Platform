<template>
  <div class="order-list">
    <div v-if="orders.length > 0">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="shop-info">
            <img :src="order.shopImageUrl" :alt="order.shop_name">
            <span class="shop-name">{{ order.shop_name }}</span>
          </div>
          <div class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </div>
        </div>

        <div class="order-content">
          <div class="dish-list">
            <div v-for="item in order.items" :key="item.id" class="dish-item">
              <img :src="item.imageUrl" :alt="item.name">
              <div class="dish-info">
                <span class="name">{{ item.name }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
              <span class="price">¥{{ item.price }}</span>
            </div>
          </div>
          <div class="order-total">
            共{{ getTotalQuantity(order.items) }}件商品，
            实付<span class="price">¥{{ order.total_amount }}</span>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-time">
            {{ formatTime(order.create_time) }}
          </div>
          <div class="order-actions">
            <!-- 待支付状态 -->
            <template v-if="order.status === 1">
              <el-button type="primary" size="small" @click="payOrder(order)">
                去支付
              </el-button>
              <el-button size="small" @click="cancelOrder(order.id)">
                取消订单
              </el-button>
            </template>
            
            <!-- 配送中状态 -->
            <template v-if="order.status === 3">
              <el-button type="primary" size="small" @click="confirmOrder(order.id)">
                确认收货
              </el-button>
            </template>
            
            <!-- 已完成状态 -->
            <template v-if="order.status === 4 && !order.is_rated">
              <el-button type="primary" size="small" @click="showRateDialog(order)">
                评价订单
              </el-button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无订单" />

    <!-- 评价弹窗 -->
    <el-dialog
      v-model="rateDialogVisible"
      title="订单评价"
      width="90%"
      :show-close="false"
    >
      <div class="rate-form">
        <div class="rate-item">
          <span class="label">评分</span>
          <el-rate v-model="rateForm.rating" />
        </div>
        <div class="rate-item">
          <span class="label">评价内容</span>
          <el-input
            v-model="rateForm.comment"
            type="textarea"
            rows="3"
            placeholder="请输入评价内容"
          />
        </div>
        <div class="rate-item">
          <span class="label">上传图片</span>
          <el-upload
            action="/api/upload/rating"
            list-type="picture-card"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>
      </div>
      <template #footer>
        <el-button @click="rateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitRate">
          提交评价
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { orderAPI } from '../api/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'OrderList',
  components: {
    Plus
  },
  props: {
    status: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const router = useRouter()
    const orders = ref([])
    const rateDialogVisible = ref(false)
    const currentOrder = ref(null)
    const submitting = ref(false)
    const rateForm = ref({
      rating: 5,
      comment: '',
      images: []
    })

    // 获取订单列表
    const loadOrders = async () => {
      try {
        const response = await orderAPI.getOrders({
          status: props.status
        })
        orders.value = response.data.list
      } catch (error) {
        console.error('获取订单列表失败:', error)
        ElMessage.error('获取订单列表失败')
      }
    }

    // 支付订单
    const payOrder = (order) => {
      router.push({
        path: '/payment',
        query: {
          orderId: order.id,
          amount: order.total_amount
        }
      })
    }

    // 取消订单
    const cancelOrder = async (orderId) => {
      try {
        await ElMessageBox.confirm('确定要取消该订单吗？')
        await orderAPI.cancelOrder(orderId)
        ElMessage.success('订单已取消')
        loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('取消订单失败:', error)
          ElMessage.error('取消订单失败')
        }
      }
    }

    // 确认收货
    const confirmOrder = async (orderId) => {
      try {
        await ElMessageBox.confirm('确认已收到商品？')
        await orderAPI.confirmOrder(orderId)
        ElMessage.success('已确认收货')
        loadOrders()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('确认收货失败:', error)
          ElMessage.error('确认收货失败')
        }
      }
    }

    // 显示评价弹窗
    const showRateDialog = (order) => {
      currentOrder.value = order
      rateForm.value = {
        rating: 5,
        comment: '',
        images: []
      }
      rateDialogVisible.value = true
    }

    // 处理图片上传成功
    const handleUploadSuccess = (response) => {
      rateForm.value.images.push(response.data.url)
    }

    // 处理图片上传失败
    const handleUploadError = () => {
      ElMessage.error('图片上传失败')
    }

    // 提交评价
    const submitRate = async () => {
      if (!rateForm.value.comment) {
        ElMessage.warning('请输入评价内容')
        return
      }

      try {
        submitting.value = true
        await orderAPI.rateOrder(currentOrder.value.id, rateForm.value)
        ElMessage.success('评价成功')
        rateDialogVisible.value = false
        loadOrders()
      } catch (error) {
        console.error('评价失败:', error)
        ElMessage.error('评价失败')
      } finally {
        submitting.value = false
      }
    }

    // 获取订单状态文本
    const getStatusText = (status) => {
      const statusMap = {
        1: '待支付',
        2: '待配送',
        3: '配送中',
        4: '已完成',
        5: '已取消'
      }
      return statusMap[status] || '未知状态'
    }

    // 获取状态样式类
    const getStatusClass = (status) => {
      const classMap = {
        1: 'pending',
        2: 'processing',
        3: 'delivering',
        4: 'completed',
        5: 'cancelled'
      }
      return classMap[status]
    }

    // 格式化时间
    const formatTime = (time) => {
      return new Date(time).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    }

    // 计算商品总数
    const getTotalQuantity = (items) => {
      return items.reduce((sum, item) => sum + item.quantity, 0)
    }

    // 上传请求头
    const uploadHeaders = {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }

    onMounted(loadOrders)

    return {
      orders,
      rateDialogVisible,
      rateForm,
      submitting,
      uploadHeaders,
      payOrder,
      cancelOrder,
      confirmOrder,
      showRateDialog,
      handleUploadSuccess,
      handleUploadError,
      submitRate,
      getStatusText,
      getStatusClass,
      formatTime,
      getTotalQuantity
    }
  }
}
</script>

<style scoped>
.order-list {
  padding: 12px;
}

.order-card {
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.order-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
}

.shop-info {
  display: flex;
  align-items: center;
}

.shop-info img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}

.shop-name {
  font-weight: bold;
}

.order-status {
  font-size: 14px;
}

.order-status.pending {
  color: #e6a23c;
}

.order-status.processing {
  color: #409eff;
}

.order-status.delivering {
  color: #67c23a;
}

.order-status.completed {
  color: #909399;
}

.order-status.cancelled {
  color: #f56c6c;
}

.order-content {
  padding: 12px;
}

.dish-list {
  margin-bottom: 12px;
}

.dish-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.dish-item:last-child {
  margin-bottom: 0;
}

.dish-item img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 8px;
}

.dish-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dish-info .name {
  font-size: 14px;
}

.dish-info .quantity {
  color: #666;
  font-size: 14px;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.order-total {
  text-align: right;
  color: #666;
  font-size: 14px;
}

.order-footer {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f5f5f5;
}

.order-time {
  color: #999;
  font-size: 14px;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.rate-form {
  padding: 0 20px;
}

.rate-item {
  margin-bottom: 20px;
}

.rate-item .label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
}
</style> 