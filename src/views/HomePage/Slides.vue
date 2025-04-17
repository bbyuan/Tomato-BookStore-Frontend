<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const slides = ref<any[]>([])

// 获取广告数据
const fetchAdvertisements = async () => {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      console.error('未找到token，用户可能未登录')
      return
    }

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/advertisements`
    const response = await axios.get(apiUrl, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })

    if (response.data && response.data.code === '200') {
      // 将广告数据转换为轮播图数据格式
      slides.value = response.data.data.map((ad: any) => ({
        id: ad.id,
        title: ad.title,
        subtitle: ad.content,
        imageUrl: ad.imageUrl,
        productId: ad.productId,
        bgColor: '#3a7bd5',
        bgImage: 'linear-gradient(to right, #3a7bd5, #00d2ff)'
      }))
    }
  } catch (err) {
    console.error('获取广告数据失败:', err)
  }
}

// 处理点击查看按钮
const handleViewClick = (productId: string) => {
  if (productId) {
    router.push({
      name: 'Detail',
      params: { id: productId }
    })
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAdvertisements()
})
</script>

<template>
  <el-carousel indicator-position="outside" height="650px" arrow="always">
    <el-carousel-item v-for="slide in slides" :key="slide.id">
      <div class="banner-container" :style="{ background: slide.bgImage || slide.bgColor }">
        <div class="banner-content">
          <h1 class="banner-title">{{ slide.title }}</h1>
          <p class="banner-subtitle">{{ slide.subtitle }}</p>
          <el-button type="primary" class="banner-button" @click="handleViewClick(slide.productId)">
            立即查看
          </el-button>
        </div>
        <div class="banner-image">
          <img :src="slide.imageUrl" :alt="slide.title" class="banner-img">
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
