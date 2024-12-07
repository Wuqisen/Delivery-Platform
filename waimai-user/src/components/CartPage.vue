<template>
  <div class="cart-page">
    <h2>购物车</h2>
    
    <div v-if="cartItems.length === 0" class="empty-cart">
      <p>购物车是空的，去挑选一些美食吧！</p>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <img :src="item.image" alt="商品图片" class="item-image">
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <div class="price">¥{{ item.price }}</div>
          </div>
          <div class="item-actions">
            <button @click="decreaseQuantity(item)">-</button>
            <span class="quantity">{{ item.quantity }}</span>
            <button @click="increaseQuantity(item)">+</button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <div class="total">
          总计: ¥{{ totalAmount }}
        </div>
        <button class="checkout-btn" @click="checkout">
          去结算 ({{ totalItems }}件)
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartPage',
  data() {
    return {
      cartItems: [
        {
          id: 1,
          name: '招牌炒面',
          price: 22,
          quantity: 1,
          image: '/dish1.jpg'
        }
        // 添加更多购物车项...
      ]
    }
  },
  computed: {
    totalAmount() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    },
    totalItems() {
      return this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    }
  },
  methods: {
    increaseQuantity(item) {
      item.quantity++
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--
      } else {
        const index = this.cartItems.indexOf(item)
        this.cartItems.splice(index, 1)
      }
    },
    checkout() {
      // TODO: 实现结算逻辑
      this.$router.push('/order-confirm')
    }
  }
}
</script>

<style scoped>
.cart-page {
  padding: 20px;
}

.empty-cart {
  text-align: center;
  padding: 40px;
  color: #999;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
}

.item-info {
  flex: 1;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity {
  min-width: 30px;
  text-align: center;
}

.cart-summary {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkout-btn {
  background-color: #1989fa;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.total {
  font-size: 18px;
  font-weight: bold;
}
</style>
