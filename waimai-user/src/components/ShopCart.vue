<template>
  <div class="shop-cart">
    <div class="cart-icon" @click="showCart = !showCart">
      <el-badge :value="count" :hidden="count === 0">
        <el-button circle>
          <el-icon><ShoppingCart /></el-icon>
        </el-button>
      </el-badge>
    </div>

    <div class="cart-panel" v-if="showCart">
      <div class="cart-header">
        <span>购物车</span>
        <el-button 
          type="text" 
          @click="cartStore.clear()"
          v-if="cartStore.items.length"
        >
          清空
        </el-button>
      </div>

      <div class="cart-items" v-if="cartStore.items.length">
        <div 
          v-for="item in cartStore.items" 
          :key="item.id"
          class="cart-item"
        >
          <img :src="item.image" :alt="item.name">
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <div class="item-price">
              <span class="price">¥{{ item.price }}</span>
              <div class="quantity-control">
                <el-button 
                  circle 
                  size="small"
                  @click="cartStore.removeItem(item.id)"
                >
                  <el-icon><Minus /></el-icon>
                </el-button>
                <span class="quantity">{{ item.quantity }}</span>
                <el-button 
                  circle 
                  size="small"
                  @click="cartStore.addItem(item)"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-cart" v-else>
        购物车是空的
      </div>

      <div class="cart-footer" v-if="cartStore.items.length">
        <div class="total">
          <span>合计:</span>
          <span class="total-price">¥{{ total }}</span>
        </div>
        <el-button type="primary" @click="checkout">去结算</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Plus, Minus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ShopCart',
  components: {
    ShoppingCart,
    Plus,
    Minus
  },
  setup() {
    const router = useRouter()
    const cartStore = inject('cartStore')
    const showCart = ref(false)

    const count = computed(() => cartStore.count)
    const total = computed(() => cartStore.total)

    const checkout = () => {
      if (!cartStore.items.length) {
        ElMessage.warning('购物车是空的')
        return
      }
      if (!localStorage.getItem('token')) {
        router.push({
          path: '/login',
          query: { redirect: '/checkout' }
        })
        return
      }
      router.push('/checkout')
    }

    return {
      cartStore,
      showCart,
      count,
      total,
      checkout
    }
  }
}
</script>

<style scoped>
.shop-cart {
  position: fixed;
  right: 20px;
  bottom: 80px;
  z-index: 1000;
}

.cart-icon {
  cursor: pointer;
}

.cart-panel {
  position: absolute;
  right: 0;
  bottom: 60px;
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.cart-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-items {
  max-height: 400px;
  overflow-y: auto;
}

.cart-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
}

.cart-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 8px;
  font-size: 14px;
}

.item-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity {
  min-width: 20px;
  text-align: center;
}

.empty-cart {
  padding: 32px;
  text-align: center;
  color: #999;
}

.cart-footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
  margin-left: 8px;
}
</style> 