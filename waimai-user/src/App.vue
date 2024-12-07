<template>
  <div id="app">
    <router-view></router-view>
    
    <!-- 添加购物车组件 -->
    <shop-cart v-if="!$route.meta.hideCart"></shop-cart>
    
    <nav class="nav-bar" v-if="!$route.meta.hideNavBar">
      <router-link to="/" class="nav-item">
        <i class="icon-home"></i>
        <span>首页</span>
      </router-link>
      <router-link to="/orders" class="nav-item">
        <i class="icon-order"></i>
        <span>订单</span>
      </router-link>
      <router-link to="/user" class="nav-item">
        <i class="icon-user"></i>
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import ShopCart from './components/ShopCart.vue'

export default {
  name: 'App',
  components: {
    ShopCart
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-item {
  text-decoration: none;
  color: #666;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 0;
}

.nav-item i {
  font-size: 20px;
  margin-bottom: 2px;
}

.nav-item span {
  font-size: 12px;
}

.nav-item.router-link-active {
  color: #1890ff;
}

/* 为了防止底部导航栏遮挡内容 */
#app {
  padding-bottom: 60px;
}

/* 图标样式 */
.icon-home::before {
  content: "🏠";
}

.icon-order::before {
  content: "📋";
}

.icon-user::before {
  content: "👤";
}
</style>
