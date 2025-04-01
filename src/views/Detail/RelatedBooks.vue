<template>
    <div class="related-books-container">
      <h3 class="related-title">相关书籍</h3>
      <div class="related-books-list">
        <div
          v-for="(book, index) in relatedBooks"
          :key="index"
          class="related-book-item"
        >
          <img :src="book.image" alt="相关书籍封面" class="related-cover" />
          <p class="related-name">{{ book.title }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  
  const props = defineProps({
    relatedBooks: {
      type: Array,
      default: () => []
    }
  })
  </script>
  
  <style scoped>
  .related-books-container {
    background-color: #fff;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    width: 100%;
    box-sizing: border-box;
  }
  
  .related-title {
    font-size: 22px; /* 调整标题字体大小 */
    margin-bottom: 15px;
    color: #333;
  }
  
  .related-books-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); /* 自适应网格布局 */
    gap: 25px;
    margin-top: 20px;
  }
  
  .related-book-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .related-cover {
    width: 120px;
    height: 160px;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  .related-name {
    margin-top: 10px;
    font-size: 16px; /* 调整字体大小 */
    color: #333;
  }

  /* 添加响应式布局 */
  @media (max-width: 768px) {
    .related-books-container {
      padding: 20px;
    }

    .related-books-list {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 15px;
    }
  }
  </style>
