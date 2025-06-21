<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Header from './Header.vue'
import AsideLeft from './Aside-left.vue'

// 路由相关
const route = useRoute()
const router = useRouter()

// 响应式数据
const currentCategory = ref('')
const categoryBooks = ref<any[]>([])
const loading = ref(false)
const error = ref('')

// 购物车相关状态
const addingToCartId = ref<number | null>(null)
const cartMessage = ref('')
const showCartResult = ref(false)
const isCartSuccess = ref(false)

// 分页相关数据
const pageSize = ref(20)
const pageNum = ref(1)
const totalPage = ref(0)
const totalCount = ref(0)
const hasNext = ref(false)
const hasPrev = ref(false)
const pageNumInput = ref('')

// 中英文分类映射
const categoryMapping = {
  '小说': 'Novel',
  '散文': 'Essay', 
  '悬疑推理': 'MysteryThriller',
  '文学理论': 'LiteraryTheory',
  '文集': 'Anthology',
  '世界名著': 'WorldClassics',
  '历史': 'History',
  '哲学': 'Philosophy',
  '宗教': 'Religion',
  '社会科学': 'SocialScience',
  '政治': 'Politics',
  '军事': 'Military',
  '传记': 'Biography',
  '文化': 'Culture',
  '管理': 'Management',
  '经济': 'Economics',
  '法律': 'Law',
  '儿童文学': 'ChildrenLiterature',
  '绘本': 'PictureBook',
  '动漫': 'Animation',
  '绘画': 'Painting',
  '书法': 'Calligraphy',
  '音乐': 'Music',
  '摄影': 'Photography',
  '美食': 'Cuisine',
  '旅游': 'Travel',
  '家庭教育': 'FamilyEducation',
  '教材': 'Textbook',
  '医学': 'Medicine',
  '计算机': 'ComputerScience',
  '自然科学': 'NaturalScience',
  '未设置': 'NOT_SET'
}

// 获取中文分类名用于显示
const getChineseCategoryName = (englishName: string) => {
  // 反向查找中文名称
  for (const [chinese, english] of Object.entries(categoryMapping)) {
    if (english === englishName) {
      return chinese
    }
  }
  return englishName // 如果找不到映射，直接返回英文名
}

// 计算折扣
const calculateDiscount = (price: number, originalPrice: number) => {
  if (originalPrice === 0) return 0
  return Math.round((price / originalPrice) * 10)
}

// 获取分类商品数据
const fetchCategoryBooks = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = sessionStorage.getItem('token')
    
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录'
      return
    }
    
    const categoryParam = route.params.category as string
    const response = await axios.get(`/api/products/category/${categoryParam}`, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('分类商品API响应数据:', response.data)
    
    if (response.data && response.data.code === '200') {
      const data = response.data.data
      const books = data.books || []
      
      categoryBooks.value = books.map((item: any) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        originalPrice: item.originalPrice || (item.price + 20),
        image: (item.covers && item.covers[0]) || item.cover || '/src/assets/logo.png',
        description: item.description || '暂无描述',
        rate: item.rate || 0
      }))

      // 使用API返回的分页信息
      const pageInfo = data.pageInfo
      if (pageInfo) {
        pageNum.value = pageInfo.pageNum
        pageSize.value = pageInfo.pageSize
        totalPage.value = pageInfo.totalPage
        totalCount.value = pageInfo.totalCount
        hasNext.value = pageInfo.hasNext
        hasPrev.value = pageInfo.hasPrev
      }
    } else {
      error.value = '获取数据失败: ' + (response.data ? response.data.msg || '未知错误' : '服务器响应格式错误')
    }
  } catch (err: any) {
    console.error('获取分类商品出错:', err)
    if (err.response && err.response.status === 401) {
      error.value = '认证失败，请重新登录'
    } else {
      error.value = `网络请求错误: ${err.message || '未知错误'}`
    }
  } finally {
    loading.value = false
  }
}

// 跳转到详情页
const goToDetail = (bookId: string) => {
  router.push({
    name: 'Detail',
    params: { id: bookId }
  })
}

// 加入购物车
const addToCart = async (event: Event, bookId: string, bookTitle: string) => {
  event.stopPropagation()
  
  if (addingToCartId.value !== null) return
  
  addingToCartId.value = Number(bookId)
  cartMessage.value = ''
  showCartResult.value = false
  
  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      throw new Error('请先登录')
    }
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/cart`,
      {
        productId: Number(bookId),
        quantity: 1
      },
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data && response.data.code === '200') {
      isCartSuccess.value = true
      cartMessage.value = `《${bookTitle}》已成功加入购物车！`
    } else {
      isCartSuccess.value = false
      cartMessage.value = response.data?.msg || '加入购物车失败'
    }
  } catch (error: any) {
    console.error('加入购物车出错:', error)
    isCartSuccess.value = false
    cartMessage.value = error.message || '加入购物车失败'
  } finally {
    addingToCartId.value = null
    showCartResult.value = true
    
    setTimeout(() => {
      showCartResult.value = false
    }, 1000)
  }
}

// 切换页面
const changePage = (page: number | string) => {
  let pageNumber = Number(page)

  if (typeof page === 'string') {
    pageNumber = parseInt(page, 10)
    if (isNaN(pageNumber)) {
      alert('请输入有效的页码')
      pageNumInput.value = ''
      return
    }
  }

  if (pageNumber < 1 || pageNumber > totalPage.value) {
    alert('超出页码范围')
    return
  }

  pageNum.value = pageNumber
  pageNumInput.value = ''
  fetchCategoryBooks()
}

// 监听路由变化
watch(() => route.params.category, (newCategory) => {
  if (newCategory) {
    const englishCategory = newCategory as string
    currentCategory.value = getChineseCategoryName(englishCategory)
    pageNum.value = 1 // 重置页码
    fetchCategoryBooks()
  }
}, { immediate: true })

// 组件挂载
onMounted(() => {
  const category = route.params.category as string
  if (category) {
    currentCategory.value = getChineseCategoryName(category)
    fetchCategoryBooks()
  }
})
</script>

<template>
  <div class="category-container">
    <Header class="fixed-header" />
    
    <!-- 全局购物车提示 -->
    <div 
      v-if="showCartResult" 
      class="global-cart-result" 
      :class="{ 'success': isCartSuccess, 'error': !isCartSuccess }"
    >
      <div class="cart-icon">{{ isCartSuccess ? '✓' : '✗' }}</div>
      <div class="cart-message">{{ cartMessage }}</div>
    </div>
    
    <div class="main-content">
      <AsideLeft class="aside-left" />
      <div class="right-content">
        <div class="category-header">
          <h1 class="category-title">{{ currentCategory }} 图书</h1>
        </div>
        
        <div class="category-product-section">
          <!-- 分类商品展示 -->
          <div class="category-books-container">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>正在加载商品数据...</p>
            </div>
            
            <!-- 错误状态 -->
            <div v-else-if="error" class="error-state">
              <p>{{ error }}</p>
              <button @click="fetchCategoryBooks" class="retry-btn">重试</button>
            </div>
            
            <!-- 商品列表 -->
            <div v-else class="books-list">
              <div v-for="book in categoryBooks" 
                   :key="book.id" 
                   class="book-card"
                   @click="goToDetail(book.id)">
                <div class="book-image">
                  <img :src="book.image" :alt="book.title">
                </div>
                <div class="book-details">
                  <h3 class="book-title">{{ book.title }}</h3>
                  <div class="book-pricing">
                    <span class="price">¥{{ book.price }}</span>
                    <span class="original-price">¥{{ book.originalPrice }}</span>
                    <span class="discount" v-if="book.price !== 0">
                      {{ calculateDiscount(book.price, book.originalPrice) }}折
                    </span>
                  </div>
                  <p class="book-description">{{ book.description }}</p>
                  <div class="book-actions">
                    <button 
                      class="add-cart-btn" 
                      @click="(e) => addToCart(e, book.id, book.title)"
                      :disabled="addingToCartId === Number(book.id)"
                    >
                      {{ addingToCartId === Number(book.id) ? '添加中...' : '加入购物车' }}
                    </button>
                    <button class="favorite-btn" @click.stop>❤</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 分页组件 -->
            <div v-if="!loading && !error && categoryBooks.length > 0" class="pagination-container">
              <div class="pagination">
                <button 
                  :disabled="!hasPrev" 
                  @click="changePage(pageNum - 1)" 
                  class="page-btn prev-btn"
                  :class="{'disabled': !hasPrev}"
                >
                  上一页
                </button>
                
                <div class="page-info">
                  <div class="page-input-wrapper">
                    <input 
                      type="number" 
                      v-model="pageNumInput"
                      :placeholder="String(pageNum)"
                      class="page-input"
                      @keyup.enter="(e) => { changePage(pageNumInput); e.target.blur(); }"
                      min="1"
                      :max="totalPage"
                    >
                    <div class="page-input-bg"></div>
                  </div>
                  <span class="page-separator">/ {{ totalPage }}</span>
                </div>
                
                <button 
                  :disabled="!hasNext" 
                  @click="changePage(pageNum + 1)" 
                  class="page-btn next-btn"
                  :class="{'disabled': !hasNext}"
                >
                  下一页
                </button>
              </div>
              
              <div class="page-summary">
                共 {{ totalCount }} 条记录，当前显示第 {{ pageNum }} 页
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  width: 100%;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.main-content {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  margin-top: 60px;
  width: 100%;
  max-width: 100%;
  gap: 6px;
}

.aside-left {
  flex-shrink: 0;
  width: 240px;
  background-color: #fff;
}

.right-content {
  flex: 1;
  padding: 0 20px;
  max-width: calc(100% - 260px);
}

.category-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 30px 40px;
  border-radius: 12px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.category-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

.category-title {
  font-size: 32px;
  font-weight: 600;
  color: #2d3436;
  margin: 0;
  position: relative;
  display: inline-block;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.category-product-section {
  width: 100%;
}

/* 分类商品展示样式 */
.category-books-container {
  background: #ffffff;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
  margin: 30px 0;
  padding: 0 25px 25px;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.category-books-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

.books-list {
  display: flex;
  flex-wrap: wrap;
  padding: 20px 0;
  margin: 0 -10px;
  position: relative;
  z-index: 1;
}

.book-card {
  width: 20%;
  padding: 0 10px;
  margin: 10px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.book-image {
  text-align: center;
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
  padding: 20px 15px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.03);
  margin: 15px;
  transition: transform 0.3s ease;
}

.book-image img {
  height: 180px;
  max-width: 130px;
  transition: transform 0.5s ease;
  display: block;
  margin: 0 auto;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.book-image:hover {
  transform: scale(0.98);
}

.book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 15px 15px;
}

.book-title {
  font-size: 16px;
  margin: 0 0 12px 0;
  font-weight: 500;
  line-height: 1.4;
  height: 46px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #333;
  transition: color 0.3s;
}

.book-card:hover .book-title {
  color: #ff6b6b;
}

.book-pricing {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.price {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: bold;
  margin-right: 8px;
  position: relative;
}

.original-price {
  color: #999;
  font-size: 14px;
  text-decoration: line-through;
  margin-right: 8px;
}

.discount {
  background: #ffe8e8;
  color: #ff6b6b;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
}

.book-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  flex: 1;
}

.book-actions {
  display: flex;
  justify-content: space-between;
  margin: 20px 0 15px;
  padding-top: 15px;
  position: relative;
  gap: 8px;
}

.book-actions::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0,0,0,0.05);
}

.add-cart-btn {
  flex: 1;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 10px 0;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 10px;
  box-shadow: 0 3px 10px rgba(255, 107, 107, 0.2);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.add-cart-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
  box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
}

.add-cart-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
}

.favorite-btn {
  width: 40px;
  background: #f5f5f5;
  color: #999;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  background: #ffeded;
  color: #ff6b6b;
}

/* 全局购物车提示样式 */
.global-cart-result {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  min-width: 300px;
  max-width: 90%;
}

.global-cart-result.success {
  border-left: 5px solid #ff6b6b;
}

.global-cart-result.error {
  border-left: 5px solid #ff6b6b;
}

.cart-icon {
  font-size: 24px;
  margin-right: 15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-cart-result.success .cart-icon {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
}

.global-cart-result.error .cart-icon {
  background-color: #fff0f0;
  color: #ff6b6b;
}

.cart-message {
  font-size: 16px;
  font-weight: 500;
}

.global-cart-result.success .cart-message {
  color: #ff6b6b;
}

.global-cart-result.error .cart-message {
  color: #ff6b6b;
}

@keyframes popIn {
  0% { 
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.8);
  }
  100% { 
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 加载和错误状态样式 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 107, 107, 0.1);
  border-left-color: #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state p {
  color: #ff6b6b;
  margin-bottom: 15px;
  font-size: 16px;
}

.retry-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.retry-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
  transform: translateY(-2px);
}

/* 分页样式 */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px 0;
  padding: 15px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  padding: 10px 15px;
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.page-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 10px 18px;
  margin: 0 8px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  box-shadow: 0 3px 8px rgba(255, 107, 107, 0.25);
}

.page-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(255, 107, 107, 0.35);
  background: linear-gradient(90deg, #ff5252, #ff8a65);
}

.page-btn.disabled {
  background: #e0e0e0;
  cursor: not-allowed;
  box-shadow: none;
  color: #999;
}

.page-info {
  display: flex;
  align-items: center;
  margin: 0 15px;
  position: relative;
}

.page-input-wrapper {
  position: relative;
  width: 60px;
  height: 38px;
}

.page-input {
  width: 100%;
  height: 100%;
  padding: 0 10px;
  border: 2px solid rgba(255, 107, 107, 0.2);
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #555;
  transition: all 0.3s;
  background-color: transparent;
  position: relative;
  z-index: 2;
}

.page-input:focus {
  border-color: rgba(255, 107, 107, 0.8);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
}

.page-input-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  border-radius: 8px;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
  z-index: 1;
}

.page-separator {
  margin: 0 0 0 10px;
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.page-summary {
  margin-top: 12px;
  font-size: 14px;
  color: #777;
}

@media (max-width: 1400px) {
  .book-card {
    width: 20%;
  }
}

@media (max-width: 1200px) {
  .book-card {
    width: 25%;
  }
}

@media (max-width: 992px) {
  .book-card {
    width: 33.33%;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .aside-left {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .right-content {
    width: 100%;
    max-width: 100%;
    padding: 0 10px;
  }
  
  .category-header {
    padding: 20px;
    margin-bottom: 15px;
  }
  
  .category-title {
    font-size: 24px;
  }
  
  .book-card {
    width: 50%;
  }
}

@media (max-width: 576px) {
  .book-card {
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
    width: 100%;
    border-radius: 15px;
  }
  
  .page-btn {
    width: 100%;
    justify-content: center;
    margin: 0;
  }
  
  .page-info {
    margin: 10px 0;
  }
}
</style>