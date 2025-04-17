<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const slides = ref<any[]>([])
const currentSlide = ref(0)

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
      slides.value = response.data.data.map((ad: any) => ({
        id: ad.id,
        title: ad.title,
        subtitle: ad.content,
        imageUrl: ad.imageUrl,
        productId: ad.productId,
        bgColor: '#3a7bd5',
        bgImage: 'linear-gradient(135deg, #3a7bd5, #00d2ff)'
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

// 处理轮播图切换
const handleSlideChange = (index: number) => {
  currentSlide.value = index
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAdvertisements()
})
</script>

<template>
  <div class="slides-container">
    <el-carousel 
      indicator-position="outside" 
      height="650px" 
      arrow="always"
      :autoplay="true"
      :interval="5000"
      :loop="true"
      :pause-on-hover="true"
      @change="handleSlideChange"
    >
      <el-carousel-item v-for="slide in slides" :key="slide.id">
        <div 
          class="banner-container" 
          :style="{ background: slide.bgImage || slide.bgColor }"
          :class="{ 'active': currentSlide === slides.indexOf(slide) }"
        >
          <div class="banner-content">
            <h1 class="banner-title">{{ slide.title }}</h1>
            <p class="banner-subtitle">{{ slide.subtitle }}</p>
            <el-button 
              type="primary" 
              class="banner-button"
              @click="handleViewClick(slide.productId)"
            >
              立即查看
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="banner-image">
            <img 
              :src="slide.imageUrl" 
              :alt="slide.title" 
              class="banner-img"
              :class="{ 'active': currentSlide === slides.indexOf(slide) }"
            >
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped>
.slides-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.banner-container {
  border-radius: 12px;
  padding: 0 80px;
  margin-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  height: 100%;
  width: 100%;
  overflow: hidden;
  transition: all 0.5s ease;
  position: relative;
}

.banner-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%);
  z-index: 1;
}

.banner-content {
  flex: 1;
  max-width: 50%;
  z-index: 2;
  transform: translateX(-20px);
  opacity: 0;
  transition: all 0.8s ease;
}

.banner-container.active .banner-content {
  transform: translateX(0);
  opacity: 1;
}

.banner-title {
  font-size: 48px;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  font-weight: 700;
  line-height: 1.2;
}

.banner-subtitle {
  font-size: 22px;
  margin-bottom: 36px;
  opacity: 0.9;
  line-height: 1.6;
}

.banner-button {
  border-radius: 30px;
  padding: 16px 40px;
  font-size: 18px;
  background-color: white;
  color: #333;
  border: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.banner-button:hover {
  background-color: rgba(255,255,255,0.9);
  color: #333;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.banner-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  z-index: 2;
}

.banner-img {
  max-height: 85%;
  max-width: 85%;
  object-fit: contain;
  transform: scale(0.9);
  opacity: 0;
  transition: all 0.8s ease;
}

.banner-img.active {
  transform: scale(1);
  opacity: 1;
}

@media (max-width: 768px) {
  .banner-container {
    flex-direction: column;
    padding: 40px 30px;
    text-align: center;
  }
  
  .banner-content {
    max-width: 100%;
    margin-bottom: 30px;
    transform: translateY(-20px);
  }
  
  .banner-title {
    font-size: 32px;
  }
  
  .banner-subtitle {
    font-size: 18px;
  }

  .banner-button {
    padding: 14px 30px;
    font-size: 16px;
  }
}

/* 自定义轮播指示器样式 */
:deep(.el-carousel__indicators) {
  bottom: 20px;
}

:deep(.el-carousel__button) {
  width: 30px;
  height: 4px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  width: 40px;
  background-color: white;
}

/* 自定义箭头样式 */
:deep(.el-carousel__arrow) {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}
</style>
