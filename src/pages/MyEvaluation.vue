<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import EvaluationModal from '@/views/Evaluation/EvaluationModal.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import RatingStars from '@/views/Detail/RatingStars.vue' 

// 路由
const router = useRouter()

// 评价状态定义
type ReviewStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

// 评价状态文本映射
const reviewStatusTextMap = {
  'ALL': '全部评价',
  'PENDING': '待审核',
  'APPROVED': '已通过',
  'REJECTED': '已驳回'
}

// 评价修改相关状态
const showEvaluationModal = ref(false)
const currentReview = ref<ReviewVO | null>(null)
const currentEvaluationProduct = ref<{
  productId: string
  title: string
  image: string
  price: number
} | null>(null)
const currentOrderId = ref('')

// 评价媒体类型
interface ReviewMediaVO {
  imageName: string
  image: string
}

// 用户信息类型
interface UsersVO {
  userId: string
  username: string
  avatar?: string
}

// 商品信息类型
interface ProductVO {
  id: string
  title: string
  price: number
  originalPrice?: number
  rate?: number
  description?: string
  category?: string
  cover?: string
  cover_name?: string
  covers?: string[]
  covers_name?: string[]
  detail?: string
  specifications?: any[]
  stock?: any
}

// 评价类型
interface ReviewVO {
  reviewId: string
  userId: string
  orderId: string
  bookId: string
  rating: number
  comment: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  reviewedAt?: string
  rejectReason?: string
  media?: ReviewMediaVO[]
  user?: UsersVO
  product?: ProductVO // 新增
}

// 分页信息
interface PageInfoVO {
  pageNum: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
  totalPage: number
  totalCount: number
  averageRating?: number
  totalReviews?: number
}

// 评价列表响应类型
interface ReviewPageVO {
  reviews: ReviewVO[]
  pageInfo: PageInfoVO
}

// 后端API响应类型
interface ApiReviewResponse {
  code: string
  msg: string
  data: ReviewPageVO
}

// 当前选中的评价标签
const activeReviewTab = ref<ReviewStatus>('ALL')

// 评价数据
const allReviews = ref<ReviewVO[]>([])

// 各状态评价数量统计
const reviewCounts = ref({
  ALL: 0,
  PENDING: 0,
  APPROVED: 0,
  REJECTED: 0
})

// 评价加载状态
const reviewLoading = ref(false)

// 评价错误信息
const reviewError = ref('')

// 获取评价数据
const fetchReviews = async (status: ReviewStatus = 'ALL') => {
  reviewLoading.value = true
  reviewError.value = ''
  
  try {
    // 检查用户是否已登录
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (!token || !username) {
      console.error('未找到token或用户名')
      reviewError.value = '请先登录后查看评价'
      reviewLoading.value = false
      // 直接跳转到登录页面
      setTimeout(() => {
        router.push('/')
      }, 1500)
      return
    }

    // 请求评价数据
    const response = await axios.get<ApiReviewResponse>('/api/reviews/user', {
      params: {
        pageNum: 1,
        pageSize: 100,
        status
      },
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('评价API响应:', response.data)
    
    if (response.data.code === '200') {
      // 更新评价数据
      allReviews.value = response.data.data.reviews || []
      
      // 更新评价数量统计
      if (status === 'ALL') {
        reviewCounts.value.ALL = response.data.data.pageInfo.totalCount || 0
      }
      
      console.log('获取到的评价数据:', allReviews.value)
    } else if (response.data.code === '401') {
      // 处理未授权访问
      reviewError.value = '登录已过期，请重新登录'
      // 清除过期token
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
      // 跳转到登录页面
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      reviewError.value = response.data.msg || '获取评价数据失败'
    }
  } catch (err: any) {
    console.error('获取评价失败:', err)
    if (err.response?.status === 401) {
      reviewError.value = '登录已过期，请重新登录'
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      reviewError.value = '网络错误，请稍后重试'
    }
  } finally {
    reviewLoading.value = false
  }
}

// 更新评价数量统计
const updateReviewCounts = async () => {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) return

    // 分别获取各状态的评价数量
    const promises = [
      axios.get<ApiReviewResponse>('/api/reviews/user', {
        params: { pageNum: 1, pageSize: 1, status: 'ALL' },
        headers: { 'token': token, 'Content-Type': 'application/json' }
      }),
      axios.get<ApiReviewResponse>('/api/reviews/user', {
        params: { pageNum: 1, pageSize: 1, status: 'PENDING' },
        headers: { 'token': token, 'Content-Type': 'application/json' }
      }),
      axios.get<ApiReviewResponse>('/api/reviews/user', {
        params: { pageNum: 1, pageSize: 1, status: 'APPROVED' },
        headers: { 'token': token, 'Content-Type': 'application/json' }
      }),
      axios.get<ApiReviewResponse>('/api/reviews/user', {
        params: { pageNum: 1, pageSize: 1, status: 'REJECTED' },
        headers: { 'token': token, 'Content-Type': 'application/json' }
      })
    ]

    const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all(promises)
    
    reviewCounts.value = {
      ALL: allRes.data.code === '200' ? allRes.data.data.pageInfo.totalCount || 0 : 0,
      PENDING: pendingRes.data.code === '200' ? pendingRes.data.data.pageInfo.totalCount || 0 : 0,
      APPROVED: approvedRes.data.code === '200' ? approvedRes.data.data.pageInfo.totalCount || 0 : 0,
      REJECTED: rejectedRes.data.code === '200' ? rejectedRes.data.data.pageInfo.totalCount || 0 : 0
    }
    
    console.log('评价数量统计:', reviewCounts.value)
  } catch (err) {
    console.error('获取评价数量统计失败:', err)
  }
}

// 根据当前选中标签筛选评价
const filteredReviews = computed(() => {
  if (activeReviewTab.value === 'ALL') {
    return allReviews.value
  }
  return allReviews.value.filter(review => review.status === activeReviewTab.value)
})

// 切换评价标签
const switchReviewTab = (tab: ReviewStatus) => {
  activeReviewTab.value = tab
  fetchReviews(tab)
}

// 获取每个标签的评价数量
const getReviewTabCount = (status: ReviewStatus) => {
  return reviewCounts.value[status] || 0
}

// 格式化评价时间
const formatReviewTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

// 跳转到商品详情
const goToBookDetail = (bookId: string) => {
  router.push({
    name: 'Detail',
    params: { id: bookId }
  })
}

// 打开评价编辑弹窗
const editReview = (review: ReviewVO) => {
  currentReview.value = review

  // 优先使用product信息
  let title = ''
  let image = ''
  if (review.product) {
    title = review.product.title || `书籍 ${review.bookId}`
    image = review.product.cover || (review.product.covers && review.product.covers.length > 0 ? review.product.covers[0] : '')
  }
  if (!title) title = `书籍 ${review.bookId}`
  if (!image) image = review.media && review.media.length > 0 ? review.media[0].image : '/src/assets/default-book.jpg'

  currentEvaluationProduct.value = {
    productId: review.bookId,
    title,
    image,
    price: review.product?.price || 0
  }

  showEvaluationModal.value = true
}

// 关闭评价编辑弹窗
const closeEvaluationModal = () => {
  showEvaluationModal.value = false
  currentReview.value = null
  currentEvaluationProduct.value = null
}

// 修改评价接口
const updateReview = async (review: ReviewVO) => {
  const token = sessionStorage.getItem('token')
  if (!token) {
    alert('请先登录')
    return false
  }
  try {
    const response = await axios.put(`/api/reviews/${review.reviewId}`, review, {
      headers: {
        token,
        'Content-Type': 'application/json'
      }
    })
    if (response.data.code === '200') {
      return true
    } else {
      alert(response.data.msg || '修改评价失败')
      return false
    }
  } catch (err) {
    alert('网络错误，修改评价失败')
    return false
  }
}

// 评价提交成功处理
const handleEvaluationSubmitted = async (review: ReviewVO) => {
  // 调用修改接口
  const ok = await updateReview(review)
  if (ok) {
    // 刷新评价数据
    fetchReviews(activeReviewTab.value)
    // 显示成功提示
    alert('评价修改成功！')
    showEvaluationModal.value = false
    currentReview.value = null
    currentEvaluationProduct.value = null
  }
}

onMounted(() => {
  // 加载评价数据
  fetchReviews('ALL')
  
  // 更新评价数量统计
  updateReviewCounts()
})
</script>

<template>
  <div class="container">
    <Header class="fixed-header" />
    
    <div class="content">
      <div class="page-header">
        <h2>我的评价</h2>
      </div>
      
      <!-- 评价状态标签 -->
      <div class="review-tabs">
        <div 
          class="tab" 
          :class="{ active: activeReviewTab === 'ALL' }" 
          @click="switchReviewTab('ALL')"
        >
          全部评价
          <span class="count">{{ getReviewTabCount('ALL') }}</span>
        </div>
        <div 
          class="tab" 
          :class="{ active: activeReviewTab === 'PENDING' }" 
          @click="switchReviewTab('PENDING')"
        >
          待审核
          <span class="count">{{ getReviewTabCount('PENDING') }}</span>
        </div>
        <div 
          class="tab" 
          :class="{ active: activeReviewTab === 'APPROVED' }" 
          @click="switchReviewTab('APPROVED')"
        >
          已通过
          <span class="count">{{ getReviewTabCount('APPROVED') }}</span>
        </div>
        <div 
          class="tab" 
          :class="{ active: activeReviewTab === 'REJECTED' }" 
          @click="switchReviewTab('REJECTED')"
        >
          已驳回
          <span class="count">{{ getReviewTabCount('REJECTED') }}</span>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="reviewLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载评价数据...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="reviewError" class="error-state">
        <p>{{ reviewError }}</p>
        <button class="retry-btn" @click="fetchReviews(activeReviewTab)">重试</button>
      </div>
      
      <!-- 空评价状态 -->
      <div v-else-if="filteredReviews.length === 0" class="empty-state">
        <div class="empty-icon">�</div>
        <p>暂无{{ reviewStatusTextMap[activeReviewTab] }}</p>
        <button class="shop-now-btn" @click="router.push('/homepage')">去购物</button>
      </div>
      
      <!-- 评价列表 -->
      <div v-else class="review-list">
        <div v-for="review in filteredReviews" :key="review.reviewId" class="review-card">
          <div class="review-header">
            <div class="review-info">
              <span class="review-id">评价ID: {{ review.reviewId }}</span>
              <span class="review-time">评价时间: {{ formatReviewTime(review.createdAt) }}</span>
            </div>
            <div class="review-status" :class="review.status.toLowerCase()">
              {{ reviewStatusTextMap[review.status] }}
              <span v-if="review.status === 'REJECTED'" class="reject-reason">
                ({{ review.rejectReason || '无驳回理由' }})
              </span>
            </div>
          </div>
          
          <div class="review-content" @click="goToBookDetail(review.bookId)">
            <div class="product-info">
              <img
                class="product-image"
                :src="review.product?.cover || (review.product?.covers && review.product.covers.length > 0 ? review.product.covers[0] : (review.media && review.media.length > 0 ? review.media[0].image : '/src/assets/default-book.jpg'))"
                :alt="review.product?.title || `书籍${review.bookId}`"
              >
              <div class="product-details">
                <div class="product-title">{{ review.product?.title || `书籍ID: ${review.bookId}` }}</div>
                <div class="rating-wrapper">
                  <RatingStars :rating="review.rating" :disabled="true" />
                </div>
              </div>
            </div>
            <div class="review-comment">
              <p>{{ review.comment }}</p>
            </div>
            
            <!-- 修改评价按钮 - 仅待审核和被驳回的评价显示 -->
            <div v-if="review.status === 'PENDING' || review.status === 'REJECTED'" class="review-edit-action">
              <button class="edit-review-btn" @click.stop="editReview(review)">修改评价</button>
            </div>
            
            <!-- 评价媒体 -->
            <div v-if="review.media && review.media.length > 0" class="review-media">
              <div 
                v-for="(media, index) in review.media" 
                :key="index" 
                class="media-item"
              >
                <img :src="media.image" :alt="`评价图片 ${index + 1}`">
              </div>
            </div>
          </div>
          
          <div class="review-footer">
            <div class="review-user" v-if="review.user">
              <img 
                :src="review.user.avatar || '/placeholder-avatar.jpg'" 
                alt="用户头像" 
                class="user-avatar"
              >
              <span class="username">{{ review.user.username }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 评价修改弹窗 -->
    <EvaluationModal 
      v-if="showEvaluationModal"
      v-model:show="showEvaluationModal" 
      :review="currentReview || undefined" 
      :product="currentEvaluationProduct || {productId: '', title: '', image: '', price: 0}"
      @close="closeEvaluationModal"
      @submitted="handleEvaluationSubmitted"
    />
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f9f9f9;
  width: 100%;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.content {
  position: absolute;
  left: 0;
  right: 0;
  margin: 80px auto 30px;
  padding: 0 20px;
  max-width: 1200px;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
  position: relative;
  padding-left: 15px;
}

.page-header h2::before {
  content: "";
  position: absolute;
  left: 0;
  top: 5px;
  bottom: 5px;
  width: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  border-radius: 2px;
}

/* 评价标签页 */
.review-tabs {
  display: flex;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tab {
  flex: 1;
  padding: 15px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: #ff6b6b;
  background-color: #fff9f9;
}

.tab.active {
  color: #ff6b6b;
  border-bottom-color: #ff6b6b;
  background-color: #fff9f9;
}

.tab .count {
  display: inline-block;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: #ff6b6b;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  margin-left: 5px;
  padding: 0 6px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(255, 107, 107, 0.2);
  border-top-color: #ff6b6b;
  animation: spin 1s infinite linear;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 60px 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.error-state p {
  color: #ff6b6b;
  font-size: 18px;
  margin-bottom: 20px;
}

.retry-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #ddd;
}

.empty-state p {
  color: #999;
  font-size: 18px;
  margin-bottom: 20px;
}

.shop-now-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
}

.shop-now-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

/* 评价列表 */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.review-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
  border-left: 3px solid #ff6b6b;
}

.review-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.review-header {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.review-info {
  font-size: 14px;
  color: #666;
}

.review-id {
  margin-right: 20px;
  font-weight: 500;
}

.review-status {
  font-weight: 600;
  font-size: 16px;
}

.review-status.pending {
  color: #e6a23c;
}

.review-status.approved {
  color: #67c23a;
}

.review-status.rejected {
  color: #f56c6c;
}

.reject-reason {
  font-size: 14px;
  margin-left: 8px;
  font-weight: normal;
}

.review-content {
  padding: 20px;
  cursor: pointer;
}

.product-info {
  display: flex;
  margin-bottom: 15px;
}

.product-image {
  width: 80px;
  height: 110px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-right: 15px;
}

.product-details {
  flex: 1;
}

.product-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
}

.rating-wrapper {
  display: flex;
  align-items: center;
}

.rating-value {
  margin-left: 10px;
  font-weight: 600;
  color: #ff9e7d;
}

.review-comment {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  color: #333;
}

.review-comment p {
  margin: 0;
  line-height: 1.6;
}

.review-media {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.media-item {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.media-item img:hover {
  transform: scale(1.05);
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fcfcfc;
  border-top: 1px solid #f0f0f0;
}

.review-user {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.username {
  font-weight: 500;
  color: #666;
}

.review-approved-time {
  font-size: 14px;
  color: #67c23a;
}

/* 修改评价按钮样式 */
.review-edit-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.edit-review-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
}

.edit-review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    padding: 0 10px;
    margin-top: 60px;
  }
  
  .review-tabs {
    flex-wrap: wrap;
  }
  
  .tab {
    padding: 12px 10px;
    font-size: 14px;
    flex: 1 1 40%;
  }
  
  .review-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .product-info {
    flex-direction: column;
  }
  
  .product-image {
    margin-bottom: 15px;
    width: 100%;
    height: auto;
    max-height: 200px;
  }
  
  .media-item {
    width: calc(50% - 5px);
  }
  
  .review-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
