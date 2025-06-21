<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import defaultAvatar from '@/assets/logo.png'
import { ArrowDown, Setting, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const searchInput = ref('')
const isLoggedIn = ref(true)
const activeTab = ref('1')
const userAvatar = ref('')
const username = ref('用户')
const isSearching = ref(false)
const showSearchDropdown = ref(false)
const searchResults = ref([])
const selectedIndex = ref(-1)
const searchBoxRef = ref(null)

const fetchUserAvatar = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const storedUsername = sessionStorage.getItem('username')

    if (!token || !storedUsername) {
      console.error('未找到token或用户名')
      isLoggedIn.value = false
      return
    }

    // 将存储的用户名赋值给ref变量
    username.value = storedUsername

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/accounts/${storedUsername}`, {
      method: 'GET',
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (data.code === '200') {
      userAvatar.value = data.data.avatar || defaultAvatar
      // 如果API返回了用户名，使用API返回的用户名
      if (data.data.username) {
        username.value = data.data.username
      }
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
  
  // 添加全局点击事件监听器
  document.addEventListener('click', handleClickOutside)
  
  // 监听路由变化来更新activeTab
  updateActiveTab()
})

// 添加路由监听器
import { watch } from 'vue'

watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    // 延迟更新以避免闪烁
    setTimeout(() => {
      updateActiveTab(newPath)
    }, 50)
  }
)

// 更新激活标签的函数
const updateActiveTab = (path?: string) => {
  const currentPath = path || router.currentRoute.value.path
  
  if (currentPath.includes('/cart')) {
    activeTab.value = '3'
  } else if (currentPath.includes('/admin')) {
    activeTab.value = '8'
  } else if (currentPath.includes('/myorders')) {
    activeTab.value = '4'
  } else if (currentPath.includes('/myevaluation') || currentPath.includes('/MyEvaluation')) {
    activeTab.value = '5'
  } else if (currentPath.includes('/account-settings')) {
    activeTab.value = '7'
  } else if (currentPath.includes('/homepage') || currentPath === '/') {
    activeTab.value = '1'
  }
  // 移除else分支，避免意外重置
}

onUnmounted(() => {
  // 清理全局点击事件监听器
  document.removeEventListener('click', handleClickOutside)
})

const handleCommand = (command: string) => {
  // 立即设置activeTab，避免闪烁
  if (command === 'account-settings') {
    activeTab.value = '7'
    setTimeout(() => router.push('/account-settings/account'), 0)
  } else if (command === 'logout') {
    // 处理登出逻辑
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')
    router.push('/')
  } else if (command === 'admin-dashboard') {
    activeTab.value = '8'
    setTimeout(() => router.push('/admin/product-management'), 0)
  } else if (command === 'homepage') {
    activeTab.value = '1'
    setTimeout(() => router.push('/homepage'), 0)
  } else if (command === 'cart') {
    activeTab.value = '3'
    setTimeout(() => router.push('/cart'), 0)
  } else if (command === 'my-evaluation') {
    activeTab.value = '5'
    setTimeout(() => router.push('/myevaluation'), 0)
  } else if (command === 'personal-center') {
    activeTab.value = '7'
    setTimeout(() => router.push('/account-settings/account'), 0)
  } else if (command === 'myorders') {
    activeTab.value = '4'
    setTimeout(() => router.push('/myorders'), 0)
  }
}

const handleSearch = async () => {
  if (!searchInput.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  isSearching.value = true
  
  try {
    // 添加一个最小加载时间，确保用户能看到加载动画
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 800))
    
    const token = sessionStorage.getItem('token')
    const headers: any = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['token'] = token
    }

    const keyword = searchInput.value.trim().toLowerCase()
    
    // 使用products接口获取所有产品，然后前端过滤
    const searchPromise = fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products?pageNum=1&pageSize=100`, {
      method: 'GET',
      headers
    })
    
    // 等待最小加载时间和搜索请求都完成
    const [response] = await Promise.all([searchPromise, minLoadingTime])
    
    const data = await response.json()
    console.log('获取所有产品响应:', data)

    if (data && (data.code === '200' || data.code === 200) && data.data) {
      // 前端过滤搜索结果
      const allBooks = data.data
      const filteredResults = allBooks.filter((book: any) => {
        const title = book.title?.toLowerCase() || ''
        const author = book.author?.toLowerCase() || ''
        const publisher = book.publisher?.toLowerCase() || ''
        const description = book.description?.toLowerCase() || ''
        
        return title.includes(keyword) || 
               author.includes(keyword) || 
               publisher.includes(keyword) ||
               description.includes(keyword)
      })

      // 更新搜索结果状态
      searchResults.value = filteredResults
      // 无论是否有结果都显示下拉框
      showSearchDropdown.value = true

      // 构造搜索结果数据结构
      const searchData = {
        books: filteredResults,
        pageInfo: {
          pageNum: 1,
          pageSize: filteredResults.length,
          hasNext: false,
          hasPrev: false,
          totalPage: 1,
          totalCount: filteredResults.length
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

// 高亮匹配文本的函数
const highlightMatch = (text: string, keyword: string) => {
  if (!text || !keyword) return text
  
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<span class="search-match-highlight">$1</span>')
}

// 处理搜索结果项的点击
const handleResultClick = (book: any) => {
  // 隐藏下拉框
  showSearchDropdown.value = false
  // 跳转到图书详情页，使用与ProductShow相同的跳转方式
  router.push({
    name: 'Detail',
    params: { id: book.id.toString() }
  })
}

// 处理搜索输入框聚焦
const handleSearchFocus = () => {
  if (searchInput.value.trim() && searchResults.value.length > 0) {
    showSearchDropdown.value = true
  }
}

// 处理搜索输入框失去焦点
const handleSearchBlur = () => {
  // 延迟隐藏搜索下拉框，以防止点击事件被触发
  setTimeout(() => {
    showSearchDropdown.value = false
  }, 200)
}

// 处理点击外部区域收回下拉栏
const handleClickOutside = (event: Event) => {
  if (searchBoxRef.value && !searchBoxRef.value.contains(event.target as Node)) {
    showSearchDropdown.value = false
    selectedIndex.value = -1
  }
}

// 处理键盘上下箭头选择搜索结果
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (selectedIndex.value < searchResults.value.length - 1) {
      selectedIndex.value++
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
  } else if (event.key === 'Enter') {
    event.preventDefault()
    if (selectedIndex.value >= 0 && selectedIndex.value < searchResults.value.length) {
      handleResultClick(searchResults.value[selectedIndex.value])
    }
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
      <nav class="nav-menu">
        <div class="nav-item" :class="{ active: activeTab === '1' }" @click="handleCommand('homepage')">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">主页</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === '3' }" @click="handleCommand('cart')">
          <span class="nav-icon">🛒</span>
          <span class="nav-text">购物车</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === '4' }" @click="handleCommand('myorders')">
          <span class="nav-icon">📋</span>
          <span class="nav-text">订单</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === '5' }" @click="handleCommand('my-evaluation')">
          <span class="nav-icon">⭐</span>
          <span class="nav-text">评价</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === '7' }" @click="handleCommand('personal-center')">
          <span class="nav-icon">👤</span>
          <span class="nav-text">个人</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === '8' }" @click="handleCommand('admin-dashboard')">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">后台</span>
        </div>
      </nav>
    </div>
    <div class="header-right">
      <div class="search-box" ref="searchBoxRef">
        <el-input
          v-model="searchInput"
          placeholder="搜索图书..."
          :prefix-icon="Search"
          class="search-input"
          clearable
          @keydown="handleSearchKeydown"
          @focus="handleSearchFocus"
          @blur="handleSearchBlur"
          :disabled="isSearching"
        >
          <template #suffix v-if="isSearching">
            <div class="search-loading">
              <img src="@/assets/logo.png" alt="Loading" class="loading-logo" />
              <span class="loading-text">搜索中...</span>
            </div>
          </template>
        </el-input>
        <div v-if="showSearchDropdown && searchResults.length > 0" class="search-dropdown">
          <div 
            v-for="(book, index) in searchResults" 
            :key="book.id" 
            class="search-result-item"
            :class="{ 'selected': selectedIndex === index }"
            @click="handleResultClick(book)"
            @mouseover="selectedIndex = index"
            @mouseleave="selectedIndex = -1"
          >
            <div class="result-item-cover">
              <img :src="book.cover || book.image" :alt="book.title" class="book-cover-img" />
            </div>
            <div class="result-item-content">
              <div class="result-item-title" v-html="highlightMatch(book.title, searchInput)"></div>
              <div class="result-item-info">
                <span class="result-item-author">{{ book.author }}</span>
                <span class="result-item-publisher">{{ book.publisher }}</span>
              </div>
              <div class="result-item-description" v-html="highlightMatch(book.description, searchInput)"></div>
              <div class="result-item-price">价格: ¥{{ book.price.toFixed(2) }}</div>
            </div>
          </div>
        </div>
        <div v-else-if="showSearchDropdown" class="search-dropdown">
          <div class="search-no-results">
            <div class="search-no-results-icon">
              <el-icon size="24">
                <Search />
              </el-icon>
            </div>
            <div class="search-no-results-text">暂无相关书籍</div>
            <div class="search-no-results-hint">试试搜索其他关键词</div>
          </div>
        </div>
      </div>
      
      <!-- 用户信息区域 -->
      <el-dropdown @command="handleCommand" class="user-dropdown" trigger="hover">
        <div class="user-info">
          <el-avatar
            :size="36"
            :src="userAvatar || defaultAvatar"
            class="user-avatar"
          />
          <div class="user-details">
            <span class="user-name">{{ username }}</span>
            <span class="user-status">在线</span>
          </div>
          <el-icon class="dropdown-icon">
            <ArrowDown />
          </el-icon>
        </div>
        
        <template #dropdown>
          <el-dropdown-menu class="user-menu">
            <el-dropdown-item command="account-settings" class="menu-item">
              <el-icon><Setting /></el-icon>
              <span>账户设置</span>
            </el-dropdown-item>
            <el-dropdown-item command="logout" class="menu-item logout-item">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 0 32px;
  height: 64px;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 0;
}

.logo {
  margin-left: 25px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.platform-name {
  font-size: 20px;
  font-weight: 700;
  margin-left: 18px;
  margin-right: 50px;
  background: linear-gradient(135deg, #e4393c, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

/* 现代导航菜单 - 确保横向排布 */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 16px;
  flex-wrap: nowrap;
  overflow: hidden;
  flex-shrink: 1;
  min-width: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #e4393c;
}

.nav-item.active {
  background: #e4393c;
  color: white;
}

.nav-item.active:hover {
  background: #d63384;
}

.nav-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.nav-text {
  font-size: 14px;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.search-box {
  width: 320px;
  position: relative;
  flex-shrink: 0;
}

/* 搜索框样式保持简洁 */
:deep(.el-input__wrapper) {
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: none;
  transition: all 0.2s ease;
  margin-left: -50px;
}

:deep(.el-input__wrapper:hover) {
  border-color: #e4393c;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #e4393c;
  box-shadow: 0 0 0 3px rgba(228, 57, 60, 0.1);
}

/* 用户信息区域 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.user-info:hover {
  background: #f8f9fa;
}

.user-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1;
}

.user-status {
  font-size: 12px;
  color: #22c55e;
  line-height: 1;
}

.dropdown-icon {
  font-size: 14px;
  color: #999;
  transition: transform 0.2s ease;
}

.user-info:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 下拉菜单 */
:deep(.el-dropdown-menu.user-menu) {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 140px;
}

:deep(.el-dropdown-menu__item.menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  margin: 2px 0;
}

:deep(.el-dropdown-menu__item.menu-item:hover) {
  background: #f8f9fa;
  color: #e4393c;
}

:deep(.el-dropdown-menu__item.logout-item:hover) {
  background: #fef2f2;
  color: #dc2626;
}

/* 搜索下拉框样式简化 */
.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
}

.search-result-item:hover,
.search-result-item.selected {
  background: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-item-cover {
  width: 48px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.book-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-item-content {
  flex: 1;
  min-width: 0;
}

.result-item-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-item-info {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.result-item-author,
.result-item-publisher {
  font-size: 12px;
  color: #666;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.result-item-description {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-item-price {
  font-size: 14px;
  color: #e4393c;
  font-weight: 600;
}

.search-match-highlight {
  background: #fef3c7;
  color: #92400e;
  padding: 1px 2px;
  border-radius: 2px;
}

.search-no-results {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.search-no-results-text {
  font-size: 14px;
  margin-bottom: 4px;
}

.search-no-results-hint {
  font-size: 12px;
  color: #ccc;
}

/* 加载状态 */
.search-loading {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e4393c;
}

.loading-logo {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 12px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-left {
    gap: 16px;
  }
  
  .nav-menu {
    gap: 4px;
    margin-left: 12px;
  }
  
  .nav-item {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .search-box {
    width: 260px;
  }
  
  .platform-name {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .header-left {
    gap: 12px;
  }
  
  .nav-menu {
    gap: 2px;
    margin-left: 8px;
  }
  
  .nav-item {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .search-box {
    width: 200px;
  }
  
  .platform-name {
    font-size: 16px;
    margin-left: 8px;
    margin-right: 20px;
  }
}

@media (max-width: 640px) {
  .nav-item .nav-text {
    display: none;
  }
  
  .nav-item {
    padding: 8px;
    min-width: 36px;
    justify-content: center;
  }
  
  .platform-name {
    font-size: 14px;
    margin-right: 10px;
  }
}
</style>
