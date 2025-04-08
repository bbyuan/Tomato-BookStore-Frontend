<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import AddProductModal from './AddProductModal.vue';
import EditProductModal from './EditProductModal.vue'; 

const router = useRouter();

const technicalBooks = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const showDeleteModal = ref(false);
const bookToDelete = ref<any>(null);
const showAddProductModal = ref(false);
const showEditProductModal = ref(false); 
const currentEditBook = ref<any>(null); 

const currentPage = ref(1);
const itemsPerPage = 12;

// 计算当前页显示的商品
const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return technicalBooks.value.slice(start, end);
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(technicalBooks.value.length / itemsPerPage);
});

// 切换到上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// 切换到下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

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
        
        // 生成随机的冻结库存数据（因为API中可能没有此字段）
        const totalStock = item.stock || Math.floor(Math.random() * 100) + 1;
        const frozenStock = Math.floor(Math.random() * 10) + 1; // 生成1-10的随机冻结库存
        
        console.log(response.data.data);
        return {
          id: item.id,
          title: item.title,
          price: `¥${currentPrice.toFixed(2)}`,
          originalPrice: `¥${originalPrice.toFixed(2)}`,
          image: item.covers[0] || '/src/assets/images/BookTemplate.avif',
          description: item.description || '暂无描述',
          stock: totalStock, 
          frozenStock: frozenStock, // 添加冻结库存字段
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

// 打开新增商品弹窗
const openAddProductModal = () => {
  showAddProductModal.value = true;
};

// 关闭新增商品弹窗
const closeAddProductModal = () => {
  showAddProductModal.value = false;
};

// 处理商品添加成功
const handleProductAdded = (productData: any) => {
  // 商品添加成功后重新获取商品列表
  fetchBooks();
};

// 跳转到新增商品页面 - 修改为打开弹窗
const goToAddProduct = () => {
  openAddProductModal();
};

// 打开编辑商品弹窗
const openEditProductModal = (event: Event, book: any) => {
  event.stopPropagation(); // 阻止事件冒泡，避免触发卡片的点击事件
  currentEditBook.value = book.id; // 只存储商品ID
  showEditProductModal.value = true;
}

// 关闭编辑商品弹窗
const closeEditProductModal = () => {
  showEditProductModal.value = false;
  currentEditBook.value = null;
}

// 保存编辑的商品信息
const saveEditedProduct = async (editedBook: any) => {
  try {
    loading.value = true;
    const token = sessionStorage.getItem('token');
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      return;
    }
    
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products/${editedBook.id}`;
    
    const response = await axios.put(apiUrl, editedBook, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.code === '200') {
      // 更新成功后重新获取商品列表
      await fetchBooks();
      closeEditProductModal(); // 关闭弹窗
    } else {
      error.value = '更新失败: ' + (response.data ? response.data.msg || '未知错误' : '服务器响应格式错误');
    }
  } catch (err: any) {
    console.error('更新商品信息出错:', err);
    error.value = `更新失败: ${err.message || '未知错误'}`;
  } finally {
    loading.value = false;
  }
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

  console.log('准备删除商品:', bookToDelete.value);

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
    } else {
      error.value = response.data.msg || '删除失败';
    }
  } catch (err: any) {
    console.error('删除商品出错:', err);
    error.value = `删除失败: ${err.message || '未知错误'}`;
  } finally {
    // 无论成功或失败都关闭弹窗
    showDeleteModal.value = false;
    bookToDelete.value = null;
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
      <button class="add-product-btn" @click="openAddProductModal">
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
      <div v-for="book in paginatedBooks" 
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
          
          <!-- 库存和冻结库存信息 -->
          <div class="stock-info">
            <div class="stock-badge" :class="{ 'low-stock': book.stock < 50 }">
              库存: {{ book.stock }}
            </div>
            <div class="frozen-stock-badge">
              冻结: {{ book.frozenStock }}
            </div>
          </div>
          
          <div class="book-actions admin-actions">
            <div class="edit-btn" @click="openEditProductModal($event, book)">
              <img src="/src/assets/icons/edit-box-fill.svg" alt="编辑" class="action-icon">
              编辑
            </div>
            <div class="delete-btn" @click="showDeleteConfirm($event, book)">
              <img src="/src/assets/icons/delete-bin-6-fill.svg" alt="删除" class="action-icon">
              删除
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="prevPage">上一页</button>
      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
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

    <!-- 新增商品弹窗 -->
    <AddProductModal 
      v-if="showAddProductModal"
      @close="closeAddProductModal"
      @product-added="handleProductAdded"
    />

    <!-- 编辑商品弹窗 -->
    <div v-if="showEditProductModal" class="edit-modal-overlay" @click="closeEditProductModal">
      <div class="edit-modal-container" @click.stop>
        <EditProductModal
          v-if="currentEditBook"
          :bookId="currentEditBook"
          @save="saveEditedProduct"
          @close="closeEditProductModal"
        />
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

/* 重新布局库存和冻结库存样式 */
.stock-info {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
}

.stock-badge, .frozen-stock-badge {
  flex: 1;
  padding: 8px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: relative;
}

.stock-badge {
  background-color: #e0f2e9;
  color: #2e8b57;
}

.stock-badge.low-stock {
  background-color: #fff0f0;
  color: #ff6b6b;
  border-left: 2px solid #ff6b6b;
  padding-left: 10px;
  box-shadow: 0 4px 8px rgba(255, 107, 107, 0.25);
  position: relative;
  overflow: hidden;
}

.stock-badge.low-stock::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 1.5s infinite;
}

.frozen-stock-badge {
  background-color: #e6f0ff;
  color: #4a6fa5;
  
}

/* 修改闪光动画以使其更慢更明显 */
@keyframes shine {
  0% { left: -100%; }
  40% { left: 100%; }
  100% { left: 100%; }
}

/* 删除旧的库存指示器样式 */
.stock-indicator, .stock-bar, .stock-progress, .stock-text, .low-stock-progress, .low-stock-text {
  display: none;
}

/* 修改管理员操作按钮样式，与库存样式保持一致 */
.admin-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  width: 100%;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.action-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
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
  background: #f2f2f2;
  color: #333;
}

.delete-btn:hover {
  background: #e6e6e6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

/* 删除旧的图标样式，不再需要 */
.edit-icon, .delete-icon {
  display: none;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  background-color: #ff6b6b;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:disabled {
  background-color: #f0f0f0;
  color: #ccc;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background-color: #ff5252;
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

/* 添加编辑弹窗样式 */
.edit-modal-overlay {
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

.edit-modal-container {
  width: 98%;
  max-width: 1400px;
  max-height: 95vh;
  overflow-y: auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.3s ease;
}
</style>

