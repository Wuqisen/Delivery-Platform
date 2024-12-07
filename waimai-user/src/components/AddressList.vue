<template>
  <div class="address-list">
    <div class="header">
      <h2>我的地址</h2>
      <router-link to="/address/add" class="add-btn">添加新地址</router-link>
    </div>
    <div class="address-items" v-if="addresses.length">
      <div v-for="address in addresses" :key="address.id" class="address-item">
        <div class="info">
          <p class="name">{{ address.name }} {{ address.phone }}</p>
          <p class="detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.address }}</p>
        </div>
        <div class="actions">
          <button @click="editAddress(address.id)">编辑</button>
          <button @click="deleteAddress(address.id)">删除</button>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      暂无收货地址，请添加
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

export default {
  name: 'AddressList',
  setup() {
    const addresses = ref([])
    const router = useRouter()

    const fetchAddresses = async () => {
      try {
        const response = await axios.get('/api/users/addresses')
        addresses.value = response.data.data
      } catch (error) {
        console.error('获取地址列表失败:', error)
      }
    }

    const deleteAddress = async (id) => {
      if (confirm('确定要删除这个地址吗？')) {
        try {
          await axios.delete(`/api/users/addresses/${id}`)
          await fetchAddresses()
        } catch (error) {
          console.error('删除地址失败:', error)
        }
      }
    }

    const editAddress = (id) => {
      router.push(`/address/edit/${id}`)
    }

    onMounted(fetchAddresses)

    return {
      addresses,
      deleteAddress,
      editAddress
    }
  }
}
</script>

<style scoped>
.address-list {
  padding: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  padding: 8px 16px;
  background-color: #1989fa;
  color: white;
  border-radius: 4px;
  text-decoration: none;
}

.address-item {
  border: 1px solid #eee;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
}

.actions button {
  margin-left: 8px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 32px;
}
</style> 