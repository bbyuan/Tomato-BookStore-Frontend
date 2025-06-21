<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import BookInfo from '@/views/Detail/BookInfo.vue'
import RelatedBooks from '@/views/Detail/RelatedBooks.vue'
import BookComments from '@/views/Detail/BookComments.vue'
import RankingList from '@/views/HomePage/BookRanking.vue'

import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'


interface Specification {
  name: string
  value: string | number
}

interface BackendSpecification {
  id: string
  item: string   
  value: string
  productId: string
}

interface StockVO {
  amount: number
  frozen: number
}

interface Book {
  id: string
  title: string
  price: number
  rate: number
  description: string
  cover: string
  covers: string[]
  specifications: Specification[]
  stock: StockVO
  originalPrice?: number
}

const route = useRoute()
const bookId = ref(route.params.id as string)

const book = ref<Book | null>(null)
const relatedBooks = ref<Book[]>([])
const bookLoading = ref(true);
const bookError = ref('');
const relatedBooksLoading = ref(true);
const relatedBooksError = ref('');

// 获取书籍详情
const fetchBookDetail = async (id: string) => {
  try {
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (!token || !username) {
      console.error('未找到token或用户名')
      return
    }

    // 并行请求商品信息和库存信息
    const [productRes, stockRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`, {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }),
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/stockpile/${id}`, {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      })
    ]);

    console.log(productRes.data)
    console.log(id)
    console.log(stockRes.data)
    // 处理商品信息
    if (Number(productRes.data.code) !== 200) {
      throw new Error(productRes.data.msg || '获取商品信息失败');
    }
    const productData = productRes.data.data;

    // 处理库存信息
    if (Number(stockRes.data.code) !== 200) {
      throw new Error(stockRes.data.msg || '库存信息获取失败');
    }
    const stockData = stockRes.data.data;

    //合并数据
    return {
      id: productData.id,
      title: productData.title,
      price: productData.price,
      rate: productData.rate,
      description: productData.description,
      cover: productData.cover,
      covers: productData.covers, // 注意这里返回的是单字段 cover
      specifications: productData.specifications?.map((s: BackendSpecification) => ({
        name: s.item,
        value: s.value
      })) || [],
      stock: {
        amount: stockData.amount,
        frozen: stockData.frozen
      },
      originalPrice: productData.price + 20 // 直接计算
    };
  } catch (err) {
    console.error('获取书籍详情失败:', err);
    if (axios.isAxiosError(err)) {
      console.error('请求详情:', err.config?.url, err.response?.status);
    } else {
      console.error('未知错误:', err);
    }
    bookError.value = err instanceof Error ? err.message : '请求失败';
    return null;
  } finally {
    bookLoading.value = false;
  }
};

// 获取相关书籍数据
const fetchRelatedBooks = async (id: string) => {
  try {
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (!token || !username) {
      console.error('未找到token或用户名')
      return
    }

    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      },
    });

    // 验证响应状态
    if (Number(response.data.code) !== 200) {
      throw new Error(response.data.msg || '获取书籍列表失败');
    }

    const rawData = Array.isArray(response.data.data) 
      ? response.data.data.filter((item: any) => String(item.id) !== id) 
      : [];

    // 找到id最接近当前id的5本书
    const sorted = rawData
      .map((item: any) => ({
        ...item,
        idDiff: Math.abs(Number(item.id) - Number(id))
      }))
      .sort((a: any, b: any) => a.idDiff - b.idDiff)
      .slice(0, 5)
      .map((item: any) => ({
        id: item.id || '无ID',
        title: item.title?.trim() || '未知书名',
        price: Number(item.price) || 0,
        originalPrice: Number(item.originalPrice) || (Number(item.price) + 20) || 0,
        image: item.covers && item.covers[0] ? item.covers[0] : '/src/assets/logo.png',
        description: item.description || '暂无描述',
        rate: Number(item.rate) || 0
      }));

    return sorted;
  } catch (err) {
    console.error('获取相关书籍失败:', err);
    if (axios.isAxiosError(err)) {
      console.error('Axios 错误信息:', err.response?.data || err.message);
    } else {
      console.error('未知错误:', err);
    }
    relatedBooksError.value = err instanceof Error ? err.message : '请求失败';
    return [];
  } finally {
    relatedBooksLoading.value = false;
  }
};

onMounted(async () => {
  fetchBookDetail(bookId.value).then((detail) => {
    if (detail) book.value = detail;
  });
  fetchRelatedBooks(bookId.value).then((related) => {
    relatedBooks.value = related;
  });
});

watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      bookId.value = newId as string
      bookLoading.value = true
      relatedBooksLoading.value = true
      fetchBookDetail(bookId.value).then((detail) => {
        if (detail) book.value = detail;
      });
      fetchRelatedBooks(bookId.value).then((related) => {
        relatedBooks.value = related;
      });
    }
  }
)
</script>

<template>
  <div class="detail-container">
    <Header class="fixed-header" />

    <div class="detail-content">
    
      <!-- 上部区域：书籍信息和排行榜并排 -->
      <div class="top-section">
        <!-- 书籍信息卡片 -->
        <div class="book-info-wrapper">
          <div v-if="bookLoading" class="card">
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p>正在加载书籍信息...</p>
            </div>
          </div>
          <div v-else-if="bookError" class="card">
            <div class="error-state">
              <p>加载书籍详细信息失败</p>
              <button @click="$router.go(0)" class="retry-btn">重新加载</button>
            </div>
          </div>
          <div v-else-if="book" class="card">
            <BookInfo :bookInfo="{
              ...book,
              price: book.price.toFixed(2),
              originalPrice: (book.price + 20).toFixed(2),
              amount: book.stock.amount || 0,
              rate: book.rate || 0,
            }" />
          </div>
        </div>
        <div class="ranking-wrapper">
          <RankingList />
        </div>
      </div>
      
      <!-- 下部区域：相关书籍列表 -->
      <div class="bottom-section">
        <!-- 相关书籍卡片 -->
        <div class="related-books-wrapper">
          <div v-if="relatedBooksLoading" class="card">
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p>正在加载相关书籍...</p>
            </div>
          </div>
          <div v-else-if="relatedBooksError" class="card">
            <div class="error-state">
              <p>相关书籍加载失败</p>
              <button @click="$router.go(0)" class="retry-btn">重新加载</button>
            </div>
          </div>
          <div v-else-if="relatedBooks.length" class="card">
            <RelatedBooks :relatedBooks="relatedBooks" :currentBookId="bookId" />
          </div>
        </div>
        
        <!-- 书籍评论区 -->
        <div class="comments-wrapper">
          <div class="card">
            <BookComments :bookId="bookId" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 100px);
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 107, 107, 0.1);
  border-left-color: #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state p {
  color: #ff6b6b;
  margin-bottom: 20px;
  font-size: 18px;
}

.retry-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}


.detail-container {
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

.detail-content {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  margin-top: 100px;
  width: 100%;
  padding: 0 20px;
  max-width: 100%;
  gap: 6px;
  flex-wrap: wrap;
}

/* 上部区域样式 */
.top-section {
  display: flex;
  gap: 30px;
  width: 100%;
}

.book-info-wrapper {
  flex: 7; /* 书籍信息占更多空间 */
  min-width: 0;
}

.ranking-wrapper {
  flex: 3; /* 排行榜占较少空间 */
  min-width: 280px;
  max-width: 400px;
}

/* 下部区域样式 */
.bottom-section {
  width: 100%;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 优化响应式布局 */
@media (max-width: 1200px) {
  .top-section {
    flex-direction: column;
  }

  .ranking-wrapper {
    max-width: none;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .detail-content {
    padding: 70px 10px 10px;
  }
}

.book-info-wrapper, .related-books-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* 确保组件大小一致 */
}

.loading-state, .error-state {
  text-align: center;
  width: 100%;
}

.loading-spinner {
  margin: 0 auto 20px;
}

.card {
  background: #ffffff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  box-sizing: border-box;
}

.loading-state, .error-state {
  text-align: center;
  width: 100%;
}

.loading-spinner {
  margin: 0 auto 20px;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 107, 107, 0.1);
  border-left-color: #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state p {
  color: #ff6b6b;
  margin-bottom: 20px;
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