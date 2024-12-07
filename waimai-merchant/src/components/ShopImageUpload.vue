<template>
  <div class="image-upload">
    <el-upload
      :action="`${uploadUrl}/shops/image`"
      :headers="headers"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
    >
      <img v-if="modelValue" :src="modelValue" class="preview">
      <el-icon v-else class="upload-icon"><Plus /></el-icon>
    </el-upload>
  </div>
</template>

<script setup>
// ... 其他代码与 ImageUpload.vue 相同 ...
</script>

<style scoped>
.image-upload {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.image-upload:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 