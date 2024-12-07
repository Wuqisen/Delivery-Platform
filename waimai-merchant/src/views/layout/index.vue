<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="logo">
        <img src="@/assets/logo.png" alt="logo">
        <span>商户管理系统</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/dishes">
          <el-icon><Food /></el-icon>
          <span>菜品管理</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>店铺设置</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主要内容区 -->
    <div class="main-container">
      <!-- 头部 -->
      <div class="navbar">
        <div class="right-menu">
          <el-dropdown trigger="click">
            <div class="avatar-wrapper">
              <el-avatar :size="40" :src="merchantInfo?.avatar" />
              <span>{{ merchantInfo?.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容区 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const store = useStore()
const router = useRouter()

const merchantInfo = computed(() => store.state.merchant.info)

onMounted(async () => {
  if (!merchantInfo.value) {
    await store.dispatch('merchant/getInfo')
  }
})

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.dispatch('merchant/logout')
    router.push('/login')
  })
}
</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar {
  width: 210px;
  background: #304156;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: white;
}

.logo img {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.main-container {
  margin-left: 210px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.navbar {
  height: 60px;
  background: white;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: flex-end;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar-wrapper span {
  margin-left: 8px;
  color: #666;
}

.app-main {
  padding: 20px;
  flex: 1;
  background: #f0f2f5;
  overflow-y: auto;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 