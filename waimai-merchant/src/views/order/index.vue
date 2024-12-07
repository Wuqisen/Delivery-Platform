<template>
  <div class="order-list">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderId" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待确认" value="2" />
            <el-option label="待配送" value="3" />
            <el-option label="配送中" value="4" />
            <el-option label="已完成" value="5" />
            <el-option label="已取消" value="6" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="list-card">
      <el-table
        v-loading="loading"
        :data="orderList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="订单号" width="180" />
        <el-table-column label="订单信息" min-width="200">
          <template #default="{ row }">
            <div v-for="item in row.items" :key="item.id" class="order-item">
              <el-image
                :src="item.imageUrl"
                :preview-src-list="[item.imageUrl]"
                class="dish-image"
              />
              <div class="dish-info">
                <div>{{ item.name }}</div>
                <div class="quantity">x{{ item.quantity }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ calculateOrderAmount(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="收货信息" min-width="200">
          <template #default="{ row }">
            <div>{{ row.address.name }} {{ row.address.phone }}</div>
            <div class="address">{{ row.address.address }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 2"
              type="primary" 
              size="small" 
              @click="handleConfirm(row.id)"
            >
              确认接单
            </el-button>
            <el-button 
              v-if="row.status === 3"
              type="primary" 
              size="small" 
              @click="handleAssignRider(row)"
            >
              分配骑手
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="handleDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 分配骑手弹窗 -->
    <el-dialog
      v-model="riderDialogVisible"
      title="分配骑手"
      width="500px"
    >
      <div v-loading="loadingRiders">
        <el-table
          v-if="availableRiders.length > 0"
          :data="availableRiders"
          border
          style="width: 100%"
        >
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="phone" label="电话" width="120" />
          <el-table-column prop="rating" label="评分" width="100">
            <template #default="{ row }">
              <el-rate
                v-model="row.rating"
                disabled
                show-score
                text-color="#ff9900"
              />
            </template>
          </el-table-column>
          <el-table-column prop="total_orders" label="总单数" width="100" />
          <el-table-column prop="status_text" label="状态" width="100">
            <template #default="{ row }">
              <el-tag type="success">{{ row.status_text }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="handleSelectRider(row)"
              >
                选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty
          v-else
          description="暂无可用骑手"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { merchantAPI } from '@/api/merchant'
import { useStore } from 'vuex'
import { orderAPI } from '@/api/order'

const router = useRouter()
const store = useStore()

// 搜索表单
const searchForm = reactive({
  orderId: '',
  status: ''
})

// 使用计算属性获取 Vuex 中的数据
const loading = computed(() => store.state.order.loading)
const orderList = computed(() => store.state.order.orders)
const page = ref(1)
const pageSize = ref(10)
const total = computed(() => store.state.order.total)

// 骑手分配
const riderDialogVisible = ref(false)
const loadingRiders = ref(false)
const availableRiders = ref([])
const currentOrder = ref(null)

// 获取订单列表
const getOrders = async () => {
  try {
    await store.dispatch('order/getOrders', {
      page: page.value,
      pageSize: pageSize.value,
      status: searchForm.status,
      orderId: searchForm.orderId
    })
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  }
}

// 搜索
const handleSearch = () => {
  page.value = 1
  getOrders()
}

// 重置搜索
const resetSearch = () => {
  searchForm.orderId = ''
  searchForm.status = ''
  handleSearch()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getOrders()
}

const handleCurrentChange = (val) => {
  page.value = val
  getOrders()
}

// 确认接单
const handleConfirm = async (orderId) => {
  try {
    await store.dispatch('order/confirmOrder', orderId)
    ElMessage.success('确认成功')
  } catch (error) {
    ElMessage.error('确认失败')
  }
}

// 分配骑手
const handleAssignRider = async (order) => {
  try {
    currentOrder.value = order
    riderDialogVisible.value = true
    loadingRiders.value = true
    
    const res = await orderAPI.getAvailableRiders()
    availableRiders.value = res.data
    
    if (availableRiders.value.length === 0) {
      ElMessage.warning('当前没有可用的骑手')
    }
  } catch (error) {
    console.error('获取骑手列表失败:', error)
    ElMessage.error('获取骑手列表失败')
  } finally {
    loadingRiders.value = false
  }
}

// 选择骑手
const handleSelectRider = async (rider) => {
  try {
    await ElMessageBox.confirm(
      `确定要将订单分配给骑手 ${rider.name} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await orderAPI.assignRider(currentOrder.value.id, rider.id)
    ElMessage.success('分配成功')
    riderDialogVisible.value = false
    getOrders() // 刷新订单列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('分配骑手失败:', error)
      ElMessage.error(error.response?.data?.msg || '分配骑手失败')
    }
  }
}

// 监听弹窗关闭
watch(riderDialogVisible, (val) => {
  if (!val) {
    currentOrder.value = null
    availableRiders.value = []
  }
})

// 查看详情
const handleDetail = (order) => {
  router.push(`/orders/${order.id}`)
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

// 计算订单金额（商品总额 + 配送费）
const calculateOrderAmount = (order) => {
  // 计算商品总额
  const subtotal = order.items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0
    const quantity = parseInt(item.quantity) || 0
    return sum + (price * quantity)
  }, 0)
  
  // 加上配送费
  const deliveryFee = parseFloat(order.delivery_fee) || 0
  return (subtotal + deliveryFee).toFixed(2)
}

onMounted(() => {
  getOrders()
})
</script>

<style scoped>
.order-list {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.dish-image {
  width: 40px;
  height: 40px;
  margin-right: 8px;
  border-radius: 4px;
}

.dish-info {
  flex: 1;
  font-size: 14px;
}

.quantity {
  color: #999;
  font-size: 12px;
}

.address {
  color: #666;
  font-size: 13px;
  margin-top: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-dialog :deep(.el-dialog__body) {
  padding-top: 20px;
}

.rider-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rider-name {
  font-weight: bold;
}

.rider-phone {
  color: #666;
}

.rider-rating {
  color: #ff9900;
}
</style> 