<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="title">用户登录</div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="0"
        size="large"
      >
        <el-form-item prop="phone">
          <el-input 
            v-model="form.phone" 
            placeholder="请输入手机号"
            prefix-icon="Phone"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            :loading="loading"
            class="submit-btn"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="register-link">
        还没有账号？<el-link type="primary" @click="$router.push('/register')">去注册</el-link>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'UserLogin'
}
</script>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userAPI } from '../api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const form = reactive({
  phone: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    const res = await userAPI.login(form)
    
    // 保存token和用户信息
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
    
    ElMessage.success('登录成功')
    
    // 跳转到之前的页面或首页
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.login-card {
  width: 400px;
  padding: 20px 50px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
  height: 40px;
  font-size: 16px;
}

.register-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

:deep(.el-input__wrapper) {
  height: 40px;
}

:deep(.el-form-item__error) {
  padding-top: 4px;
}
</style> 