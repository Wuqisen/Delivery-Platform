import { reactive } from 'vue'

export default {
  install: (app) => {
    // 使用 reactive 创建响应式购物车数据
    const cartState = reactive({
      items: []
    })

    const cart = {
      // 添加商品到购物车
      addItem(item) {
        console.log('Adding item to cart:', item)
        const existingItem = cartState.items.find(i => i.id === item.id)
        if (existingItem) {
          existingItem.quantity++
        } else {
          cartState.items.push({ ...item, quantity: 1 })
        }
        console.log('Cart items after add:', cartState.items)
        this.saveToStorage()
      },

      // 更新商品数量
      updateQuantity(itemId, quantity) {
        console.log('Updating quantity:', { itemId, quantity })
        const item = cartState.items.find(i => i.id === itemId)
        if (item) {
          if (quantity <= 0) {
            const index = cartState.items.findIndex(i => i.id === itemId)
            if (index > -1) {
              cartState.items.splice(index, 1)
            }
          } else {
            item.quantity = quantity
          }
          console.log('Cart items after update:', cartState.items)
          this.saveToStorage()
        }
      },

      // 清空购物车
      clearCart() {
        console.log('Clearing cart')
        cartState.items = []
        this.saveToStorage()
      },

      // 获取购物车商品列表
      get items() {
        return cartState.items
      },

      // 获取指定商家的商品总数
      getShopItemCount(shopId) {
        return cartState.items
          .filter(item => item.shopId === shopId)
          .reduce((sum, item) => sum + item.quantity, 0)
      },

      // 获取指定商家的商品总价
      getShopTotal(shopId) {
        return cartState.items
          .filter(item => item.shopId === shopId)
          .reduce((sum, item) => sum + (item.price * item.quantity), 0)
      },

      // 保存到本地存储
      saveToStorage() {
        console.log('Saving cart to storage:', cartState.items)
        localStorage.setItem('cart', JSON.stringify(cartState.items))
      },

      // 从本地存储加载
      loadFromStorage() {
        const stored = localStorage.getItem('cart')
        if (stored) {
          const items = JSON.parse(stored)
          cartState.items = items
          console.log('Loaded cart from storage:', cartState.items)
        }
      }
    }

    // 初始化时从本地存储加载
    cart.loadFromStorage()

    // 将购物车实例添加到全局属性
    app.config.globalProperties.$cart = cart
    
    // 提供可注入的值
    app.provide('cart', cart)
  }
} 