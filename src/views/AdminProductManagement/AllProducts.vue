<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const router = useRouter();
// 使用ref创建响应式数据
const technicalBooks = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const showDeleteModal = ref(false);
const bookToDelete = ref<any>(null);

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
          stock: item.stock || Math.floor(Math.random() * 100) + 1, // 添加库存信息，如果API没有则随机生成
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

// 跳转到商品详情
const goToDetail = (bookId: number) => {
  router.push({
    name: 'Detail',
    params: { id: bookId.toString() }
  });
}

// 跳转到新增商品页面
const goToAddProduct = () => {
  router.push({
    name: 'AddProduct'
  });
}

// 跳转到编辑商品页面
const goToEditProduct = (event: Event, bookId: number) => {
  event.stopPropagation(); // 阻止事件冒泡，避免触发卡片的点击事件
  router.push({
    name: 'EditProduct',
    params: { id: bookId.toString() }
  });
}

// 显示删除确认框
const showDeleteConfirm = (event: Event, book: any) => {
  event.stopPropagation(); // 阻止事件冒泡
  bookToDelete.value = book;
  showDeleteModal.value = true;
}

// 删除商品
const deleteProduct = async () => {
  if (!bookToDelete.value) return;
  
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      return;
    }
    
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products/${bookToDelete.value.id}`;
    
    const response = await axios.delete(apiUrl, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.code === '200') {
      // 从列表中移除已删除的商品
      technicalBooks.value = technicalBooks.value.filter(item => item.id !== bookToDelete.value.id);
      // 关闭确认框
      showDeleteModal.value = false;
      bookToDelete.value = null;
    } else {
      error.value = '删除失败: ' + (response.data ? response.data.msg || '未知错误' : '服务器响应格式错误');
    }
  } catch (err: any) {
    console.error('删除商品出错:', err);
    error.value = `删除失败: ${err.message || '未知错误'}`;
  }
}

// 取消删除
const cancelDelete = () => {
  showDeleteModal.value = false;
  bookToDelete.value = null;
}

// 组件挂载时获取数据
onMounted(() => {
  fetchBooks();
});
</script>

<template>
  <div class="all-books-container">
    <div class="all-books-header">
      <h2>商品管理</h2>
      <button class="add-product-btn" @click="goToAddProduct">
        <i class="plus-icon">+</i> 新增商品
      </button>
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
    <div v-else class="all-books-list">
      <div v-for="book in technicalBooks" 
           :key="book.id" 
           class="book-card"
           @click="goToDetail(book.id)">
        <div class="ribbon" v-if="book.stock < 10">库存紧张</div>
        <div class="book-image">
          <img :src="book.image" :alt="book.title">
          <div class="hover-info">
            <span>查看详情</span>
          </div>
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
          <div class="stock-indicator">
            <div class="stock-bar">
              <div class="stock-progress" :style="{width: `${Math.min(book.stock, 100)}%`}" 
                   :class="{'low-stock-progress': book.stock < 10}"></div>
            </div>
            <span class="stock-text" :class="{'low-stock-text': book.stock < 10}">
              库存: {{ book.stock }}
            </span>
          </div>
          <div class="book-actions admin-actions">
            <button class="edit-btn" @click="(event) => goToEditProduct(event, book.id)">
              <i class="edit-icon">✏️</i> 编辑
            </button>
            <button class="delete-btn" @click="(event) => showDeleteConfirm(event, book)">
              <i class="delete-icon">🗑️</i> 删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="delete-modal-overlay" @click="cancelDelete">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-icon">🗑️</div>
        <h3>确认删除</h3>
        <p>您确定要删除《{{ bookToDelete?.title }}》吗？</p>
        <p class="warning-text">此操作不可撤销。</p>
        <div class="delete-modal-actions">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="confirm-delete-btn" @click="deleteProduct">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.all-books-container {
  background: #ffffff;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
  margin: 30px 0;
  padding: 0 25px 25px;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.all-books-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

.all-books-header {
  padding: 25px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.all-books-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: #2d3436;
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.all-books-header h2::after {
  content: "";
  position: absolute;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  bottom: 0;
  left: 0;
}

.add-product-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.25);
  transition: all 0.3s;
  letter-spacing: 0.5px;
}

.add-product-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.add-product-btn:active {
  transform: translateY(-1px);
}

.plus-icon {
  font-size: 18px;
  font-style: normal;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.all-books-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  padding: 30px 0;
  position: relative;
  z-index: 1;
}

.book-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  height: 100%;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.ribbon {
  position: absolute;
  top: 20px;
  right: -30px;
  transform: rotate(45deg);
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  padding: 5px 30px;
  font-size: 12px;
  font-weight: 500;
  z-index: 5;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.book-image {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
  padding: 25px 15px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.book-image img {
  height: 180px;
  max-width: 130px;
  transition: transform 0.5s ease;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));
  z-index: 2;
}

.hover-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,107,107,0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 500;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateY(20px);
  z-index: 3;
}

.book-card:hover .hover-info {
  opacity: 1;
  transform: translateY(0);
}

.book-card:hover .book-image img {
  transform: scale(1.05);
}

.book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
}

.book-title {
  font-size: 16px;
  margin: 0 0 15px 0;
  font-weight: 600;
  line-height: 1.4;
  height: 45px;
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
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.price {
  color: #ff6b6b;
  font-size: 20px;
  font-weight: bold;
}

.original-price {
  color: #999;
  font-size: 14px;
  text-decoration: line-through;
}

.discount {
  background: #ffe8e8;
  color: #ff6b6b;
  padding: 3px 8px;
  font-size: 12px;
  border-radius: 20px;
  font-weight: 500;
}

.stock-indicator {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stock-bar {
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.stock-progress {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.low-stock-progress {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

.stock-text {
  font-size: 13px;
  color: #555;
}

.low-stock-text {
  color: #ff6b6b;
  font-weight: 500;
}

/* 管理员操作按钮 */
.admin-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.edit-btn {
  background: #f2f2f2;
  color: #333;
}

.edit-btn:hover {
  background: #e6e6e6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.delete-btn {
  background: #fff0f0;
  color: #ff6b6b;
}

.delete-btn:hover {
  background: #ffe0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255,107,107,0.15);
}

.edit-icon, .delete-icon {
  font-style: normal;
  font-size: 16px;
}

/* 删除确认弹窗 */
.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(3px);
}

.delete-modal {
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.3s ease;
  text-align: center;
}

.delete-modal-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.delete-modal h3 {
  margin: 0 0 15px;
  color: #ff6b6b;
  font-size: 24px;
  font-weight: 600;
}

.delete-modal p {
  color: #555;
  line-height: 1.5;
  font-size: 16px;
  margin-bottom: 10px;
}

.warning-text {
  color: #ff6b6b;
  font-size: 14px;
  font-weight: 500;
}

.delete-modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
}

.cancel-btn, .confirm-delete-btn {
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.cancel-btn {
  background: #f2f2f2;
  color: #555;
}

.cancel-btn:hover {
  background: #e6e6e6;
  transform: translateY(-2px);
}

.confirm-delete-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
}

.confirm-delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.4);
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
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
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
}

.retry-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

@media (max-width: 768px) {
  .all-books-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .add-product-btn {
    width: 100%;
    justify-content: center;
  }
  
  .all-books-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
  
  .book-image {
    height: 160px;
  }
  
  .book-image img {
    height: 140px;
  }
  
  .book-title {
    font-size: 14px;
    height: 40px;
  }
  
  .book-details {
    padding: 15px;
  }
}
</style>

