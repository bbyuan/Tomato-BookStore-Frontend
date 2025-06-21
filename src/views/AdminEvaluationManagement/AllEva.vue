<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

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
    console.log(response.data.data);

    if (response.data && response.data.code === '200') {
      // 处理API返回的数据格式
      technicalBooks.value = response.data.data.map((item: any) => {
        const currentPrice = parseFloat(item.price);
        const originalPrice = parseFloat(item.originalPrice) || currentPrice;

        return {
          id: item.id,
          title: item.title,
          price: `¥${currentPrice.toFixed(2)}`,
          originalPrice: `¥${originalPrice.toFixed(2)}`,
          image: item.covers[0] || '/src/assets/logo.png',
          description: item.description || '暂无描述',
          stock: item.stock?.amount || 0, // 使用 stock.amount
          frozenStock: item.stock?.frozen || 0, // 使用 stock.frozen
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
  console.log(currentEditBook.value);
}

// 关闭编辑商品弹窗
const closeEditProductModal = () => {
  showEditProductModal.value = false;
  currentEditBook.value = null;
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
      <h2>评价审核管理</h2>
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
        <p>您确定要删除"{{ bookToDelete?.title }}"吗？</p>
        <p class="warning-text">此操作不可撤销</p>
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
          @save="fetchBooks" 
          @close="closeEditProductModal"
        />
      </div>
    </div>

    <!-- 成功提示样式 -->
    <div v-if="successMessage" class="success-toast">
      <div class="success-icon">✅</div>
      <div class="success-content">
        <h3>{{ successMessage }}</h3>
        <p>{{ successDescription }}</p>
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
  animation: fadeInDown 0.8s;
}

.all-books-header h2::after {
  content: "";
  position: absolute;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  bottom: 0;
  left: 0;
  animation: widthExtend 1s ease-out;
}

@keyframes widthExtend {
  from { width: 0; }
  to { width: 50px; }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 30px 0;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.8s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
  animation: cardFloat 0.6s ease-out backwards;
  min-height: 380px;
  display: flex;
  flex-direction: column;
}

@keyframes cardFloat {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 为卡片添加交错动画效果 */
.all-books-list > div:nth-child(1) { animation-delay: 0.1s; }
.all-books-list > div:nth-child(2) { animation-delay: 0.2s; }
.all-books-list > div:nth-child(3) { animation-delay: 0.3s; }
.all-books-list > div:nth-child(4) { animation-delay: 0.4s; }
.all-books-list > div:nth-child(5) { animation-delay: 0.5s; }
.all-books-list > div:nth-child(6) { animation-delay: 0.6s; }
.all-books-list > div:nth-child(7) { animation-delay: 0.7s; }
.all-books-list > div:nth-child(8) { animation-delay: 0.8s; }
.all-books-list > div:nth-child(9) { animation-delay: 0.9s; }
.all-books-list > div:nth-child(10) { animation-delay: 1.0s; }
.all-books-list > div:nth-child(11) { animation-delay: 1.1s; }
.all-books-list > div:nth-child(12) { animation-delay: 1.2s; }

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
  background: linear-gradient(135deg, #fff6f6 0%, #ffefef 100%);
  padding: 15px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 220px;
}

.book-image img {
  height: 190px;
  width: auto;
  max-width: 85%;
  object-fit: contain;
  transition: transform 0.5s ease;
  filter: drop-shadow(0 6px 12px rgba(255, 107, 107, 0.2));
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
  padding: 16px;
  background: white;
  position: relative;
  justify-content: space-between;
}

.book-details::before {
  content: "";
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,107,107,0), rgba(255,107,107,0.3), rgba(255,107,107,0));
}

.book-title {
  position: relative;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #333;
  transition: color 0.3s;
  margin-bottom: 5px;
  margin-top: 3px;
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

/* 修改库存样式与广告样式保持一致 */
.stock-info {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  width: 100%;
  margin-top: auto;
  padding-top: 0;
}

.stock-badge, .frozen-stock-badge {
  flex: 1;
  padding: 7px 10px;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #e8f7f0;
  color: #2e8b57;
  border: 1px solid rgba(46, 139, 87, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  height: 35px;
}

.stock-badge::before, .frozen-stock-badge::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%);
  z-index: 1;
}

.stock-badge span, .stock-badge i, .frozen-stock-badge span, .frozen-stock-badge i {
  position: relative;
  z-index: 2;
}

.stock-badge.low-stock {
  background-color: #fff0f0;
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.1);
}

.frozen-stock-badge {
  background-color: #e6f0ff;
  color: #4a6fa5;
  border: 1px solid rgba(74, 111, 165, 0.1);
}

.book-card:hover .stock-badge, .book-card:hover .frozen-stock-badge {
  box-shadow: 0 5px 15px rgba(46, 139, 87, 0.15);
  transform: translateY(-2px);
}

/* 修改管理员操作按钮样式 */
.admin-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  width: 100%;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 7px 8px;
  border-radius: 18px;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.edit-btn {
  background: #f2f2f2;
  color: #444;
  border: 1px solid rgba(0,0,0,0.05);
}

.edit-btn:hover {
  background: #ebebeb;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  color: #ff6b6b;
}

.delete-btn {
  background: #f2f2f2;
  color: #444;
  border: 1px solid rgba(0,0,0,0.05);
}

.delete-btn:hover {
  background: #ebebeb;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  color: #ff6b6b;
}

/* 删除确认弹窗样式 */
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
  background: linear-gradient(135deg, #fff 0%, #f9f9f9 100%);
  border-radius: 20px;
  padding: 35px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: scaleIn 0.4s ease;
  text-align: center;
  border: 1px solid rgba(255, 107, 107, 0.1);
}

.delete-modal-icon {
  font-size: 50px;
  margin-bottom: 20px;
  animation: wobble 1s;
  display: inline-block;
}

@keyframes wobble {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-15px) rotate(-5deg); }
  30% { transform: translateX(10px) rotate(3deg); }
  45% { transform: translateX(-10px) rotate(-3deg); }
  60% { transform: translateX(5px) rotate(2deg); }
  75% { transform: translateX(-5px) rotate(-1deg); }
}

.delete-modal h3 {
  margin: 0 0 15px;
  color: #ff6b6b;
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.delete-modal p {
  color: #555;
  line-height: 1.6;
  font-size: 16px;
  margin-bottom: 10px;
}

.warning-text {
  color: #ff6b6b;
  font-size: 15px;
  font-weight: 500;
  padding: 10px 20px;
  background-color: rgba(255, 107, 107, 0.08);
  border-radius: 15px;
  margin: 15px 0;
  display: inline-block;
}

.delete-modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.cancel-btn, .confirm-delete-btn {
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.cancel-btn {
  background: #f2f2f2;
  color: #555;
  border: 1px solid rgba(0,0,0,0.05);
}

.cancel-btn:hover {
  background: #e8e8e8;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.confirm-delete-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.confirm-delete-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}

/* 分页控件统一样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  animation: fadeIn 1s 0.3s both;
}

.pagination button {
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
}

.pagination button:disabled {
  background: #f0f0f0;
  color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.pagination button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

.pagination span {
  font-size: 15px;
  color: #555;
  font-weight: 500;
}

/* 加载中和错误状态统一样式 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
  animation: fadeIn 0.8s;
}

.loading-spinner {
  width: 60px;
  height: 60px;
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
  margin-bottom: 25px;
  font-size: 18px;
  max-width: 600px;
}

.retry-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
}

.retry-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
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

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(255, 107, 107, 0.15);
  border-color: rgba(255, 107, 107, 0.2);
}

/* 媒体查询样式保留 */
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
    height: 180px;
  }
  
  .book-image img {
    height: 160px;
  }
  
  .book-title {
    font-size: 14px;
    height: 40px;
  }
  
  .book-details {
    padding: 15px;
  }
}

/* 修复删除的图标样式 */
.action-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* 确保保留其他关键样式 */
@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 成功提示样式 */
.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  animation: slideIn 0.3s ease;
  pointer-events: none;
}

.success-icon {
  width: 32px;
  height: 32px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.success-content h3 {
  margin: 0;
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 600;
}

.success-content p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #666;
}

.fade-out {
  animation: fadeOut 0.3s ease forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>

