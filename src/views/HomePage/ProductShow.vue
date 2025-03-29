<script setup lang="ts">
const books = [
  {
    id: 1,
    title: 'LFYEMIOT DB',
    image: '@/assets/book1.jpg',
  },
  {
    id: 2,
    title: 'EEIMZMOJ FOUR',
    image: '@/assets/book2.jpg',
  },
  {
    id: 3,
    title: 'TEERNOE1 MENT',
    image: '@/assets/book3.jpg',
  },
  {
    id: 4,
    title: 'EEISIEO TUST',
    image: '@/assets/book4.jpg',
  },
  // 更多图书...
]
</script>

<template>
  <div class="products-container">
    <div class="products-header">
      <h2>Musiloitls</h2>
      <div class="header-actions">
        <span>日</span>
        <span>在写型</span>
        <el-button circle icon="Plus" />
      </div>
    </div>
    <div class="products-subtitle">
      O2O H11G5 TO1VEL HU7IFDYOGN.M1Y1G6OB
    </div>
    <el-row :gutter="20" class="products-grid">
      <el-col v-for="book in books" :key="book.id" :span="6">
        <div class="book-card">
          <img :src="book.image" :alt="book.title" class="book-image">
          <h3 class="book-title">{{ book.title }}</h3>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.products-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.products-subtitle {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}

.products-grid {
  margin-top: 20px;
}

.book-card {
  margin-bottom: 20px;
}

.book-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.book-title {
  font-size: 14px;
  color: #333;
  margin: 8px 0;
}
</style>
