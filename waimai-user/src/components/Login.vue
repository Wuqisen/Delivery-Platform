<template>
  <div class="login-page">
    <div class="login-container">
      <h2>{{ isRegister ? '注册' : '登录' }}</h2>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-item">
          <label>手机号码</label>
          <input 
            type="tel" 
            v-model="form.phone" 
            placeholder="请输入手机号码"
            maxlength="11"
            required
          >
        </div>

        <div class="form-item">
          <label>密码</label>
          <input 
            type="password" 
            v-model="form.password"
            placeholder="请输入密码"
            required
          >
        </div>

        <div v-if="isRegister" class="form-item">
          <label>确认密码</label>
          <input 
            type="password" 
            v-model="form.confirmPassword"
            placeholder="请再次输入密码"
            required
          >
        </div>

        <div v-if="isRegister" class="form-item">
          <label>昵称</label>
          <input 
            type="text" 
            v-model="form.nickname"
            placeholder="请输入昵称"
            required
          >
        </div>

        <button 
          type="submit" 
          class="submit-btn"
          :disabled="loading"
        >
          {{ loading ? '处理中...' : (isRegister ? '注册' : '登录') }}
        </button>
      </form>

      <div class="switch-mode">
        <span @click="isRegister = !isRegister">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { userAPI } from '../api/user'

export default {
  name: 'LoginPage',
  data() {
    return {
      isRegister: false,
      loading: false,
      form: {
        phone: '',
        password: '',
        confirmPassword: '',
        nickname: ''
      }
    }
  },
  methods: {
    async handleSubmit() {
      if (this.isRegister && this.form.password !== this.form.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      try {
        this.loading = true
        if (this.isRegister) {
          await userAPI.register({
            phone: this.form.phone,
            password: this.form.password,
            nickname: this.form.nickname
          })
          this.isRegister = false
          this.form.confirmPassword = ''
          this.form.nickname = ''
          alert('注册成功，请登录')
        } else {
          const { data } = await userAPI.login({
            phone: this.form.phone,
            password: this.form.password
          })
          localStorage.setItem('token', data.token)
          this.$router.push(this.$route.query.redirect || '/')
        }
      } catch (error) {
        console.error('操作失败:', error)
        alert(error.response?.data?.msg || '操作失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-item {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  border-color: #1989fa;
  outline: none;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #1989fa;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.switch-mode {
  text-align: center;
  margin-top: 20px;
}

.switch-mode span {
  color: #1989fa;
  cursor: pointer;
}
</style>