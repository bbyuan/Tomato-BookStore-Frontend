<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const router = useRouter();
// 使用ref创建响应式数据
const technicalBooks = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

// 计算折扣
const calculateDiscount = (price: string, originalPrice: string) => {
  const currentPrice = parseFloat(price.replace('¥', ''))
  const original = parseFloat(originalPrice.replace('¥', ''))
  if (original === 0) return 0
  return Math.round((currentPrice / original) * 10)
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
    
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.code === '200') {
      // 处理API返回的数据格式
      technicalBooks.value = response.data.data.map((item: any) => {
        // 将价格转换为数字
        const currentPrice = parseFloat(item.price);
        // 计算原价 = 当前价格 + 20元
        const originalPrice = currentPrice + 20;
        
        return {
          id: item.id,
          title: item.title,
          price: `¥${currentPrice.toFixed(2)}`,
          originalPrice: `¥${originalPrice.toFixed(2)}`,
          image: item.cover || '/src/assets/images/BookTemplate.avif',
          description: item.description || '暂无描述',
        };
      });
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

// 组件挂载时获取数据
onMounted(() => {
  fetchBooks();
});

</script>

<template>
  <div class="hot-books-container">
    <div class="hot-books-header">
      <h2>热销书籍</h2>
      <div class="view-more">查看更多 <i class="arrow-right">›</i></div>
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
            <span class="original-price">{{ book.originalPrice }}</span>
            <span class="discount" v-if="book.price !== '¥0.00'">
              {{ calculateDiscount(book.price, book.originalPrice) }}折
            </span>
          </div>
          <p class="book-description">{{ book.description }}</p>
          <div class="book-actions">
            <button class="add-cart-btn">加入购物车</button>
            <button class="favorite-btn">❤</button>
          </div>
        </div>
      </div>
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
  padding-left: 18px;
}

.price::before {
  content: "¥";
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
</style>

