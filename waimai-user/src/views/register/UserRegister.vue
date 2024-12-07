<template>
  <div class="register-container">
    <el-card class="register-card">
      <div class="title">注册账号</div>
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
        <el-form-item prop="nickname">
          <el-input 
            v-model="form.nickname" 
            placeholder="请输入昵称"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleRegister" 
            :loading="loading"
            class="submit-btn"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-link">
        已有账号？<el-link type="primary" @click="$router.push('/login')">去登录</el-link>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'UserRegister'
}
</script>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userAPI } from '@/api/user'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  phone: '',
  password: '',
  nickname: ''
})

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const res = await userAPI.register(form)
    ElMessage.success('注册成功')
    
    // 保存token和用户信息
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
    
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error(error.response?.data?.msg || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.register-card {
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

.login-link {
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