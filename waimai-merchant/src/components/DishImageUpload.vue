<template>
  <div class="image-upload">
    <el-upload
      :action="`${uploadUrl}/dishes/image`"
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
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])

const uploadUrl = `${import.meta.env.VITE_API_URL}/upload`

const headers = computed(() => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
}))

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  return true
}

const handleSuccess = (res) => {
  if (res.code === 0) {
    emit('update:modelValue', res.data.url)
  } else {
    ElMessage.error(res.msg || '上传失败')
  }
}

const handleError = () => {
  ElMessage.error('上传失败')
}
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