<template>
    <div class="rating-stars">
      <!-- 渲染实心星 -->
      <img
        v-for="n in fullStars"
        :key="'full-' + n"
        src="/src/assets/icons/star-fill.svg"
        alt="Filled Star"
        class="star-icon"
      />
  
      <!-- 渲染半星 -->
      <img
        v-if="hasHalfStar"
        src="/src/assets/icons/star-halfline.svg"
        alt="Half Star"
        class="star-icon"
      />
  
      <!-- 渲染空心星 -->
      <img
        v-for="n in emptyStars"
        :key="'empty-' + n"
        src="/src/assets/icons/star-line.svg"
        alt="Empty Star"
        class="star-icon"
      />
  
      <!-- 显示评分文本 -->
      <span class="rating-score">{{ rating }}/5.0</span>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  // 定义传入评分的 prop，评分为 Number 类型
  const props = defineProps({
    rating: {
      type: Number,
      required: true
    }
  })
  
  // 计算实心星数量：向下取整
  const fullStars = computed(() => Math.floor(props.rating))
  
  // 如果小数部分 >= 0.5 则需要显示半星
  const hasHalfStar = computed(() => (props.rating - fullStars.value) >= 0.5)
  
  // 剩余的空心星数量（总共5颗星）
  const emptyStars = computed(() => 5 - fullStars.value - (hasHalfStar.value ? 1 : 0))
  </script>
  
  <style scoped>
  .rating-stars {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .star-icon {
    width: 24px; /* 可根据需要调整大小 */
    height: 24px;
    filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05)); /* 添加阴影效果 */
  }
  
  .star-icon[src*="star-fill.svg"] {
    -webkit-mask: url('/src/assets/icons/star-fill.svg') no-repeat center;
    mask: url('/src/assets/icons/star-fill.svg') no-repeat center;
    -webkit-mask-size: cover;
    mask-size: cover;
  }
  
  .star-icon[src*="star-halfline.svg"] {
    -webkit-mask: url('/src/assets/icons/star-halfline.svg') no-repeat center;
    mask: url('/src/assets/icons/star-halfline.svg') no-repeat center;
    -webkit-mask-size: cover;
    mask-size: cover;
  }
  
  .star-icon[src*="star-line.svg"] {
    -webkit-mask: url('/src/assets/icons/star-line.svg') no-repeat center;
    mask: url('/src/assets/icons/star-line.svg') no-repeat center;
    -webkit-mask-size: cover;
    mask-size: cover;
  }
  
  .rating-score {
    margin-left: 8px;
    font-size: 16px;
    color: #666;
  }
  </style>
