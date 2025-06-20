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
        title: ad.title,
        subtitle: ad.content,
        imageUrl: ad.imageUrl,
        productId: ad.productId,
        bgColor: [
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ][index % 5],
        bgImage: [
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ][index % 5]
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

// 组件挂载时获取数据
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
      :interval="8000"
      :loop="true"
      :pause-on-hover="true"
      @change="handleSlideChange"
      ref="carouselRef"
    >
      <el-carousel-item v-for="slide in slides" :key="slide.id">
        <div 
          class="banner-container" 
          :style="{ background: slide.bgImage || slide.bgColor }"
          :class="{ 'active': currentSlide === slides.indexOf(slide) }"
        >
          <div class="banner-overlay"></div>
          <div class="banner-content">
            <div class="content-wrapper">
              <div class="content-badge">精选推荐</div>
              <div class="title-container">
                <h1 class="banner-title">{{ slide.title }}</h1>
                <div class="title-accent"></div>
              </div>
              <p class="banner-subtitle">{{ slide.subtitle }}</p>
              <el-button 
                type="primary" 
                class="banner-button"
                @click="handleViewClick(slide.productId)"
              >
                <span>立即查看</span>
                <el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="banner-image">
            <div class="image-wrapper">
              <div class="image-backdrop"></div>
              <img 
                :src="slide.imageUrl" 
                :alt="slide.title" 
                class="banner-img"
                :class="{ 'active': currentSlide === slides.indexOf(slide) }"
              >
            </div>
          </div>
          <div class="decorative-elements">
            <div class="geometric-shape shape-1"></div>
            <div class="geometric-shape shape-2"></div>
            <div class="particle-container">
              <div class="particle" v-for="i in 8" :key="i" :style="{ '--delay': i * 0.3 + 's' }"></div>
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    
    <!-- 简洁指示器 -->
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
  border-radius: 32px;
  box-shadow: 
    0 24px 80px rgba(0, 0, 0, 0.08),
    0 12px 48px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  height: 650px;
  flex-shrink: 0;
  background: linear-gradient(145deg, #ffffff, #f8f9fb);
  backdrop-filter: blur(24px);
}

.banner-container {
  border-radius: 32px;
  padding: 0 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  height: 100%;
  width: 100%;
  overflow: hidden;
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(0,0,0,0.02) 0%, transparent 60%),
    radial-gradient(circle at 70% 80%, rgba(0,0,0,0.03) 0%, transparent 60%),
    linear-gradient(135deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 100%);
  z-index: 1;
}

.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.geometric-shape {
  position: absolute;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
}

.shape-1 {
  width: 160px;
  height: 160px;
  border-radius: 32px;
  top: 10%;
  right: 15%;
  transform: rotate(15deg);
  animation: floatRotate 12s ease-in-out infinite;
}

.shape-2 {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  bottom: 20%;
  left: 10%;
  animation: floatRotate 8s ease-in-out infinite reverse;
}

@keyframes floatRotate {
  0%, 100% { 
    transform: translateY(0px) rotate(15deg); 
    opacity: 0.6;
  }
  50% { 
    transform: translateY(-30px) rotate(45deg); 
    opacity: 1;
  }
}

.particle-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255,255,255,0.4);
  border-radius: 50%;
  animation: particleFloat 6s ease-in-out infinite;
  animation-delay: var(--delay);
}

.particle:nth-child(1) { top: 20%; left: 15%; }
.particle:nth-child(2) { top: 40%; left: 85%; }
.particle:nth-child(3) { top: 60%; left: 25%; }
.particle:nth-child(4) { top: 80%; left: 75%; }
.particle:nth-child(5) { top: 30%; left: 60%; }
.particle:nth-child(6) { top: 70%; left: 40%; }
.particle:nth-child(7) { top: 15%; left: 45%; }
.particle:nth-child(8) { top: 85%; left: 55%; }

@keyframes particleFloat {
  0%, 100% { 
    transform: translateY(0) scale(1); 
    opacity: 0.4; 
  }
  50% { 
    transform: translateY(-20px) scale(1.2); 
    opacity: 1; 
  }
}

.banner-content {
  flex: 1;
  max-width: 55%;
  z-index: 2;
  position: relative;
}

.content-wrapper {
  transform: translateX(-60px);
  opacity: 0;
  transition: all 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.banner-container.active .content-wrapper {
  transform: translateX(0);
  opacity: 1;
}

.content-badge {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.9);
  margin-bottom: 20px;
  border: 1px solid rgba(255,255,255,0.2);
  transform: translateY(20px);
  opacity: 0;
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0.2s;
}

.banner-container.active .content-badge {
  transform: translateY(0);
  opacity: 1;
}

.title-container {
  position: relative;
  margin-bottom: 32px;
}

.banner-title {
  font-size: 56px;
  margin-bottom: 16px;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #ffffff;
  text-shadow: 
    0 2px 4px rgba(0,0,0,0.1),
    0 8px 24px rgba(0,0,0,0.15);
  position: relative;
  transform: translateY(30px);
  opacity: 0;
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0.4s;
}

.banner-container.active .banner-title {
  transform: translateY(0);
  opacity: 1;
}

.title-accent {
  width: 0;
  height: 6px;
  background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0.4));
  border-radius: 3px;
  transition: width 1.6s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0.8s;
  box-shadow: 0 0 20px rgba(255,255,255,0.3);
}

.banner-container.active .title-accent {
  width: 100px;
}

.banner-subtitle {
  font-size: 20px;
  margin-bottom: 48px;
  line-height: 1.7;
  color: rgba(255,255,255,0.95);
  font-weight: 400;
  max-width: 90%;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transform: translateY(20px);
  opacity: 0;
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0.6s;
}

.banner-container.active .banner-subtitle {
  transform: translateY(0);
  opacity: 1;
}

.banner-button {
  border-radius: 50px;
  padding: 18px 36px;
  font-size: 16px;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.95) 100%);
  color: #333;
  border: 2px solid rgba(255,255,255,0.3);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  box-shadow: 
    0 12px 40px rgba(0,0,0,0.15),
    0 4px 16px rgba(255,255,255,0.2),
    inset 0 1px 0 rgba(255,255,255,0.5);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  transform: translateY(20px);
  opacity: 0;
  transition-delay: 0.8s;
}

.banner-container.active .banner-button {
  transform: translateY(0);
  opacity: 1;
}

.banner-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transition: left 0.6s ease;
}

.banner-button:hover::before {
  left: 100%;
}

.banner-button:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%);
  color: #e4393c;
  transform: translateY(-4px) scale(1.05);
  box-shadow: 
    0 20px 60px rgba(0,0,0,0.2),
    0 8px 32px rgba(228, 57, 60, 0.2);
  border-color: rgba(228, 57, 60, 0.3);
}

.banner-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  z-index: 2;
  position: relative;
}

.image-wrapper {
  position: relative;
  transform: scale(0.7) translateY(50px) rotateY(20deg);
  opacity: 0;
  transition: all 1.8s cubic-bezier(0.16, 1, 0.3, 1);
  perspective: 1200px;
}

.banner-container.active .image-wrapper {
  transform: scale(1) translateY(0) rotateY(0deg);
  opacity: 1;
}

.image-backdrop {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140%;
  height: 140%;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 1.2s ease;
  z-index: -1;
}

.banner-container.active .image-backdrop {
  opacity: 1;
}

.banner-img {
  max-height: 85%;
  max-width: 85%;
  object-fit: contain;
  filter: 
    drop-shadow(0 30px 60px rgba(0,0,0,0.2))
    drop-shadow(0 15px 35px rgba(0,0,0,0.15));
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 20px;
}

.banner-img:hover {
  transform: scale(1.05) rotateY(-5deg);
  filter: 
    drop-shadow(0 40px 80px rgba(0,0,0,0.25))
    drop-shadow(0 20px 45px rgba(0,0,0,0.2));
}

/* 简洁指示器 */
.simple-indicators {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 28px;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(32px);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 12px 48px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.simple-indicators:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: translateX(-50%) translateY(-4px);
  box-shadow: 
    0 20px 64px rgba(0, 0, 0, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.indicator-dot {
  position: relative;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.indicator-dot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.indicator-dot:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.2);
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.3);
}

.indicator-dot:hover::before {
  width: 200%;
  height: 200%;
  opacity: 0.3;
}

.indicator-dot.active {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.4);
  box-shadow: 
    0 0 20px rgba(255, 255, 255, 0.5),
    0 0 40px rgba(255, 255, 255, 0.2);
}

.indicator-dot.active::before {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

.dot-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
}

.indicator-dot:active .dot-ripple {
  width: 300%;
  height: 300%;
  opacity: 1;
  transition: all 0.3s ease-out;
}

.indicator-dot:active .dot-ripple {
  opacity: 0;
  transition: opacity 0.3s ease-out 0.3s;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .simple-indicators {
    bottom: 30px;
    gap: 12px;
    padding: 12px 20px;
  }
  
  .indicator-dot {
    width: 10px;
    height: 10px;
  }
  
  .indicator-dot.active {
    transform: scale(1.3);
  }
}

@media (max-width: 480px) {
  .simple-indicators {
    bottom: 20px;
    gap: 10px;
    padding: 10px 16px;
  }
  
  .indicator-dot {
    width: 8px;
    height: 8px;
  }
}
</style>
