<script setup lang="ts">
import { defineProps, ref } from 'vue'

const props = defineProps({
  bookInfo: {
    type: Object,
    required: true
  }
})

// 当前选中的图片
const selectedImage = ref(props.bookInfo.image)

// 切换图片
const changeImage = (image: string) => {
  selectedImage.value = image
}
</script>

<template>
  <div class="book-info-container">
    <!-- 封面 -->
    <div class="cover-wrapper">
      <img :src="selectedImage" alt="书籍封面" class="book-cover" />
      <!-- 图片选择区域 -->
      <div class="image-selector">
        <img 
          v-for="(image, index) in bookInfo.images" 
          :key="index" 
          :src="image" 
          :alt="'图片 ' + (index + 1)" 
          class="thumbnail" 
          :class="{ active: selectedImage === image }" 
          @click="changeImage(image)" 
        />
      </div>
    </div>

    <!-- 书籍信息 -->
    <div class="info-wrapper">
      <h2 class="book-title">{{ bookInfo.title }}</h2>

      <!-- 价格 -->
      <div class="price-section">
        <span class="current-price">¥{{ bookInfo.price }}</span>
        <span v-if="bookInfo.originalPrice && bookInfo.originalPrice > bookInfo.price" class="original-price">
          ¥{{ bookInfo.originalPrice }}
        </span>
      </div>

      <!-- 评分 -->
      <div class="rating-section">
        <span class="rating-stars">⭐⭐⭐⭐⭐</span>
        <span class="rating-score">{{ bookInfo.rating }}/5.0</span>
      </div>

      <!-- 描述 -->
      <p class="description">{{ bookInfo.description }}</p>

      <!-- 书籍细节信息 -->
      <ul class="details-list">
        <li><strong>作者：</strong>{{ bookInfo.author }}</li>
        <li><strong>副标题：</strong>{{ bookInfo.subtitle }}</li>
        <li><strong>ISBN：</strong>{{ bookInfo.isbn }}</li>
        <li><strong>装帧：</strong>{{ bookInfo.binding }}</li>
        <li><strong>页数：</strong>{{ bookInfo.pages }}</li>
        <li><strong>出版社：</strong>{{ bookInfo.publisher }}</li>
        <li><strong>出版日期：</strong>{{ bookInfo.publishDate }}</li>
      </ul>

      <!-- 购买按钮 -->
      <div class="button-section">
        <button class="add-cart-btn">加入购物车</button>
        <button class="buy-now-btn">立即购买</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-info-container {
  display: flex;
  gap: 40px;
  padding: 40px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-info-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.cover-wrapper {
  flex-shrink: 0;
  width: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;

  padding:20px;
  display: flex;
  flex-direction: column;
  align-items: center;

}

.book-cover {
  width: 330px;          /* 或者 max-width: 300px; */
  height: 440px;         /* 或者 max-height: 400px; */
  object-fit: contain;
  object-position: center;
  border-radius: 8px;
  background-color: #fff;
  transition: transform 0.3s ease;
}

.cover-wrapper:hover .book-cover {
  transform: scale(1.05);
}

.image-selector {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: center;
}

.thumbnail {
  width: 5rem;  
  height: 5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: none; /* 默认无边框 */
}

.thumbnail:hover {
  transform: scale(1.1);
}

.thumbnail.active {
  border: 2px solid #ff6b6b; /* 选中图片显示边框 */
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.info-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.price-section {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.current-price {
  font-size: 32px;
  font-weight: bold;
  color: #ff6b6b;
  margin-right: 10px;
}

.original-price {
  font-size: 18px;
  color: #999;
  text-decoration: line-through;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.rating-stars {
  font-size: 20px;
  color: #ffcc00;
}

.rating-score {
  font-size: 16px;
  color: #666;
}

.description {
  font-size: 16px;
  line-height: 1.8;
  color: #666;
  margin-bottom: 20px;
}

.details-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  font-size: 15px;
  color: #666;
}

.details-list li {
  margin-bottom: 10px;
}

.button-section {
  display: flex;
  gap: 20px;
}

.add-cart-btn,
.buy-now-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-cart-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.add-cart-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
}

.buy-now-btn {
  background: #ffcc00;
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 204, 0, 0.3);
}

.buy-now-btn:hover {
  background: #ffb700;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .book-info-container {
    flex-direction: column;
    padding: 20px;
  }

  .cover-wrapper {
    width: 100%;
    max-width: 240px;
    margin: 0 auto;
  }

  .info-wrapper {
    text-align: center;
  }

  .button-section {
    flex-direction: column;
  }
}
</style>