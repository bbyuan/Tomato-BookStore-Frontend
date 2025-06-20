<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import defaultAvatar from '@/assets/logo.png'

const router = useRouter()
const searchInput = ref('')
const isLoggedIn = ref(true)
const activeTab = ref('1')
const userAvatar = ref('')
const isSearching = ref(false)

const fetchUserAvatar = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (!token || !username) {
      console.error('未找到token或用户名')
      isLoggedIn.value = false
      return
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/accounts/${username}`, {
      method: 'GET',
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (data.code === '200') {
      userAvatar.value = data.data.avatar || defaultAvatar
      isLoggedIn.value = true
    } else {
      console.error('获取用户信息失败:', data.msg)
      isLoggedIn.value = false
    }
  } catch (error) {
    console.error('获取用户信息出错:', error)
    isLoggedIn.value = false
  }
}

onMounted(() => {
  fetchUserAvatar()
  
  // 根据当前路径设置activeTab
  const path = window.location.pathname
  if (path.includes('/cart')) {
    activeTab.value = '3'
  } else if (path.includes('/admin')) {
    activeTab.value = '8'
  } else if (path.includes('/homepage')) {
    activeTab.value = '1'
  } else if (path.includes('/myorders')) {
    activeTab.value = '4'
  } else if (path.includes('/account-settings')) {
    activeTab.value = '7'
  } else {
    activeTab.value = '1' // 默认主页
  }
})

const handleCommand = (command: string) => {
  if (command === 'account-settings') {
    router.push('/account-settings/account')
  } else if (command === 'logout') {
    // 处理登出逻辑
  } else if (command === 'admin-dashboard') {
    router.push('/admin/product-management')
    activeTab.value = '8' // 设置管理员后台为选中状态
  } else if (command === 'homepage') {
    router.push('/homepage')
    activeTab.value = '1' // 设置主页为选中状态
  } else if (command === 'cart') {
    router.push('/cart')
    activeTab.value = '3' // 设置购物车为选中状态
  } else if (command === 'personal-center') {
    router.push('/account-settings/account')
    activeTab.value = '7' // 设置个人中心为选中状态
  } else if (command === 'myorders') {
    router.push('/myorders')
    activeTab.value = '4' // 设置我的订单为选中状态
  }
}

const handleSearch = async () => {
  if (!searchInput.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  isSearching.value = true
  
  try {
    const token = sessionStorage.getItem('token')
    const headers: any = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['token'] = token
    }

    const keyword = searchInput.value.trim().toLowerCase()
    
    // 使用products接口获取所有产品，然后前端过滤
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products?pageNum=1&pageSize=100`, {
      method: 'GET',
      headers
    })
    
    const data = await response.json()
    console.log('获取所有产品响应:', data)

    if (data && (data.code === '200' || data.code === 200) && data.data) {
      // 前端过滤搜索结果
      const allBooks = data.data
      const searchResults = allBooks.filter((book: any) => {
        const title = book.title?.toLowerCase() || ''
        const author = book.author?.toLowerCase() || ''
        const publisher = book.publisher?.toLowerCase() || ''
        const description = book.description?.toLowerCase() || ''
        
        return title.includes(keyword) || 
               author.includes(keyword) || 
               publisher.includes(keyword) ||
               description.includes(keyword)
      })

      // 构造搜索结果数据结构
      const searchData = {
        books: searchResults,
        pageInfo: {
          pageNum: 1,
          pageSize: searchResults.length,
          hasNext: false,
          hasPrev: false,
          totalPage: 1,
          totalCount: searchResults.length
        }
      }

      sessionStorage.setItem('searchResults', JSON.stringify(searchData))
      sessionStorage.setItem('searchKeyword', searchInput.value.trim())
      
      // 触发搜索结果事件，让当前页面接收并显示搜索结果
      window.dispatchEvent(new CustomEvent('searchResults', { 
        detail: { 
          keyword: searchInput.value.trim(), 
          results: searchData 
        } 
      }))
      
      ElMessage.success(`找到 ${searchResults.length} 本相关图书`)
      
      // 移除自动跳转逻辑，让搜索结果在当前页面显示
      // 只更新URL的查询参数，不进行页面跳转
      const currentPath = router.currentRoute.value.path
      router.replace({
        path: currentPath,
        query: {
          ...router.currentRoute.value.query,
          search: searchInput.value.trim(),
          page: 1
        }
      })
    } else {
      ElMessage.error('获取图书数据失败')
      console.error('获取产品数据失败:', data)
    }
  } catch (error) {
    console.error('搜索出错:', error)
    ElMessage.error('网络错误，请稍后再试')
  } finally {
    isSearching.value = false
  }
}

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch()
  }
}
</script>

<template>
  <el-header class="header">
    <div class="header-left">
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" height="30">
        <span class="platform-name">番茄书城 Tomato BookStore</span>
      </div>
      <div class="custom-tabs">
        <input type="radio" id="tab-1" name="tabs" value="1" v-model="activeTab" checked />
        <label class="tab" for="tab-1" @click="handleCommand('homepage')">主页</label>
        <input type="radio" id="tab-2" name="tabs" value="2" v-model="activeTab" />
        <label class="tab" for="tab-2">热门活动</label>
        <input type="radio" id="tab-3" name="tabs" value="3" v-model="activeTab" />
        <label class="tab" for="tab-3" @click="handleCommand('cart')">购物车</label>
        <input type="radio" id="tab-4" name="tabs" value="4" v-model="activeTab" />
        <label class="tab" for="tab-4" @click="handleCommand('myorders')">我的订单</label>
        <input type="radio" id="tab-5" name="tabs" value="5" v-model="activeTab" />
        <label class="tab" for="tab-5">优惠券管理</label>
        <input type="radio" id="tab-6" name="tabs" value="6" v-model="activeTab" />
        <label class="tab" for="tab-6">客户服务</label>
        <input type="radio" id="tab-7" name="tabs" value="7" v-model="activeTab" />
        <label class="tab" for="tab-7" @click="handleCommand('personal-center')">个人中心</label>
        <input type="radio" id="tab-8" name="tabs" value="8" v-model="activeTab" />
        <label class="tab" for="tab-8" @click="handleCommand('admin-dashboard')">管理员后台</label>
        <span class="glider"></span>
      </div>
    </div>
    <div class="header-right">
      <div class="search-wrapper">
        <input 
          v-model="searchInput"
          type="text"
          placeholder="搜索图书..."
          class="search-input-native"
          @keydown="handleSearchKeydown"
          :disabled="isSearching"
        />
        <button 
          class="search-btn-native"
          @click="handleSearch"
          :disabled="isSearching"
        >
          <el-icon class="search-icon" :class="{ 'rotating': isSearching }">
            <Search />
          </el-icon>
        </button>
      </div>
      <el-button type="primary" class="register-btn">成为会员</el-button>
      <div class="avatar-container">
        <el-avatar
          :src="userAvatar || defaultAvatar"
        />
        <div class="status-dot" :class="{ 'logged-in': isLoggedIn }"></div>
      </div>
    </div>
  </el-header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 0 40px;
  height: 60px;
  min-height: 40px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: nowrap;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.header-left {
  display: flex;
  align-items: center;
  flex: 2;
  min-width: 0;
  gap: 30px;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 20px;
  flex-shrink: 0;
  min-width: 220px;
}

.platform-name {
  font-size: 20px;
  font-weight: bold;
  margin-left: 10px;
  background: linear-gradient(135deg, #d44c4c 0%, #ff6b6b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.custom-tabs {
  display: flex;
  position: relative;
  background-color: #fff;
  box-shadow: 0 0 1px 0 rgba(212, 76, 76, 0.15), 0 6px 12px 0 rgba(212, 76, 76, 0.15);
  padding: 5px;
  height: 40px;
  border-radius: 99px;
  width: auto;
  min-width: 800px;
  max-width: 900px;
  overflow: hidden;
  flex-shrink: 1;
}

.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  padding: 0;
  position: relative;
  z-index: 2;
  cursor: pointer;
  color: #666;
  transition: color 0.15s ease-in;
  user-select: none;
}

.glider {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  height: 30px;
  width: 100px;
  background: linear-gradient(135deg, #d44c4c 0%, #ff6b6b 100%);
  z-index: 1;
  border-radius: 99px;
  transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-tabs input[type="radio"] {
  display: none;
}

.custom-tabs input[type="radio"]:checked + label {
  color: #fff;
  z-index: 3;
}

.custom-tabs input[id="tab-1"]:checked ~ .glider {
  transform: translateY(-50%) translateX(0);
}

.custom-tabs input[id="tab-2"]:checked ~ .glider {
  transform: translateY(-50%) translateX(100px);
}

.custom-tabs input[id="tab-3"]:checked ~ .glider {
  transform: translateY(-50%) translateX(200px);
}

.custom-tabs input[id="tab-4"]:checked ~ .glider {
  transform: translateY(-50%) translateX(300px);
}

.custom-tabs input[id="tab-5"]:checked ~ .glider {
  transform: translateY(-50%) translateX(400px);
}

.custom-tabs input[id="tab-6"]:checked ~ .glider {
  transform: translateY(-50%) translateX(500px);
}

.custom-tabs input[id="tab-7"]:checked ~ .glider {
  transform: translateY(-50%) translateX(600px);
}

.custom-tabs input[id="tab-8"]:checked ~ .glider {
  transform: translateY(-50%) translateX(700px);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 450px;
  justify-content: flex-end;
}

.search-wrapper {
  position: relative;
  width: 260px;
  height: 32px;
  margin-right: 5px;
}

.search-input-native {
  width: 100%;
  height: 100%;
  padding: 0 40px 0 14px;
  border: 1px solid rgba(212, 76, 76, 0.2);
  border-radius: 16px;
  background-color: rgba(255, 241, 241, 0.8);
  font-size: 13px;
  color: #333;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
  box-shadow: 0 0 1px 0 rgba(212, 76, 76, 0.1), 0 2px 4px 0 rgba(212, 76, 76, 0.05);
}

.search-input-native::placeholder {
  color: #999;
  font-size: 13px;
}

.search-input-native:focus {
  border-color: #d44c4c;
  background-color: #fff;
  box-shadow: 0 0 1px 0 rgba(212, 76, 76, 0.3), 0 4px 8px 0 rgba(212, 76, 76, 0.15);
}

.search-input-native:hover {
  border-color: rgba(212, 76, 76, 0.4);
  background-color: #fff;
  box-shadow: 0 0 1px 0 rgba(212, 76, 76, 0.2), 0 3px 6px 0 rgba(212, 76, 76, 0.1);
}

.search-btn-native {
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  outline: none;
}

.search-btn-native:hover {
  background: linear-gradient(135deg, #d44c4c 0%, #ff6b6b 100%);
  box-shadow: 0 2px 4px rgba(212, 76, 76, 0.3);
}

.search-btn-native:hover .search-icon {
  color: white;
}

.search-icon {
  font-size: 14px;
  color: #d44c4c;
  transition: all 0.3s ease;
}

.search-icon.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.search-btn-native:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.register-btn {
  padding: 0 18px;
  height: 32px;
  font-size: 13px;
  background: linear-gradient(135deg, #d44c4c 0%, #ff6b6b 100%);
  border: none;
  border-radius: 16px;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.register-btn:hover {
  background: linear-gradient(135deg, #c43c3c 0%, #ff5b5b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 76, 76, 0.2);
}

.avatar-container {
  position: relative;
  margin-left: 5px;
}

.avatar-container :deep(.el-avatar) {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  border-radius: 50%;
  cursor: pointer;
}

.status-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #fff;
  background-color: #ddd;
}

.status-dot.logged-in {
  background-color: #67C23A;
}
</style>
