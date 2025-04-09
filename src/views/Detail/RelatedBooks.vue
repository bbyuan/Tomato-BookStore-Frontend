<template>
  <div class="related-books-container">
    <h3 class="related-title">相关书籍</h3>
    <div class="related-books-list">
      <div
        v-for="(book, index) in sortedRelatedBooks"
        :key="index"
        class="related-book-item"
      >
        <div class="related-cover-container">
          <img :src="book.image" alt="相关书籍封面" class="related-cover" />
        </div>
        <h3 class="related-name">{{ book.title }}</h3>
        <div class="related-pricing">
          <span class="current-price">¥{{ formatPrice(book.price) }}</span>
          <span class="original-price">¥{{ formatPrice(book.originalPrice) }}</span>
          <span class="discount">{{ calculateDiscount(book.price) }}折</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  relatedBooks: {
    type: Array,
    default: () => []
  },
  currentBookId: {
    type: Number,
    required: true
  }
});

// 格式化价格
const formatPrice = (price) => {
  return Number(price).toFixed(2)
}

// 计算折扣
const calculateDiscount = (currentPrice) => {
  const originalPrice = currentPrice + 20
  if (originalPrice === 0) return 0
  return Math.round((currentPrice / originalPrice) * 10)
}

// 根据当前书籍ID筛选相关书籍
const sortedRelatedBooks = computed(() => {
  return [...props.relatedBooks]
    .map(book => ({
      ...book,
      idDifference: Math.abs(book.id - props.currentBookId)
    }))
    .sort((a, b) => a.idDifference - b.idDifference) // 按差值排序
    .slice(0, 5); // 取前五个
});
</script>

<style scoped>
.related-books-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.related-title {
  font-size: 22px;
  margin-bottom: 15px;
  color: #333;
}

.related-books-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.related-book-item {
  width: 18%; /* 调窄卡片宽度 */
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
  cursor: pointer;
}

.related-book-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.related-cover-container {
  padding: 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
  border-radius: 8px;
  margin-bottom: 10px;
}

.related-cover {
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.related-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 10px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.related-pricing {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b6b;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.discount {
  font-size: 14px;
  color: #ff6b6b;
  background: #ffe8e8;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .related-book-item {
    width: 23%; /* 调整响应式宽度 */
  }
}

@media (max-width: 992px) {
  .related-book-item {
    width: 30%; /* 调整响应式宽度 */
  }
}

@media (max-width: 768px) {
  .related-book-item {
    width: 48%; /* 调整响应式宽度 */
  }
}

@media (max-width: 576px) {
  .related-book-item {
    width: 100%; /* 保持全宽 */
  }
}
</style>
