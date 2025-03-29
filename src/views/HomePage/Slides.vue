<script setup lang="ts">
const bannerContent = {
  title: 'Ponnetoo on fire Parioslor',
  subtitle: '长期以来感谢大家对平台的支持和信任！希望接下来的日子里',
  buttonText: '立即查看详情'
}
</script>

<template>
  <div class="banner-container">
    <div class="banner-content">
      <h1 class="banner-title">{{ bannerContent.title }}</h1>
      <p class="banner-subtitle">{{ bannerContent.subtitle }}</p>
      <el-button type="success" class="banner-button">{{ bannerContent.buttonText }}</el-button>
    </div>
    <div class="banner-image">
      <!-- 这里需要放置banner图片，建议使用实际的图片资源 -->
    </div>
  </div>
</template>

<style scoped>
.banner-container {
  background-color: #ff6b6b;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  height: 200px;
}

.banner-content {
  flex: 1;
  padding-right: 40px;
}

.banner-title {
  font-size: 32px;
  margin-bottom: 15px;
}

.banner-subtitle {
  font-size: 16px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.banner-button {
  border-radius: 20px;
  padding: 12px 30px;
}

.banner-image {
  flex: 1;
  height: 100%;
}
</style>
