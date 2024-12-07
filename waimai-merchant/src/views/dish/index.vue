<template>
  <div class="dish-list">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <div class="operation-bar">
        <div class="search-form">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="菜品名称">
              <el-input v-model="searchForm.name" placeholder="请输入菜品名称" clearable />
            </el-form-item>
            <el-form-item label="分类">
              <el-select v-model="searchForm.categoryId" placeholder="请选择分类" clearable>
                <el-option
                  v-for="item in categories"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增菜品
        </el-button>
      </div>
    </el-card>

    <!-- 菜品列表 -->
    <el-card class="list-card">
      <el-table
        v-loading="loading"
        :data="dishList"
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="菜品名称" min-width="120" />
        <el-table-column prop="categoryName" label="所属分类" width="120" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="2"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dishAPI } from '@/api/dish'

const router = useRouter()

// 初始化表单数据
const form = reactive({
  name: '',
  categoryId: '',
  image: ''
})

// 搜索表单
const searchForm = reactive({
  name: '',
  categoryId: ''
})

// 列表数据
const loading = ref(false)
const dishList = ref([])
const categories = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取分类列表
const getCategories = async () => {
  try {
    const res = await dishAPI.getCategories()
    categories.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 获取菜品列表
const getDishes = async () => {
  try {
    loading.value = true
    const res = await dishAPI.getDishes({
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm
    })
    dishList.value = res.data.list.map(item => ({
      ...item,
      imageUrl: item.image ? `${process.env.VUE_APP_API_URL}/uploads/dishes/${item.image}` : '',
      categoryName: categories.value.find(cat => cat.id === item.category_id)?.name
    }))
    total.value = res.data.total
  } catch (error) {
    console.error('获取菜品列表失败:', error)
    ElMessage.error('获取菜品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  page.value = 1
  getDishes()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.categoryId = ''
  handleSearch()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getDishes()
}

const handleCurrentChange = (val) => {
  page.value = val
  getDishes()
}

// 新增菜品
const handleAdd = () => {
  router.push('/dishes/edit')
}

// 编辑菜品
const handleEdit = (row) => {
  router.push(`/dishes/edit/${row.id}`)
}

// 删除菜品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜品吗？', '提示', {
      type: 'warning'
    })
    await dishAPI.deleteDish(row.id)
    ElMessage.success('删除成功')
    getDishes()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除菜品失败:', error)
      ElMessage.error('删除菜品失败')
    }
  }
}

// 更新菜品状态
const handleStatusChange = async (row) => {
  try {
    await dishAPI.updateDishStatus(row.id, row.status)
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
    row.status = row.status === 1 ? 2 : 1 // 恢复状态
  }
}

onMounted(() => {
  getCategories()
  getDishes()
})
</script>

<style scoped>
.dish-list {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.dish-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 