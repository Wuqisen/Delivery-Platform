<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  }
})

const chartRef = ref(null)
let chart = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  setOptions()
}

// 设置图表配置
const setOptions = () => {
  const names = props.data.map(item => item.name)
  const values = props.data.map(item => item.sales)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const [param] = params
        return `${param.name}<br/>销量：${param.value}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: '#eee'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisLabel: {
        color: '#666'
      }
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: values,
        barWidth: '60%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            {
              offset: 0,
              color: '#83bff6'
            },
            {
              offset: 0.5,
              color: '#188df0'
            },
            {
              offset: 1,
              color: '#188df0'
            }
          ])
        }
      }
    ]
  }

  chart.setOption(option)
}

// 监听数据变化
watch(
  () => props.data,
  () => {
    setOptions()
  },
  { deep: true }
)

// 监听窗口大小变化
const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style> 