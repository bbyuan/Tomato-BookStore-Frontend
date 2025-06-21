<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const slides = ref<any[]>([])
const currentSlide = ref(0)
const carouselRef = ref()

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
      slides.value = response.data.data.map((ad: any, index: number) => ({
        id: ad.id,
        imageUrl: ad.imageUrl,
        productId: ad.productId
      }))
    }
  } catch (err) {
    console.error('获取广告数据失败:', err)
  }
}

// 手动切换幻灯片
const goToSlide = (index: number) => {
  carouselRef.value?.setActiveItem(index)
  currentSlide.value = index
}

// 处理轮播图切换
const handleSlideChange = (index: number) => {
  currentSlide.value = index
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

onMounted(() => {
  fetchAdvertisements()
})
</script>

<template>
  <div class="slides-container">
    <el-carousel 
      indicator-position="none"
      height="650px"
      arrow="never"
      :autoplay="true"
      :interval="5000"
      :loop="true"
      :pause-on-hover="true"
      @change="handleSlideChange"
      ref="carouselRef"
    >
      <el-carousel-item v-for="slide in slides" :key="slide.id">
        <div class="banner-full-image" :style="{ backgroundImage: 'url(' + slide.imageUrl + ')' }">
          <el-button 
            type="primary" 
            class="banner-button-full"
            @click="handleViewClick(slide.productId)"
          >
            <span>立即查看</span>
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
      </el-carousel-item>
    </el-carousel>
    <div class="simple-indicators">
      <div 
        v-for="(slide, index) in slides" 
        :key="slide.id"
        class="indicator-dot"
        :class="{ 'active': currentSlide === index }"
        @click="goToSlide(index)"
      >
        <div class="dot-ripple"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slides-container {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.07),
    0 2px 8px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  height: 650px;
  flex-shrink: 0;
  background: linear-gradient(120deg, #f7fafc 0%, #e9f3f8 100%);
  backdrop-filter: blur(18px);
}

.banner-full-image {
  width: 100%;
  height: 650px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  border-radius: 28px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.04);
}

.banner-button-full {
  margin: 36px 48px;
  border-radius: 32px;
  padding: 16px 32px;
  font-size: 17px;
  background: linear-gradient(90deg, #fff 60%, #f3f7fa 100%);
  color: #f48f8f;
  border: 1.5px solid #eaeaea;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  box-shadow:
    0 4px 18px rgba(244, 143, 143, 0.08),
    0 1px 4px rgba(0,0,0,0.04),
    inset 0 1px 0 rgba(255,255,255,0.4);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  letter-spacing: 0.5px;
}

.banner-button-full:hover {
  background: linear-gradient(90deg, #f8f9fb 0%, #fff 100%);
  color: #e57373;
  transform: translateY(-2px) scale(1.04);
  box-shadow:
    0 8px 32px rgba(244, 143, 143, 0.13),
    0 2px 8px rgba(0,0,0,0.06);
  border-color: #f8dada;
}

/* 简洁指示器 */
.simple-indicators {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 22px;
  background: rgba(255, 255, 255, 0.38);
  backdrop-filter: blur(18px);
  border-radius: 32px;
  border: 1px solid #eaeaea;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.13);
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.indicator-dot {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f8dada;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(244, 143, 143, 0.08);
}

.indicator-dot.active {
  background: #f48f8f;
  transform: scale(1.3);
  box-shadow:
    0 0 12px #f48f8f44,
    0 0 24px #f48f8f22;
}

.dot-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: #fff3;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
}

@media (max-width: 768px) {
  .banner-full-image {
    height: 320px;
    border-radius: 18px;
  }
  .banner-button-full {
    margin: 14px 12px;
    padding: 10px 16px;
    font-size: 14px;
    border-radius: 20px;
  }
  .simple-indicators {
    bottom: 12px;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 18px;
  }
  .indicator-dot {
    width: 7px;
    height: 7px;
  }
}

@media (max-width: 480px) {
  .simple-indicators {
    bottom: 8px;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 12px;
  }
  .indicator-dot {
    width: 6px;
    height: 6px;
  }
}
</style>
