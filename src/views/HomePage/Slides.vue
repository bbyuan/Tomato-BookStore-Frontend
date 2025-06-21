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
        <div class="banner-full-image" :style="{ backgroundImage: 'url(' + slide.imageUrl + ')' }" @click="handleViewClick(slide.productId)" style="cursor:pointer;">
          <!-- 按钮已删除，点击图片跳转 -->
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
  padding: 18px 38px;
  font-size: 18px;
  background: linear-gradient(90deg, #ffb6b9 0%, #f48f8f 100%);
  color: #fff;
  border: 2px solid #ffe0e0;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  box-shadow:
    0 6px 24px rgba(244, 143, 143, 0.18),
    0 2px 8px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.25);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  letter-spacing: 0.7px;
  outline: none;
}

.banner-button-full::before {
  content: '';
  position: absolute;
  left: -40%;
  top: -40%;
  width: 180%;
  height: 180%;
  background: radial-gradient(circle, #fff6 0%, transparent 70%);
  opacity: 0.2;
  transition: opacity 0.4s;
  z-index: 0;
}

.banner-button-full:hover {
  background: linear-gradient(90deg, #f48f8f 0%, #ffb6b9 100%);
  color: #fff;
  transform: translateY(-3px) scale(1.06);
  box-shadow:
    0 12px 36px rgba(244, 143, 143, 0.22),
    0 4px 16px rgba(0,0,0,0.09);
  border-color: #f8dada;
}

.banner-button-full:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(244, 143, 143, 0.10);
}

.banner-button-full span {
  position: relative;
  z-index: 1;
}

.banner-button-full .el-icon--right {
  position: relative;
  z-index: 1;
  font-size: 22px;
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
