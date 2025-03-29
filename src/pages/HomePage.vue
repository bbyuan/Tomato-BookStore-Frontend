<script setup lang="ts">
import HomeHeader from '@/views/HomePage/Header.vue'
import HomeAsideLeft from '@/views/HomePage/Aside-left.vue'
import HomeSlides from '@/views/HomePage/Slides.vue'
import HomeProductShow from '@/views/HomePage/ProductShow.vue'
import HomeBookRanking from '@/views/HomePage/BookRanking.vue'
</script>

<template>
  <div class="home-container">
    <HomeHeader class="fixed-header" />
    <div class="main-content">
      <HomeAsideLeft class="aside-left" />
      <div class="right-content">
        <div class="content-top">
          <HomeSlides class="slides-section" />
          <HomeBookRanking class="book-ranking" />
        </div>
      </div>
      <div class="full-width-section">
        <HomeProductShow />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
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

.main-content {
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

.aside {
  flex-shrink: 0;
  width: 240px;
  background-color: #fff;
}

.right-content {
  flex: 1;
  padding: 0 20px;
  max-width: calc(100% - 260px);
}

.content-top {
  display: flex;
  margin-bottom: 20px;
  gap: 20px;
  justify-content: space-between;
}

.slides-section {
  flex: 3;
  min-width: 0;
}

.book-ranking {
  flex: 0 0 240px;
  max-width: 240px;
  margin-right: -20px;
}

.full-width-section {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  order: 1;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .aside {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .right-content {
    width: 100%;
    max-width: 100%;
    padding: 0 10px;
  }
  
  .content-top {
    flex-direction: column;
  }
  
  .book-ranking {
    width: 100%;
    max-width: 100%;
    margin-top: 20px;
  }
}
</style>