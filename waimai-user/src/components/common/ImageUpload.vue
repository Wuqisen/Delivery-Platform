<template>
  <div class="image-upload">
    <div 
      v-for="(url, index) in previewUrls" 
      :key="index"
      class="image-item"
    >
      <img :src="url" alt="预览图">
      <div class="delete-btn" @click="removeImage(index)">×</div>
    </div>

    <div 
      v-if="previewUrls.length < maxCount"
      class="upload-btn"
      @click="$refs.fileInput.click()"
    >
      <span>+</span>
      <input 
        type="file"
        ref="fileInput"
        :accept="accept"
        :multiple="multiple"
        style="display: none"
        @change="handleFileChange"
      >
    </div>
  </div>
</template>

<script>
import { uploadAPI } from '@/api/upload'

export default {
  name: 'ImageUpload',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      required: true
    },
    maxCount: {
      type: Number,
      default: 9
    },
    multiple: {
      type: Boolean,
      default: false
    },
    accept: {
      type: String,
      default: 'image/*'
    }
  },
  data() {
    return {
      previewUrls: []
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.previewUrls = val
      }
    }
  },
  methods: {
    async handleFileChange(event) {
      const files = Array.from(event.target.files)
      if (!files.length) return

      try {
        if (this.multiple) {
          const { data } = await uploadAPI.uploadMultipleFiles(this.type, files)
          this.previewUrls.push(...data.map(file => file.url))
        } else {
          const { data } = await uploadAPI.uploadFile(this.type, files[0])
          this.previewUrls.push(data.url)
        }
        this.$emit('input', this.previewUrls)
        this.$emit('upload-success', this.previewUrls)
      } catch (error) {
        console.error('上传失败:', error)
        this.$emit('upload-error', error)
      }
      
      // 清空input，以便可以上传相同的文件
      event.target.value = ''
    },
    removeImage(index) {
      this.previewUrls.splice(index, 1)
      this.$emit('input', this.previewUrls)
    }
  }
}
</script>

<style scoped>
.image-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  background: rgba(0,0,0,0.5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-btn {
  width: 100px;
  height: 100px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-btn span {
  font-size: 24px;
  color: #999;
}
</style> 