<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

const router = useRouter();

const reviews = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const showReviewDetailModal = ref(false);
const currentReview = ref<any>(null);
const successMessage = ref('');
const successDescription = ref('');

const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value);
});

// 切换到上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchReviews();
  }
};

// 切换到下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchReviews();
  }
};

// 获取评价列表数据
const fetchReviews = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      console.error('未找到token，用户可能未登录');
      return;
    }
    
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/reviews`;
    

    const response = await axios.get(apiUrl, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      },
      params: {
        status: 'PENDING',
        pageNum: currentPage.value,
        pageSize: pageSize.value
      }
    });

    console.log('Fetching reviews from:', apiUrl);
    console.log('Response data:', response.data);

    if (response.data && response.data.code === '200') {
      reviews.value = response.data.data.reviews;
      totalCount.value = response.data.data.pageInfo.total_page || 0;
      
      // 正确处理响应中的media字段，确保图片URL可以正确显示
      reviews.value.forEach(review => {
        if (!review.media) {
          review.media = []; // 如果没有media字段，设为空数组
        } else if (!Array.isArray(review.media)) {
          // 如果media不是数组，将其转换为数组
          review.media = [review.media];
        }
        
        // 确保每个media对象都有正确的image属性
        review.media.forEach((mediaItem: any) => {
          if (typeof mediaItem === 'string') {
            // 如果media是字符串，转换为对象格式
            mediaItem = { image: mediaItem, imageName: '' };
          } else if (!mediaItem.image && mediaItem.imageName) {
            // 如果没有image但有imageName，则使用imageName
            mediaItem.image = mediaItem.imageName;
          }
        });
      });
    } else {
      error.value = '获取评价数据失败: ' + (response.data ? response.data.msg || '未知错误' : '服务器响应格式错误');
    }
  } catch (err: any) {
    console.error('获取评价列表出错:', err);
    if (err.response && err.response.status === 401) {
      error.value = '认证失败，请重新登录';
    } else {
      error.value = `网络请求错误: ${err.message || '未知错误'}`;
    }
  } finally {
    loading.value = false;
  }
};

// 显示评价详情
const showReviewDetail = (review: any) => {
  currentReview.value = review;
  showReviewDetailModal.value = true;
};

// 关闭评价详情
const closeReviewDetail = () => {
  showReviewDetailModal.value = false;
  currentReview.value = null;
};

// 审核通过
const approveReview = async (reviewId: string) => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      return;
    }

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}/approve`;
    
    const response = await axios.put(apiUrl, {}, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.code === 200) {
      showSuccessMessage('审核通过', '该评价已成功通过审核');
      fetchReviews(); // 刷新列表
      if (showReviewDetailModal.value) {
        closeReviewDetail();
      }
    } else {
      ElMessage.error('审核操作失败: ' + (response.data.msg || '未知错误'));
    }
  } catch (err: any) {
    console.error('审核操作失败:', err);
    ElMessage.error(`审核操作失败: ${err.message || '未知错误'}`);
  }
};

// 审核拒绝
const rejectReview = async (reviewId: string) => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      return;
    }

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}/reject`;
    
    const response = await axios.put(apiUrl, {}, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.code === 200) {
      showSuccessMessage('审核拒绝', '该评价已被拒绝');
      fetchReviews(); // 刷新列表
      if (showReviewDetailModal.value) {
        closeReviewDetail();
      }
    } else {
      ElMessage.error('审核操作失败: ' + (response.data.msg || '未知错误'));
    }
  } catch (err: any) {
    console.error('审核操作失败:', err);
    ElMessage.error(`审核操作失败: ${err.message || '未知错误'}`);
  }
};

// 显示确认拒绝对话框
const showRejectConfirm = (reviewId: string) => {
  ElMessageBox.confirm(
    '您确定要拒绝此评价吗？被拒绝的评价将不会显示给用户。',
    '拒绝评价',
    {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      rejectReview(reviewId);
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 显示成功消息
const showSuccessMessage = (title: string, description: string) => {
  successMessage.value = title;
  successDescription.value = description;
  
  setTimeout(() => {
    successMessage.value = '';
    successDescription.value = '';
  }, 3000);
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取评价内容预览
const getCommentPreview = (comment: string) => {
  if (!comment) return '';
  return comment.length > 50 ? comment.substring(0, 50) + '...' : comment;
};

// 获取图片URL列表
const getImageUrlList = (mediaList: any[]) => {
  if (!mediaList || !Array.isArray(mediaList)) return [];
  return mediaList.map(item => item.image);
};

// 组件挂载时获取数据
onMounted(() => {
  fetchReviews();
});
</script>

<template>
  <div class="review-management">
    <header class="review-header">
      <h1>评价审核管理</h1>
      <div class="review-stats">
        <span>待审核评价: {{ totalCount }}</span>
      </div>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>正在加载评价数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
      <p>{{ error }}</p>
      <button @click="fetchReviews" class="retry-button">重试</button>
    </div>

    <!-- 评价列表 -->
    <div v-else-if="reviews.length === 0" class="empty-container">
      <div class="empty-icon">📝</div>
      <p>暂无待审核评价</p>
    </div>

    <div v-else class="reviews-list">
      <!-- 表格头部 -->
      <div class="review-table-header">
        <div class="review-cell review-id">评价ID</div>
        <div class="review-cell user-id">用户ID</div>
        <div class="review-cell book-id">图书ID</div>
        <div class="review-cell rating">评分</div>
        <div class="review-cell comment">评价内容</div>
        <div class="review-cell created-at">创建时间</div>
        <div class="review-cell actions">操作</div>
      </div>

      <!-- 表格内容 -->
      <div 
        v-for="review in reviews" 
        :key="review.reviewId" 
        class="review-row"
        @click="showReviewDetail(review)"
      >
        <div class="review-cell review-id">{{ review.reviewId }}</div>
        <div class="review-cell user-id">{{ review.userId }}</div>
        <div class="review-cell book-id">{{ review.bookId }}</div>
        <div class="review-cell rating">
          <div class="star-rating">
            <el-rate
              v-model="review.rating"
              disabled
              show-score
              text-color="#ff9900"
            />
          </div>
        </div>
        <div class="review-cell comment">
          <div class="comment-preview">{{ getCommentPreview(review.comment) }}</div>
        </div>
        <div class="review-cell created-at">{{ formatDate(review.createdAt) }}</div>
        <div class="review-cell actions">
          <button 
            class="action-button approve" 
            @click.stop="approveReview(review.reviewId)"
            title="通过审核"
          >
            通过
          </button>
          <button 
            class="action-button reject" 
            @click.stop="showRejectConfirm(review.reviewId)"
            title="拒绝审核"
          >
            拒绝
          </button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="reviews.length > 0" class="pagination">
      <button 
        class="pagination-button"
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        上一页
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button 
        class="pagination-button"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        下一页
      </button>
    </div>

    <!-- 评价详情弹窗 -->
    <div v-if="showReviewDetailModal" class="modal-overlay" @click="closeReviewDetail">
      <div class="review-detail-modal" @click.stop>
        <!-- 弹窗头部 -->
        <div class="modal-header">
          <h2>评价详情</h2>
          <button class="close-button" @click="closeReviewDetail">&times;</button>
        </div>

        <!-- 弹窗内容 -->
        <div v-if="currentReview" class="modal-content">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">评价ID:</span>
              <span class="detail-value">{{ currentReview.reviewId }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">用户ID:</span>
              <span class="detail-value">{{ currentReview.userId }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">订单ID:</span>
              <span class="detail-value">{{ currentReview.orderId }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">图书ID:</span>
              <span class="detail-value">{{ currentReview.bookId }}</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">评分:</span>
              <span class="detail-value rating-value">
                <el-rate
                  v-model="currentReview.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
              </span>
            </div>
            
            <div class="detail-item">
              <span class="detail-label">创建时间:</span>
              <span class="detail-value">{{ formatDate(currentReview.createdAt) }}</span>
            </div>
          </div>
          
          <!-- 评价内容 -->
          <div class="comment-section">
            <h3>评价内容:</h3>
            <div class="comment-content">{{ currentReview.comment }}</div>
          </div>
          
          <!-- 媒体文件 -->
          <div v-if="currentReview.media && currentReview.media.length > 0" class="media-section">
            <h3>媒体文件:</h3>
            <div class="media-grid">
              <div 
                v-for="(mediaItem, index) in currentReview.media" 
                :key="index"
                class="media-item"
              >
                <el-image
                  :src="mediaItem.image"
                  :preview-src-list="getImageUrlList(currentReview.media)"
                  fit="cover"
                  class="media-image"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 弹窗底部按钮 -->
        <div class="modal-footer">
          <button 
            class="modal-button approve"
            @click="approveReview(currentReview?.reviewId)"
          >
            通过审核
          </button>
          <button 
            class="modal-button reject"
            @click="showRejectConfirm(currentReview?.reviewId)"
          >
            拒绝审核
          </button>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-notification">
      <div class="success-icon">✓</div>
      <div class="success-content">
        <h3>{{ successMessage }}</h3>
        <p>{{ successDescription }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-management {
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

.review-management::before {
content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

/* 头部样式 */
.review-header {
  padding: 25px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: #2d3436;
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInDown 0.8s;
}

.review-header h1::after {
  content: "";
  position: absolute;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  bottom: 0;
  left: 0;
  animation: widthExtend 1s ease-out;
}

.review-stats {
  padding: 8px 15px;
  background-color: #fff;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  border-left: 4px solid #ff6b6b;
}

.error-icon {
  width: 40px;
  height: 40px;
  background-color: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

.error-container p {
  color: #495057;
  margin-bottom: 20px;
  text-align: center;
}

.retry-button {
  padding: 8px 20px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #ff5252;
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #adb5bd;
}

.empty-container p {
  color: #6c757d;
  font-size: 16px;
}

/* 评价列表 */
.reviews-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.review-table-header {
  display: flex;
  background-color: #f8f9fa;
  padding: 12px 15px;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
}

.review-cell {
  padding: 8px 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.review-row {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
  cursor: pointer;
}

.review-row:hover {
  background-color: #f8f9fa;
}

.review-row:last-child {
  border-bottom: none;
}

.review-id, .user-id, .book-id {
  width: 12%;
}

.rating {
  width: 10%;
}

.comment {
  width: 25%;
}

.created-at {
  width: 15%;
}

.actions {
  width: 14%;
  display: flex;
  justify-content: flex-start;
  gap: 5px;
}

.star-rating {
  display: flex;
  align-items: center;
}

.comment-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 12px;
  transition: all 0.2s;
}

.action-button.approve {
  background-color: #51cf66;
  color: white;
}

.action-button.approve:hover {
  background-color: #40c057;
}

.action-button.reject {
  background-color: #ff6b6b;
  color: white;
}

.action-button.reject:hover {
  background-color: #ff5252;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.pagination-button {
  padding: 8px 15px;
  border: 1px solid #dee2e6;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: #495057;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background-color: #e9ecef;
}

.page-info {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #495057;
  font-size: 14px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.review-detail-modal {
  background-color: #fff;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #343a40;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  line-height: 1;
}

.modal-content {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 14px;
  color: #212529;
}

.rating-value {
  display: flex;
  align-items: center;
}

.comment-section {
  margin-bottom: 20px;
}

.comment-section h3 {
  font-size: 16px;
  color: #343a40;
  margin-bottom: 10px;
}

.comment-content {
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size:.14px;
  color: #212529;
  white-space: pre-wrap;
  word-break: break-word;
}

.media-section h3 {
  font-size: 16px;
  color: #343a40;
  margin-bottom: 10px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.media-item {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.modal-button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.modal-button.approve {
  background-color: #51cf66;
  color: white;
}

.modal-button.approve:hover {
  background-color: #40c057;
}

.modal-button.reject {
  background-color: #ff6b6b;
  color: white;
}

.modal-button.reject:hover {
  background-color: #ff5252;
}

/* 成功提示 */
.success-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  z-index: 1001;
  border-left: 4px solid #51cf66;
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

.success-icon {
  width: 30px;
  height: 30px;
  background-color: #51cf66;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 15px;
}

.success-content h3 {
  margin: 0 0 5px;
  font-size: 16px;
  color: #212529;
}

.success-content p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .review-stats {
    align-self: flex-start;
  }

  .review-table-header, .review-row {
    display: none;
  }

  .reviews-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px;
  }

  .reviews-list > div {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 15px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

