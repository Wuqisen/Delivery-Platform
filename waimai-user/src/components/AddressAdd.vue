<template>
  <div class="address-form">
    <h2>{{ isEdit ? '编辑地址' : '新增地址' }}</h2>
    <form @submit.prevent="submitForm">
      <div class="form-item">
        <label>收货人姓名</label>
        <input v-model="form.name" required />
      </div>
      <div class="form-item">
        <label>手机号码</label>
        <input v-model="form.phone" type="tel" required />
      </div>
      <div class="form-item">
        <label>省份</label>
        <input v-model="form.province" required />
      </div>
      <div class="form-item">
        <label>城市</label>
        <input v-model="form.city" required />
      </div>
      <div class="form-item">
        <label>区县</label>
        <input v-model="form.district" required />
      </div>
      <div class="form-item">
        <label>详细地址</label>
        <input v-model="form.address" required />
      </div>
      <div class="form-actions">
        <button type="submit">保存</button>
        <button type="button" @click="$router.back()">取消</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'AddressAdd',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isEdit = ref(false)
    const form = ref({
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      address: ''
    })

    const submitForm = async () => {
      try {
        if (isEdit.value) {
          await axios.put(`/api/users/addresses/${route.params.id}`, form.value)
        } else {
          await axios.post('/api/users/addresses', form.value)
        }
        router.push('/address/list')
      } catch (error) {
        console.error('保存地址失败:', error)
      }
    }

    onMounted(async () => {
      if (route.params.id) {
        isEdit.value = true
        try {
          const response = await axios.get(`/api/users/addresses/${route.params.id}`)
          form.value = response.data.data
        } catch (error) {
          console.error('获取地址详情失败:', error)
        }
      }
    })

    return {
      form,
      isEdit,
      submitForm
    }
  }
}
</script>

<style scoped>
.address-form {
  padding: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
}

.form-item input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.form-actions button {
  padding: 8px 16px;
  border-radius: 4px;
}

.form-actions button[type="submit"] {
  background-color: #1989fa;
  color: white;
  border: none;
}

.form-actions button[type="button"] {
  background-color: white;
  border: 1px solid #ddd;
}
</style> 