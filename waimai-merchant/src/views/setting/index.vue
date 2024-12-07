<template>
  <div class="setting">
    <el-card class="setting-card">
      <template #header>
        <div class="card-header">
          <span>店铺设置</span>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存修改
          </el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <!-- 基本信息 -->
        <div class="section">
          <h3>基本信息</h3>
          <el-form-item label="店铺名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入店铺名称" />
          </el-form-item>

          <el-form-item label="店铺Logo" prop="image">
            <el-upload
              class="shop-uploader"
              :action="`${baseUrl}/upload/shop`"
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

          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" />
          </el-form-item>

          <el-form-item label="店铺地址" prop="address">
            <el-input v-model="form.address" placeholder="请输入店铺地址" />
          </el-form-item>

          <el-form-item label="店铺公告" prop="notice">
            <el-input
              v-model="form.notice"
              type="textarea"
              rows="3"
              placeholder="请输入店铺公告"
            />
          </el-form-item>
        </div>

        <!-- 配送设置 -->
        <div class="section">
          <h3>配送设置</h3>
          <el-form-item label="配送费" prop="deliveryFee">
            <el-input-number
              v-model="form.deliveryFee"
              :precision="2"
              :step="0.5"
              :min="0"
            />
          </el-form-item>

          <el-form-item label="起送金额" prop="minDelivery">
            <el-input-number
              v-model="form.minDelivery"
              :precision="2"
              :step="1"
              :min="0"
            />
          </el-form-item>

          <el-form-item label="配送时间" prop="deliveryTime">
            <el-input-number
              v-model="form.deliveryTime"
              :min="1"
              :max="120"
            >
              <template #suffix>分钟</template>
            </el-input-number>
          </el-form-item>
        </div>

        <!-- 营业设置 -->
        <div class="section">
          <h3>营业设置</h3>
          <el-form-item label="营业状态">
            <el-switch
              v-model="form.status"
              :active-value="1"
              :inactive-value="2"
              :active-text="form.status === 1 ? '营业中' : '休息中'"
            />
          </el-form-item>

          <el-form-item label="营业时间">
            <div class="business-hours">
              <div v-for="(time, index) in form.businessHours" :key="index" class="time-range">
                <el-time-picker
                  v-model="time.start"
                  format="HH:mm"
                  placeholder="开始时间"
                />
                <span class="separator">至</span>
                <el-time-picker
                  v-model="time.end"
                  format="HH:mm"
                  placeholder="结束时间"
                />
                <el-button 
                  type="danger" 
                  link 
                  @click="removeTimeRange(index)"
                  v-if="form.businessHours.length > 1"
                >
                  删除
                </el-button>
              </div>
              <el-button 
                type="primary" 
                link 
                @click="addTimeRange"
                v-if="form.businessHours.length < 3"
              >
                添加时间段
              </el-button>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { merchantAPI } from '@/api/merchant'

const formRef = ref(null)
const saving = ref(false)

// 基础配置
const baseUrl = process.env.VUE_APP_API_URL
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('merchant_token')}`
}

// 表单数据
const form = reactive({
  name: '',
  image: '',
  phone: '',
  address: '',
  notice: '',
  deliveryFee: 0,
  minDelivery: 0,
  deliveryTime: 30,
  status: 1,
  businessHours: [
    { start: '', end: '' }
  ]
})

// 图片URL
const imageUrl = ref('')

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入店铺名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传店铺Logo', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入店铺地址', trigger: 'blur' }
  ],
  deliveryFee: [
    { required: true, message: '请设置配送费', trigger: 'blur' }
  ],
  minDelivery: [
    { required: true, message: '请设置起送金额', trigger: 'blur' }
  ]
}

// 获取店铺信息
const getShopInfo = async () => {
  try {
    const res = await merchantAPI.getInfo()
    const shopInfo = res.data
    Object.assign(form, shopInfo)
    imageUrl.value = shopInfo.image ? `${baseUrl}/uploads/shops/${shopInfo.image}` : ''
    
    // 处理营业时间
    if (shopInfo.businessHours && shopInfo.businessHours.length > 0) {
      form.businessHours = shopInfo.businessHours
    }
  } catch (error) {
    console.error('获取店铺信息失败:', error)
    ElMessage.error('获取店铺信息失败')
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
  imageUrl.value = `${baseUrl}/uploads/shops/${res.data.filename}`
}

const handleUploadError = () => {
  ElMessage.error('上传失败')
}

// 营业时间相关
const addTimeRange = () => {
  form.businessHours.push({ start: '', end: '' })
}

const removeTimeRange = (index) => {
  form.businessHours.splice(index, 1)
}

// 保存设置
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    saving.value = true

    // 验证营业时间
    const invalidTime = form.businessHours.some(time => !time.start || !time.end)
    if (invalidTime) {
      return ElMessage.warning('请完整填写营业时间')
    }

    await merchantAPI.updateInfo(form)
    ElMessage.success('保存成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  getShopInfo()
})
</script>

<style scoped>
.setting {
  padding: 20px;
}

.setting-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section {
  margin-bottom: 30px;
}

.section h3 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  font-weight: bold;
}

.shop-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.shop-uploader:hover {
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

.business-hours {
  .time-range {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .separator {
    margin: 0 10px;
  }
}
</style> 