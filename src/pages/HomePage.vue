<script setup lang="ts">
import HomeHeader from '@/views/HomePage/Header.vue'
import HomeAside from '@/views/HomePage/Aside.vue'
import HomeSlides from '@/views/HomePage/Slides.vue'
import HomeProductShow from '@/views/HomePage/ProductShow.vue'
</script>

<template>
  <div class="home-container">
    <HomeHeader class="fixed-header" />
    <div class="main-content">
      <HomeAside class="aside" />
      <div class="right-content">
        <HomeSlides />
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
}

.main-content {
  display: flex;
  margin-top: 60px;
  padding: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  gap: 20px;
}

.aside {
  flex-shrink: 0;
  width: 240px;
}

.right-content {
  flex: 1;
  min-width: 0;
}
</style>