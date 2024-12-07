<template>
  <div class="user-page">
    <div class="user-info">
      <el-avatar :size="64" :src="userInfo.avatar || '/default-avatar.png'" />
      <div class="info-content">
        <h3>{{ userInfo.nickname }}</h3>
        <p>{{ userInfo.phone }}</p>
      </div>
    </div>

    <div class="action-list">
      <div class="action-item" @click="goToOrders">
        <i class="el-icon-document"></i>
        <span>我的订单</span>
      </div>
      <div class="action-item" @click="goToAddress">
        <i class="el-icon-location"></i>
        <span>收货地址</span>
      </div>
      <div class="action-item" @click="handleLogout">
        <i class="el-icon-switch-button"></i>
        <span>退出登录</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userAPI } from '../api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'UserCenter',
  setup() {
    const router = useRouter()
    const userInfo = ref({})

    const loadUserInfo = async () => {
      try {
        const response = await userAPI.getProfile()
        userInfo.value = response.data
      } catch (error) {
        console.error('获取用户信息失败:', error)
        ElMessage.error('获取用户信息失败')
      }
    }

    const goToOrders = () => {
      router.push('/order')
    }

    const goToAddress = () => {
      router.push('/address')
    }

    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示')
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
        ElMessage.success('已退出登录')
      } catch {
        // 用户取消操作
      }
    }

    onMounted(() => {
      loadUserInfo()
    })

    return {
      userInfo,
      goToOrders,
      goToAddress,
      handleLogout
    }
  }
}
</script>

<style scoped>
.user-page {
  padding: 16px;
}

.user-info {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.info-content {
  margin-left: 16px;
}

.info-content h3 {
  margin: 0;
  font-size: 18px;
}

.info-content p {
  margin: 4px 0 0;
  color: #666;
}

.action-list {
  background: white;
  border-radius: 8px;
}

.action-item {
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
}

.action-item:last-child {
  border-bottom: none;
}

.action-item i {
  font-size: 20px;
  margin-right: 12px;
}

.action-item:hover {
  background: #f5f5f5;
}
</style> 