<template>
  <div class="user-profile">
    <!-- 用户基本信息 -->
    <div class="user-info">
      <div class="avatar-section">
        <img :src="userInfo.avatar || '/default-avatar.png'" alt="头像" class="avatar">
        <input 
          type="file" 
          ref="fileInput" 
          accept="image/*" 
          style="display: none"
          @change="handleAvatarChange"
        >
        <button @click="$refs.fileInput.click()">更换头像</button>
      </div>
      <div class="info-section">
        <div class="info-item">
          <span class="label">昵称</span>
          <input 
            v-model="userInfo.nickname" 
            @blur="updateProfile"
            placeholder="请输入昵称"
          >
        </div>
        <div class="info-item">
          <span class="label">手机号</span>
          <span>{{ userInfo.phone }}</span>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-list">
      <div class="menu-item" @click="$router.push('/my-orders')">
        <span>我的订单</span>
        <i class="arrow">></i>
      </div>
      
      <div class="menu-item" @click="$router.push('/address')">
        <span>收货地址</span>
        <i class="arrow">></i>
      </div>
      
      <div class="menu-item" @click="$router.push('/favorite')">
        <span>我的收藏</span>
        <i class="arrow">></i>
      </div>
    </div>

    <!-- 退出登录 -->
    <div class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<script>
import { userAPI } from '../api/user'

export default {
  name: 'UserProfile',
  data() {
    return {
      userInfo: {
        nickname: '',
        phone: '',
        avatar: ''
      }
    }
  },
  methods: {
    async loadUserInfo() {
      try {
        const { data } = await userAPI.getProfile()
        this.userInfo = data
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    async updateProfile() {
      try {
        await userAPI.updateProfile({
          nickname: this.userInfo.nickname
        })
      } catch (error) {
        console.error('更新用户信息失败:', error)
      }
    },
    async handleAvatarChange(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        const formData = new FormData()
        formData.append('avatar', file)
        
        const { data } = await userAPI.uploadAvatar(formData)
        this.userInfo.avatar = data.url
        await this.updateProfile()
      } catch (error) {
        console.error('上传头像失败:', error)
      }
    },
    handleLogout() {
      if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('token')
        this.$router.push('/login')
      }
    }
  },
  created() {
    this.loadUserInfo()
  }
}
</script>

<style scoped>
.user-profile {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.user-info {
  background: white;
  padding: 20px;
  margin-bottom: 10px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.info-section {
  margin-top: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.label {
  width: 80px;
  color: #666;
}

.info-item input {
  flex: 1;
  border: none;
  outline: none;
  text-align: right;
}

.menu-list {
  background: white;
  margin-bottom: 20px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.arrow {
  color: #999;
}

.logout-section {
  padding: 0 15px;
}

.logout-btn {
  width: 100%;
  padding: 15px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style> 