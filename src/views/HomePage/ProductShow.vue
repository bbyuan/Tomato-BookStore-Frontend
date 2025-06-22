<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 添加props定义
const props = defineProps<{
  category?: string
}>()

const router = useRouter();
// 使用ref创建响应式数据
const technicalBooks = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
// 添加购物车相关状态
const addingToCartId = ref<number | null>(null);
const cartMessage = ref('');
const showCartResult = ref(false);
const isCartSuccess = ref(false);
const lastAddedBook = ref(''); 

// 分页相关数据
const pageSize = ref(20);
const pageNum = ref(1);
const totalPage = ref(0);
const totalCount = ref(0);
const hasNext = ref(false);
const hasPrev = ref(false);
const pageNumInput = ref('');

// 用户角色状态
const userRole = ref('customer')

// 计算折扣
const calculateDiscount = (price: string, originalPrice: string) => {
  const currentPrice = parseFloat(price.replace('¥', ''))
  const original = parseFloat(originalPrice.replace('¥', ''))
  if (original === 0 || currentPrice >= original) return null
  const discount = Math.round((currentPrice / original) * 10)
  // 如果是九折以上（包含九折），不显示折扣
  if (discount >= 9) return null
  return discount
}

// 获取用户角色
const fetchUserRole = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (token && username) {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/accounts/${username}`, {
        method: 'GET',
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.code === '200') {
        userRole.value = data.data.role || 'customer'
      }
    }
  } catch (error) {
    console.error('获取用户角色出错:', error)
  }
}

// 获取商品列表数据
const fetchBooks = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      console.error('未找到token，用户可能未登录');
      return;
    }
    
    // 使用分页API端点
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/page`, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      },
      params: {
        pageSize: pageSize.value,
        pageNum: pageNum.value
      }
    });
    
    // 添加响应调试日志
    console.log('API响应数据:', response.data);
    
    if (response.data && response.data.code === '200') {
      // 处理API返回的分页数据格式
      const pageData = response.data.data;
      const books = pageData.products || [];
      
      technicalBooks.value = books.map((item: any) => {
        return {
          id: item.id,
          title: item.title,
          price: `¥${item.price}`,
          originalPrice: `¥${item.originalPrice || (item.price + 20)}`,
          image: (item.covers && item.covers[0]) || item.cover || '/src/assets/logo.png',
          description: item.description || '暂无描述',
        };
      });

      // 使用API返回的分页信息
      const pageInfo = pageData.pageInfo;
      if (pageInfo) {
        pageNum.value = pageInfo.pageNum;
        pageSize.value = pageInfo.pageSize;
        totalPage.value = pageInfo.totalPage;
        totalCount.value = pageInfo.totalCount;
        hasNext.value = pageInfo.hasNext;
        hasPrev.value = pageInfo.hasPrev;
      }
    } else {
      error.value = '获取数据失败: ' + (response.data ? response.data.msg || '未知错误' : '服务器响应格式错误');
    }
  } catch (err: any) {
    console.error('获取商品列表出错:', err);
    // 区分网络错误和认证错误
    if (err.response && err.response.status === 401) {
      error.value = '认证失败，请重新登录';
    } else {
      error.value = `网络请求错误: ${err.message || '未知错误'}`;
    }
  } finally {
    loading.value = false;
  }
};

const goToDetail = (bookId: number) => {
  router.push({
    name: 'Detail',
    params: { id: bookId.toString() }
  });
}

// 加入购物车
const addToCart = async (event: Event, bookId: number, bookTitle: string) => {
  // 阻止事件冒泡，避免触发卡片的点击事件
  event.stopPropagation();
  
  // 如果正在添加，则不重复操作
  if (addingToCartId.value !== null) return;
  
  addingToCartId.value = bookId;
  cartMessage.value = '';
  showCartResult.value = false;
  lastAddedBook.value = bookTitle; // 记录当前添加的书名
  
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('请先登录');
    }
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/cart`,
      {
        productId: bookId,
        quantity: 1  // 默认数量为1
      },
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('加入购物车响应:', response.data);
    if (response.data && response.data.code === '200') {
      isCartSuccess.value = true;
      cartMessage.value = `《${bookTitle}》已成功加入购物车！`;
    } else {
      isCartSuccess.value = false;
      cartMessage.value = response.data?.msg || '加入购物车失败';
    }
  } catch (error: any) {
    console.error('加入购物车出错:', error);
    isCartSuccess.value = false;
    cartMessage.value = error.message || '加入购物车失败';
  } finally {
    addingToCartId.value = null;
    showCartResult.value = true;
    
    
    setTimeout(() => {
      showCartResult.value = false;
    }, 1000);
  }
};

// 切换页面
const changePage = (page: number | string) => {
  let pageNumber = Number(page);

  if (typeof page === 'string') {
    pageNumber = parseInt(page, 10);
    if (isNaN(pageNumber)) {
      alert('请输入有效的页码');
      pageNumInput.value = '';
      return;
    }
  }

  if (pageNumber < 1 || pageNumber > totalPage.value) {
    alert('超出页码范围');
    return;
  }

  pageNum.value = pageNumber;
  pageNumInput.value = '';
  fetchBooks();
};

// 监听category变化，重新获取数据
watch(() => props.category, () => {
  pageNum.value = 1; // 重置页码
  fetchBooks();
}, { immediate: false })

// 组件挂载时获取数据
onMounted(() => {
  fetchUserRole();
  fetchBooks();
});
</script>

<template>
  <div class="hot-books-container">
    <!-- 添加全局购物车提示 -->
    <div 
      v-if="showCartResult" 
      class="global-cart-result" 
      :class="{ 'success': isCartSuccess, 'error': !isCartSuccess }"
    >
      <div class="cart-icon">{{ isCartSuccess ? '✓' : '✗' }}</div>
      <div class="cart-message">{{ cartMessage }}</div>
    </div>
    
    <div class="hot-books-header">
      <h2>所有书籍</h2>
      <!-- "查看更多"按钮已删除 -->
    </div>
    
    <!-- 添加加载状态显示 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载商品数据...</p>
    </div>
    
    <!-- 添加错误状态显示 -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchBooks" class="retry-btn">重试</button>
    </div>
    
    <!-- 商品列表 -->
    <div v-else class="hot-books-list">
      <div v-for="book in technicalBooks" 
           :key="book.id" 
           class="book-card"
           @click="goToDetail(book.id)">
        <div class="book-image">
          <img :src="book.image" :alt="book.title">
        </div>
        <div class="book-details">
          <h3 class="book-title">{{ book.title }}</h3>
          <div class="book-pricing">
            <span class="price">{{ book.price }}</span>
            <span class="original-price" v-if="book.price !== book.originalPrice">{{ book.originalPrice }}</span>
            <span class="discount" v-if="calculateDiscount(book.price, book.originalPrice)">
              {{ calculateDiscount(book.price, book.originalPrice) }}折
            </span>
          </div>
          <p class="book-description">{{ book.description }}</p>
          <!-- 只有管理员能看到库存信息 -->
          <div v-if="userRole === 'admin'" class="book-stock">
            库存: {{ book.stock || 0 }}
          </div>
          <div class="book-actions">
            <button 
              class="add-cart-btn" 
              @click="(e) => addToCart(e, book.id, book.title)"
              :disabled="addingToCartId === book.id"
            >
              {{ addingToCartId === book.id ? '添加中...' : '加入购物车' }}
            </button>
            <button class="favorite-btn" @click.stop>❤</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 分页组件 -->
  <div class="pagination-container">
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
            @keyup.enter="(e) => { changePage(pageNumInput); (e.target as HTMLInputElement | null)?.blur(); }"
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
</template>

<style scoped>
.hot-books-container {
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

.hot-books-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

.hot-books-header {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hot-books-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d3436;
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hot-books-header h2::after {
  content: "";
  position: absolute;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  bottom: 0;
  left: 0;
}

.view-more {
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(255,107,107,0.1);
}

.view-more:hover {
  color: #ff6b6b;
  background: rgba(255,107,107,0.2);
  transform: translateX(5px);
}

.arrow-right {
  margin-left: 5px;
  font-size: 18px;
  font-style: normal;
}

.hot-books-list {
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

.book-card::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 80%;
  width: 1px;
  background: linear-gradient(to bottom, 
    rgba(200, 200, 200, 0) 0%,
    rgba(200, 200, 200, 0.3) 50%,
    rgba(200, 200, 200, 0) 100%);
}

.book-card:nth-child(5n)::after {
  display: none;
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

.price::before {
  position: absolute;
  left: 0;
  top: 2px;
  font-size: 14px;
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

.book-stock {
  color: #333;
  font-size: 14px;
  margin-bottom: 15px;
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

@media (max-width: 1400px) {
  .book-card {
    width: 20%;
  }
  .book-card:nth-child(5n)::after {
    display: none;
  }
}

@media (max-width: 1200px) {
  .book-card {
    width: 25%;
  }
  .book-card:nth-child(4n)::after {
    display: none;
  }
}

@media (max-width: 992px) {
  .book-card {
    width: 33.33%;
  }
  .book-card:nth-child(3n)::after {
    display: none;
  }
}

@media (max-width: 768px) {
  .book-card {
    width: 50%;
  }
  .book-card:nth-child(2n)::after {
    display: none;
  }
}

@media (max-width: 576px) {
  .book-card {
    width: 100%;
  }
  .book-card::after {
    display: none;
  }
}

/* 添加加载和错误状态的样式 */
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

.page-btn:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(255, 107, 107, 0.25);
}

.page-btn.disabled {
  background: #e0e0e0;
  cursor: not-allowed;
  box-shadow: none;
  color: #999;
}

.btn-icon {
  margin: 0 5px;
  font-weight: bold;
}

.prev-btn .btn-icon {
  margin-right: 5px;
}

.next-btn .btn-icon {
  margin-left: 5px;
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

.page-input::placeholder {
  color: #555;
  opacity: 1;
  transition: opacity 0.2s;
}

.page-input:focus::placeholder {
  opacity: 0;
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

.page-input:focus {
  border-color: rgba(255, 107, 107, 0.8);
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
}

.page-input::-webkit-inner-spin-button,
.page-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
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

@media (max-width: 576px) {
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

