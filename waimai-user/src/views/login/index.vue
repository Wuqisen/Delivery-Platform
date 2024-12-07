<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>用户登录</h2>
      <!-- ... 其他登录表单内容 ... -->
      <div class="register-link">
        <span>还没有账号？</span>
        <el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
      </div>
    </el-card>
  </div>
</template> 