<template>
  <!-- ... 其他内容 ... -->
  <el-form-item label="商铺图片" prop="image">
    <shop-image-upload v-model="form.image" />
  </el-form-item>
  <!-- ... 其他内容 ... -->
</template>

<script setup>
import ShopImageUpload from '@/components/ShopImageUpload.vue'
// ... 其他代码 ...
</script> 