<template>
  <div class="dashboard">
    <!-- 数据卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日订单</span>
              <el-tag 
                :type="statistics.orderCompare >= 0 ? 'success' : 'danger'"
                size="small"
              >
                {{ statistics.orderCompare >= 0 ? '+' : '' }}{{ statistics.orderCompare }}%
              </el-tag>
            </div>
          </template>
          <div class="card-value">{{ statistics.todayOrders }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日营收</span>
              <el-tag 
                :type="statistics.revenueCompare >= 0 ? 'success' : 'danger'"
                size="small"
              >
                {{ statistics.revenueCompare >= 0 ? '+' : '' }}{{ statistics.revenueCompare }}%
              </el-tag>
            </div>
          </template>
          <div class="card-value">¥{{ statistics.todayRevenue }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待处理订单</span>
            </div>
          </template>
          <div class="card-value">{{ statistics.pendingOrders }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>在售商品</span>
            </div>
          </template>
          <div class="card-value">{{ statistics.activeDishes }}/{{ statistics.totalDishes }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>营收趋势</span>
            </div>
          </template>
          <div class="chart-container">
            <line-chart :data="statistics.revenueTrend" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>热销商品TOP5</span>
            </div>
          </template>
          <div class="chart-container">
            <bar-chart :data="statistics.topDishes" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import LineChart from './components/LineChart.vue'
import BarChart from './components/BarChart.vue'

const store = useStore()
const statistics = ref({
  todayOrders: 0,
  orderCompare: 0,
  todayRevenue: 0,
  revenueCompare: 0,
  pendingOrders: 0,
  totalDishes: 0,
  activeDishes: 0,
  revenueTrend: {
    dates: [],
    values: []
  },
  topDishes: []
})

onMounted(async () => {
  const res = await store.dispatch('merchant/getStatistics')
  statistics.value = res.data
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.chart-row {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-container {
  height: 300px;
}
</style> 