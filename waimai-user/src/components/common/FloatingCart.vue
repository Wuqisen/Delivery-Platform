/* eslint-disable */
<template>
  <div class="floating-cart">
    <!-- 购物车图标和数量 -->
    <div class="cart-icon" @click="toggleCart">
      <div class="icon">
        <img src="/icons/cart.png" alt="购物车">
        <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
      </div>
    </div>

    <!-- 购物车弹出层 -->
    <div v-if="showCart" class="cart-popup">
      <div class="mask" @click="showCart = false"></div>
      <div class="content">
        <div class="header">
          <h3>购物车</h3>
          <div class="clear" @click="clearCart">清空</div>
        </div>

        <div class="items" v-if="shopItems.length > 0">
          <div v-for="item in shopItems" :key="item.id" class="item">
            <img :src="item.imageUrl" :alt="item.name">
            <div class="info">
              <h4>{{ item.name }}</h4>
              <div class="price">¥{{ item.price }}</div>
            </div>
            <div class="quantity">
              <button @click="decreaseQuantity(item)">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)">+</button>
            </div>
          </div>
        </div>
        <div v-else class="empty-cart">
          <img src="/icons/empty-cart.png" alt="空购物车">
          <p>购物车是空的</p>
        </div>

        <!-- 结算栏 -->
        <div class="checkout-bar" v-if="shopItems.length > 0">
          <div class="total">
            <span>合计</span>
            <span class="price">¥{{ totalPrice }}</span>
          </div>
          <button 
            :disabled="totalPrice < minDelivery" 
            @click="goToCheckout"
            class="checkout-button"
          >
            {{ checkoutButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, inject, watch } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'FloatingCart',
  props: {
    shopId: {
      type: Number,
      required: true
    },
    minDelivery: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const cart = inject('cart')
    const router = useRouter()
    const showCart = ref(false)

    // 获取当前商家的购物车商品
    const shopItems = computed(() => {
      console.log('Cart items:', cart.items)
      console.log('Shop ID:', props.shopId)
      return cart.items.filter(item => item.shopId === props.shopId)
    })

    // 计算商品总数
    const cartCount = computed(() => {
      return shopItems.value.reduce((sum, item) => sum + item.quantity, 0)
    })

    // 计算总价
    const totalPrice = computed(() => {
      return shopItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    })

    // 结算按钮文字
    const checkoutButtonText = computed(() => {
      if (totalPrice.value < props.minDelivery) {
        return `还差¥${(props.minDelivery - totalPrice.value).toFixed(2)}起送`
      }
      return '去结算'
    })

    // 切换购物车显示状态
    const toggleCart = () => {
      if (cartCount.value > 0) {
        showCart.value = !showCart.value
      }
    }

    // 清空购物车
    const clearCart = () => {
      if (confirm('确定要清空购物车吗？')) {
        cart.clearCart()
        showCart.value = false
      }
    }

    // 减少商品数量
    const decreaseQuantity = (item) => {
      console.log('Decreasing quantity for item:', item)
      cart.updateQuantity(item.id, item.quantity - 1)
    }

    // 增加商品数量
    const increaseQuantity = (item) => {
      console.log('Increasing quantity for item:', item)
      cart.updateQuantity(item.id, item.quantity + 1)
    }

    // 跳转到结算页面
    const goToCheckout = () => {
      if (totalPrice.value >= props.minDelivery) {
        showCart.value = false
        router.push({
          path: '/order-confirm',
          query: { 
            shopId: props.shopId,
            total: totalPrice.value
          }
        })
      }
    }

    // 监听购物车数量变化
    watch(cartCount, (newCount) => {
      console.log('Cart count changed:', newCount)
      if (newCount === 0) {
        showCart.value = false
      }
    })

    return {
      showCart,
      shopItems,
      cartCount,
      totalPrice,
      checkoutButtonText,
      toggleCart,
      clearCart,
      decreaseQuantity,
      increaseQuantity,
      goToCheckout
    }
  }
}
</script>

<style scoped>
.floating-cart {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.cart-icon {
  background: #1890ff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  transition: all 0.3s;
}

.cart-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.icon {
  position: relative;
}

.icon img {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4d4f;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.cart-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 1000;
}

.mask {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
}

.content {
  position: absolute;
  right: 30px;
  bottom: 80px;
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
}

.header h3 {
  margin: 0;
  font-size: 16px;
}

.clear {
  color: #999;
  font-size: 14px;
  cursor: pointer;
}

.items {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  max-height: 400px;
}

.item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item:last-child {
  border-bottom: none;
}

.item img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 10px;
  object-fit: cover;
}

.info {
  flex: 1;
}

.info h4 {
  margin: 0 0 5px;
  font-size: 14px;
}

.price {
  color: #ff4d4f;
  font-weight: bold;
}

.quantity {
  display: flex;
  align-items: center;
}

.quantity button {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: #f5f5f5;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity button:first-child {
  background: #f5f5f5;
}

.quantity button:last-child {
  background: #1890ff;
  color: white;
}

.quantity span {
  margin: 0 10px;
  min-width: 20px;
  text-align: center;
}

.empty-cart {
  padding: 30px;
  text-align: center;
  color: #999;
}

.empty-cart img {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.checkout-bar {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f5f5f5;
  background: white;
}

.total {
  font-size: 14px;
}

.total .price {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: bold;
  margin-left: 5px;
}

.checkout-button {
  background: #1890ff;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.checkout-button:hover {
  background: #40a9ff;
}

.checkout-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style> 