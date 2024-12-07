<template>
  <div class="dish-card">
    <div class="dish-image">
      <img :src="dish.imageUrl || '/images/default-dish.png'" :alt="dish.name">
    </div>
    <div class="dish-info">
      <h3 class="dish-name">{{ dish.name }}</h3>
      <p class="dish-desc">{{ dish.description }}</p>
      <div class="dish-sales">月售 {{ dish.sales }}</div>
      <div class="dish-bottom">
        <div class="dish-price">
          <span class="price">¥{{ dish.price }}</span>
        </div>
        <el-button 
          type="primary" 
          circle
          size="small"
          @click="handleAddToCart"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  dish: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-cart'])

const handleAddToCart = () => {
  emit('add-to-cart', props.dish)
}
</script>

<style scoped>
.dish-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.dish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.dish-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-info {
  padding: 12px;
}

.dish-name {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.dish-desc {
  margin: 8px 0;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.dish-sales {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.dish-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dish-price {
  color: #f56c6c;
}

.price {
  font-size: 18px;
  font-weight: bold;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-left: 4px;
}
</style> 