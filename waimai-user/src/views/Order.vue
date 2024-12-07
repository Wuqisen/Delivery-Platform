<template>
  <div class="order-page">
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="全部订单" name="all">
        <order-list :status="0" />
      </el-tab-pane>
      <el-tab-pane label="待支付" name="pending">
        <order-list :status="1" />
      </el-tab-pane>
      <el-tab-pane label="待配送" name="processing">
        <order-list :status="2" />
      </el-tab-pane>
      <el-tab-pane label="配送中" name="delivering">
        <order-list :status="3" />
      </el-tab-pane>
      <el-tab-pane label="已完成" name="completed">
        <order-list :status="4" />
      </el-tab-pane>
      <el-tab-pane label="已取消" name="cancelled">
        <order-list :status="5" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import OrderList from '../components/OrderList.vue'

export default {
  name: 'OrderPage',
  components: {
    OrderList
  },
  setup() {
    const route = useRoute()
    const activeTab = ref('all')

    // 根据状态切换标签页
    const setTabByStatus = (status) => {
      const statusMap = {
        0: 'all',
        1: 'pending',
        2: 'processing',
        3: 'delivering',
        4: 'completed',
        5: 'cancelled'
      }
      activeTab.value = statusMap[status] || 'all'
    }

    // 处理标签页切换
    const handleTabChange = () => {
      // 可以在这里处理标签切换的逻辑
    }

    onMounted(() => {
      // 如果URL中有status参数，切换到对应标签页
      const status = parseInt(route.query.status) || 0
      setTabByStatus(status)
    })

    return {
      activeTab,
      handleTabChange
    }
  }
}
</script>

<style scoped>
.order-page {
  background: #f5f5f5;
  min-height: 100vh;
}

:deep(.el-tabs__header) {
  margin: 0;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
</style> 