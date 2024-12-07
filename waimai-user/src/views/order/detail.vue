<template>
  <!-- ... 其他模板内容保持不变 ... -->
  <div class="amount-info">
    <div class="amount-item">
      <span>商品总额：</span>
      <span>¥{{ getSubtotal() }}</span>
    </div>
    <div class="amount-item">
      <span>配送费：</span>
      <span>¥{{ formatAmount(orderInfo.delivery_fee) }}</span>
    </div>
    <div class="amount-item total">
      <span>实付款：</span>
      <span>¥{{ getTotalAmount() }}</span>
    </div>
  </div>
</template>

<script setup>
// ... 其他代码保持不变 ...

// 计算商品总额（不含配送费）
const getSubtotal = () => {
  if (!orderInfo.value.items) return '0.00'
  return orderInfo.value.items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0
    const quantity = parseInt(item.quantity) || 0
    return sum + (price * quantity)
  }, 0).toFixed(2)
}

// 计算订单总额（商品总额 + 配送费）
const getTotalAmount = () => {
  const subtotal = parseFloat(getSubtotal()) || 0
  const deliveryFee = parseFloat(orderInfo.value.delivery_fee) || 0
  return (subtotal + deliveryFee).toFixed(2)
}

// 格式化金��
const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}
</script> 