import { reactive } from 'vue'

export const cartStore = reactive({
  items: [],
  shopId: null,
  shopName: null,

  // 添加商品到购物车
  addItem(dish) {
    // 如果是不同商家的商品，清空购物车
    if (this.shopId && this.shopId !== dish.shop_id) {
      if (!confirm('添加其他商家的商品会清空当前购物车，是否继续？')) {
        return
      }
      this.clear()
    }
    
    this.shopId = dish.shop_id
    this.shopName = dish.shop_name
    
    const existingItem = this.items.find(item => item.id === dish.id)
    if (existingItem) {
      existingItem.quantity++
    } else {
      this.items.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: 1
      })
    }
  },

  // 从购物车移除商品
  removeItem(dishId) {
    const index = this.items.findIndex(item => item.id === dishId)
    if (index > -1) {
      if (this.items[index].quantity > 1) {
        this.items[index].quantity--
      } else {
        this.items.splice(index, 1)
      }
    }
    
    // 如果购物车为空，重置商家ID
    if (this.items.length === 0) {
      this.shopId = null
    }
  },

  // 清空购物车
  clear() {
    this.items = []
    this.shopId = null
    this.shopName = null
  },

  // 获取购物车总价
  get total() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  // 获取商品总数
  get count() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }
}) 