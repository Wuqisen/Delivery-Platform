<template>
  <div class="dish-edit">
    <el-page-header 
      @back="$router.back()" 
      :title="id ? '编辑菜品' : '新增菜品'"
    />
    
    <el-card class="edit-card">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜品名称" />
        </el-form-item>

        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="菜品价格" prop="price">
          <el-input-number 
            v-model="form.price" 
            :precision="2" 
            :step="0.1" 
            :min="0"
          />
        </el-form-item>

        <el-form-item label="菜品图片" prop="image">
          <el-upload
            class="dish-uploader"
            :action="`${baseUrl}/upload/dish`"
            :headers="uploadHeaders"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <img v-if="imageUrl" :src="imageUrl" class="uploaded-image">
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="菜品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            rows="3"
            placeholder="请输入菜品描述"
          />
        </el-form-item>

        <el-form-item label="上架状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="2"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            保存
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { merchantAPI } from '@/api/merchant'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const id = route.params.id

// 基础配置
const baseUrl = process.env.VUE_APP_API_URL
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('merchant_token')}`
}

// 表单数据
const form = reactive({
  name: '',
  categoryId: '',
  price: 0,
  image: '',
  description: '',
  status: 1
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入菜品名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择所属分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入菜品价格', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传菜品图片', trigger: 'change' }
  ]
}

// 其他数据
const categories = ref([])
const imageUrl = ref('')
const submitting = ref(false)

// 获取分类列表
const getCategories = async () => {
  try {
    const res = await merchantAPI.getDishes({ type: 'category' })
    categories.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 获取菜品详情
const getDishDetail = async () => {
  try {
    const res = await merchantAPI.getDishes(id)
    Object.assign(form, res.data)
    imageUrl.value = form.image ? `${baseUrl}/uploads/dishes/${form.image}` : ''
  } catch (error) {
    console.error('获取菜品详情失败:', error)
    ElMessage.error('获取菜品详情失败')
  }
}

// 图片上传相关
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleUploadSuccess = (res) => {
  form.image = res.data.filename
  imageUrl.value = `${baseUrl}/uploads/dishes/${res.data.filename}`
}

const handleUploadError = () => {
  ElMessage.error('上传失败')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true

    if (id) {
      await merchantAPI.updateDish(id, form)
      ElMessage.success('更新成功')
    } else {
      await merchantAPI.addDish(form)
      ElMessage.success('添加成功')
    }
    
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  getCategories()
  if (id) {
    getDishDetail()
  }
})
</script>

<style scoped>
.dish-edit {
  padding: 20px;
}

.edit-card {
  margin-top: 20px;
  max-width: 800px;
}

.dish-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.dish-uploader:hover {
  border-color: #409EFF;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.uploaded-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}
</style> 