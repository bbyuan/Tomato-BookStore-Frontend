<script setup lang = "ts">
import { defineProps } from 'vue'

const props = defineProps({
    bookInfo: {
        type: Object,
        required: true
    }
})

</script>

<template>
    <div class="book-info-container">
        <!-- 封面 -->
         <div class="cover-wrapper">
            <img :src="bookInfo.image" alt="书籍封面" class="book-cover" />
        </div>

        <!-- 书籍信息 -->
        <div class="info-wrapper">
            <h2 class="book-title">{{ bookInfo.title }}</h2>
            
            <!-- 价格 -->
             <div class="price-section">
                <span class="current-price">¥ {{ bookInfo.price }}</span>
                <span v-if="bookInfo.originalPrice && bookInfo.originalPrice > bookInfo.price" class="original-price">
                    ¥ {{ bookInfo.originalPrice }}
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
  gap: 40px; /* 增加间距 */
  padding: 40px; /* 增加内边距 */
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.cover-wrapper {
  flex-shrink: 0;
  width: 300px; /* 固定宽度 */
}

.book-cover {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.info-wrapper {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

/* 添加响应式布局 */
@media (max-width: 768px) {
  .book-info-container {
    flex-direction: column;
    padding: 20px;
  }

  .cover-wrapper {
    width: 200px;
    margin: 0 auto;
  }
}
</style>