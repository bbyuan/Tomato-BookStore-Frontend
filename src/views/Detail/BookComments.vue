<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  bookId: {
    type: [Number, String],
    required: true
  }
})

interface Comment {
  id: number
  username: string
  avatar: string
  content: string
  rating: number
  createdAt: string
}

const comments = ref<Comment[]>([])
const isLoading = ref(true)
const error = ref('')

// 获取评论列表
const fetchComments = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/books/${props.bookId}/comments`
    )
    
    if (response.data && response.data.code === '200') {
      comments.value = response.data.data || []
    } else {
      error.value = response.data?.msg || '获取评论失败'
    }
  } catch (err: any) {
    console.error('获取评论出错:', err)
    error.value = err.message || '获取评论失败'
  } finally {
    isLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchComments()
})
</script>

<template>
  <div class="comments-container">
    <h2 class="section-title">用户评论</h2>
    
    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-if="isLoading" class="loading-state">
        加载评论中...
      </div>
      
      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>
      
      <div v-else-if="comments.length === 0" class="empty-state">
        暂无评论！
      </div>
      
      <div v-else class="comment-items">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <div class="user-info">
              <img :src="comment.avatar || '/src/assets/default-avatar.png'" alt="用户头像" class="user-avatar">
              <span class="username">{{ comment.username }}</span>
            </div>
            
            <div class="comment-rating">
              <span 
                v-for="star in 5" 
                :key="star"
                class="rating-star"
                :class="{ filled: star <= comment.rating }"
              >
                ★
              </span>
            </div>
          </div>
          
          <div class="comment-content">
            {{ comment.content }}
          </div>
          
          <div class="comment-footer">
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comments-container {
  margin-top: 40px;
  padding: 30px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  position: relative;
  padding-bottom: 12px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  border-radius: 3px;
}

/* 评论列表 */
.comments-list {
  margin-top: 20px;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 30px;
  color: #888;
  font-size: 16px;
}

.error-state {
  color: #ff6b6b;
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding: 20px;
  border-radius: 12px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.comment-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.username {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.comment-rating {
  display: flex;
}

.rating-star {
  font-size: 18px;
  color: #ddd;
  margin-left: 2px;
}

.rating-star.filled {
  color: #ffcc00;
}

.comment-content {
  font-size: 16px;
  line-height: 1.6;
  color: #444;
  margin-bottom: 15px;
  word-break: break-word;
}

.comment-footer {
  display: flex;
  justify-content: flex-end;
}

.comment-date {
  font-size: 14px;
  color: #888;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .comments-container {
    padding: 20px;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>