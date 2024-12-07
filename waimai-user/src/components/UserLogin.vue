<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginForm">
        <el-form-item prop="phone">
          <el-input 
            v-model="loginForm.phone" 
            placeholder="手机号"
            prefix-icon="el-icon-mobile"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="密码"
            prefix-icon="el-icon-lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="handleLogin" 
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { userAPI } from '../api/user'
import { ElMessage } from 'element-plus'

export default {
  name: 'UserLogin',
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const loginForm = reactive({
      phone: '',
      password: ''
    })

    const rules = {
      phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    }

    const handleLogin = async () => {
      loading.value = true
      try {
        const res = await userAPI.login(loginForm)
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify(res.data.user))
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '登录失败')
      } finally {
        loading.value = false
      }
    }

    return {
      loginForm,
      loading,
      rules,
      handleLogin
    }
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

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style> 