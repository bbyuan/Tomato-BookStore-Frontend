<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import BookInfo from '@/views/Detail/BookInfo.vue'
import RelatedBooks from '@/views/Detail/RelatedBooks.vue'
import RankingList from '@/views/HomePage/BookRanking.vue'

import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

interface Book {
  id: number
  title: string
  price: string
  originalPrice: string
  image: string
  description: string
  rating?: number
  author?: string
  subtitle?: string
  isbn?: string
  binding?: string
  pages?: number
  publisher?: string
  publishDate?: string
}

const route = useRoute()
const bookId = Number(route.params.bookId)

const book = ref<Book | null>(null)
const relatedBooks = ref<Book[]>([])

// 模拟异步请求书籍详情数据
const fetchBookDetail = async (id: number): Promise<Book> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: `示例书籍 ${id}`,
        price: '¥59.00',
        originalPrice: '¥79.00',
        image: '/src/assets/images/BookTemplate.avif',
        description: '这是这本书的详细描述，讲述了书的内容、特点以及其它相关信息。',
        rating: 4.8,
        author: '张三',
        subtitle: '副标题示例',
        isbn: '978-1234567890',
        binding: '平装',
        pages: 320,
        publisher: '示例出版社',
        publishDate: '2022-01-01'
      })
    }, 800)
  })
}

// 模拟异步请求相关书籍数据
const fetchRelatedBooks = async (id: number): Promise<Book[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: id + 1,
          title: '相关书籍 1',
          price: '¥49.00',
          originalPrice: '¥69.00',
          image: '/src/assets/images/BookTemplate.avif',
          description: '相关书籍的描述信息。'
        },
        {
          id: id + 2,
          title: '相关书籍 2',
          price: '¥39.00',
          originalPrice: '¥59.00',
          image: '/src/assets/images/BookTemplate.avif',
          description: '相关书籍的描述信息。'
        }
      ])
    }, 800)
  })
}

onMounted(async () => {
  // 获取当前书籍详情
  book.value = await fetchBookDetail(bookId)
  // 获取相关书籍列表
  relatedBooks.value = await fetchRelatedBooks(bookId)
})
</script>

<template>
  <div class="detail-container">
    <Header class="fixed-header" />
    <div class="detail-content">
      <!-- 上部区域：书籍信息和排行榜并排 -->
      <div class="top-section">
        <div class="book-info-wrapper" v-if="book">
          <BookInfo :bookInfo="book" />
        </div>
        <div class="ranking-wrapper">
          <RankingList />
        </div>
      </div>
      
      <!-- 下部区域：相关书籍列表 -->
      <div class="bottom-section" v-if="relatedBooks.length">
        <RelatedBooks :relatedBooks="relatedBooks" />
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  margin-top: 60px;
  width: 100%;
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
</style>