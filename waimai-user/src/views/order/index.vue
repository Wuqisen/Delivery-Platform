<template>
  <!-- ... 其他模板内容保持不变 ... -->
  <div class="order-amount">
    <span>实付款：</span>
    <span class="price">¥{{ calculateOrderAmount(order) }}</span>
  </div>
</template>

<script setup>
// ... 其他代码保持不变 ...

// 计算订单金额（商品总额 + 配送费）
const calculateOrderAmount = (order) => {
  // 计算商品总额
  const subtotal = order.items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0
    const quantity = parseInt(item.quantity) || 0
    return sum + (price * quantity)
  }, 0)
  
  // 加上配送费
  const deliveryFee = parseFloat(order.delivery_fee) || 0
  return (subtotal + deliveryFee).toFixed(2)
}
</script> 