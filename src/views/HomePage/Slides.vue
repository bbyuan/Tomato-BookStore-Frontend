<script setup lang="ts">
// 新增轮播数据
const slides = [
  { 
    id: 1, 
    title: '程序员的牛马一生', 
    subtitle: '现实主义小说精选', 
    bgColor: '#3a7bd5',
    bgImage: 'linear-gradient(to right, #3a7bd5, #00d2ff)'
  },
  { 
    id: 2, 
    title: '新书特惠', 
    subtitle: '精选好书5折起', 
    bgColor: '#ff6b6b',
    bgImage: 'linear-gradient(to right, #ff6b6b, #ff8e8e)'
  },
  { 
    id: 3, 
    title: '作者签售会', 
    subtitle: '与知名作家面对面交流', 
    bgColor: '#45b7d1',
    bgImage: 'linear-gradient(to right, #45b7d1, #8ed6e8)'
  }
]
</script>

<template>
  <el-carousel indicator-position="outside" height="650px" arrow="always">
    <el-carousel-item v-for="slide in slides" :key="slide.id">
      <div class="banner-container" :style="{ background: slide.bgImage || slide.bgColor }">
        <div class="banner-content">
          <h1 class="banner-title">{{ slide.title }}</h1>
          <p class="banner-subtitle">{{ slide.subtitle }}</p>
          <el-button type="primary" class="banner-button">立即查看</el-button>
        </div>
        <div class="banner-image">
          <img src="@/assets/logo.png" alt="banner" class="banner-img">
        </div>
      </div>
    </el-carousel-item>
  </el-carousel>
</template>

<style scoped>
.banner-container {
  border-radius: 0;
  padding: 0 50px;
  margin-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.banner-content {
  flex: 1;
  max-width: 50%;
}

.banner-title {
  font-size: 42px;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.banner-subtitle {
  font-size: 20px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.banner-button {
  border-radius: 4px;
  padding: 15px 35px;
  font-size: 18px;
  background-color: white;
  color: #333;
  border: none;
}

.banner-button:hover {
  background-color: rgba(255,255,255,0.9);
  color: #333;
}

.banner-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.banner-img {
  max-height: 80%;
  max-width: 80%;
  object-fit: contain;
}

@media (max-width: 768px) {
  .banner-container {
    flex-direction: column;
    padding: 30px 20px;
    text-align: center;
  }
  
  .banner-content {
    max-width: 100%;
    margin-bottom: 20px;
  }
  
  .banner-title {
    font-size: 28px;
  }
  
  .banner-subtitle {
    font-size: 16px;
  }
}
</style>
