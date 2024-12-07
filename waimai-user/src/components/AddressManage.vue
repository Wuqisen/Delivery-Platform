<template>
  <div class="address-manage">
    <div class="header">
      <el-page-header @back="$router.back()" title="返回" content="地址管理" />
    </div>

    <!-- 地址列表 -->
    <div class="address-list" v-if="addresses.length > 0">
      <div v-for="address in addresses" :key="address.id" class="address-item">
        <div class="address-info">
          <div class="user-info">
            <span class="name">{{ address.name }}</span>
            <span class="phone">{{ address.phone }}</span>
            <span class="tag" v-if="address.is_default">默认</span>
          </div>
          <div class="address">{{ address.address }}</div>
        </div>
        <div class="actions">
          <el-button type="text" @click="editAddress(address)">编辑</el-button>
          <el-button type="text" @click="deleteAddress(address.id)">删除</el-button>
          <el-button 
            v-if="!address.is_default" 
            type="text" 
            @click="setDefault(address.id)"
          >
            设为默认
          </el-button>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无收货地址" />

    <!-- 添加地址按钮 -->
    <div class="add-btn" @click="showAddressForm">
      <el-button type="primary" size="large" style="width: 100%;">
        新增收货地址
      </el-button>
    </div>

    <!-- 地址表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑地址' : '新增地址'"
      width="90%"
    >
      <el-form 
        ref="addressForm"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="联系人" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="收货地址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.is_default">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userAPI } from '../api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const addresses = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const currentId = ref(null)

// 表单数据
const form = ref({
  name: '',
  phone: '',
  address: '',
  is_default: false
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
  ]
}

// 加载地址列表
const loadAddresses = async () => {
  try {
    const response = await userAPI.getAddresses()
    addresses.value = response.data
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  }
}

// 显示新增地址表单
const showAddressForm = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    name: '',
    phone: '',
    address: '',
    is_default: false
  }
  dialogVisible.value = true
}

// 编辑地址
const editAddress = (address) => {
  isEdit.value = true
  currentId.value = address.id
  form.value = {
    name: address.name,
    phone: address.phone,
    address: address.address,
    is_default: address.is_default
  }
  dialogVisible.value = true
}

// 删除地址
const deleteAddress = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？')
    await userAPI.deleteAddress(id)
    ElMessage.success('删除成功')
    loadAddresses()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除地址失败:', error)
      ElMessage.error('删除地址失败')
    }
  }
}

// 设置默认地址
const setDefault = async (id) => {
  try {
    await userAPI.setDefaultAddress(id)
    ElMessage.success('设置成功')
    loadAddresses()
  } catch (error) {
    console.error('设置默认地址失败:', error)
    ElMessage.error('设置默认地址失败')
  }
}

// 提交表单
const submitForm = async () => {
  try {
    submitting.value = true
    if (isEdit.value) {
      await userAPI.updateAddress(currentId.value, form.value)
    } else {
      await userAPI.addAddress(form.value)
    }
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
    dialogVisible.value = false
    loadAddresses()
  } catch (error) {
    console.error('保存地址失败:', error)
    ElMessage.error('保存地址失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
.address-manage {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.header {
  background: white;
  padding: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.address-list {
  padding: 16px;
}

.address-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.user-info {
  margin-bottom: 8px;
}

.name {
  font-size: 16px;
  font-weight: bold;
  margin-right: 12px;
}

.phone {
  color: #666;
}

.tag {
  background: #f56c6c;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.address {
  color: #333;
  font-size: 14px;
  line-height: 1.4;
}

.actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 16px;
}

.add-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style> 