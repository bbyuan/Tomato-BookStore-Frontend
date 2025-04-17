<script setup lang="ts">
import { ref, computed } from 'vue'
import RatingStars from './RatingStars.vue'
import axios from 'axios'

const props = defineProps({
  bookInfo: {
    type: Object,
    required: true
  }
})

//处理规格信息
const specifications = computed(() => {
  return props.bookInfo.specifications?.reduce((acc:Record<string, any>, spec: any) => {
    acc[spec.name] = spec.value;
    return acc
  }, {}) || {}
})

//处理图片显示
const images = computed(() => {
  return props.bookInfo.covers.length > 0 ? props.bookInfo.covers : ["/src/assets/logo.png"]
})

// 当前选中的图片
const selectedImage = ref(images.value[0] || '');

// 构建书籍详情
const bookDetails = computed(() => {
  const detailMap = {
    '作者': specifications.value.作者,
    '副标题': specifications.value.副标题,
    'ISBN': specifications.value.ISBN,
    '装帧': specifications.value.装帧,
    '页数': specifications.value.页数,
    '出版社': specifications.value.出版社,
    '出版日期': specifications.value.出版日期
  }

  return Object.entries(detailMap).map(([key, value]) => {
    let displayValue = value ?? '暂无';

    if (key === '页数') {
      displayValue = value > 0 ? value : '暂无';
    }

    if (key === '出版日期' && value) {
      displayValue = new Date(value).toLocaleDateString();
    }

    return {key, value: displayValue}
  })
})

// 库存状态计算
const isLowStock = computed(() => {
  return (props.bookInfo.stock?.amount || 0) < 50
})

const isOutOfStock = computed(() => {
  return (props.bookInfo.stock?.amount || 0) === 0
})

// 购买相关状态
const quantity = ref(1)
const isAddingToCart = ref(false)
const addCartMessage = ref('')
const showAddCartResult = ref(false)
const isSuccess = ref(false)

// 增加数量
const increaseQuantity = () => {
  if (quantity.value < 99) {
    quantity.value++
  }
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 加入购物车
const addToCart = async () => {
  if (isOutOfStock.value || isAddingToCart.value) return

  isAddingToCart.value = true
  addCartMessage.value = ''
  showAddCartResult.value = false

  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      throw new Error('请先登录')
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/cart`,
      {
        productId: props.bookInfo.id,
        quantity: quantity.value
      },
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data && response.data.code === '200') {
      isSuccess.value = true
      addCartMessage.value = `《${props.bookInfo.title || '未知书名'}》已成功加入购物车！`
    } else {
      isSuccess.value = false
      addCartMessage.value = response.data?.msg || '加入购物车失败'
    }
  } catch (error: any) {
    console.error('加入购物车出错:', error)
    isSuccess.value = false
    addCartMessage.value = error.message || '加入购物车失败'
  } finally {
    isAddingToCart.value = false
    showAddCartResult.value = true
    
    // 3秒后自动隐藏提示
    setTimeout(() => {
      showAddCartResult.value = false
    }, 1000)
  }
}
</script>

<template>
  <div class="book-info-container">
    <!-- 添加全局购物车提示，与ProductShow保持一致 -->
    <div 
      v-if="showAddCartResult" 
      class="global-cart-result" 
      :class="{ 'success': isSuccess, 'error': !isSuccess }"
    >
      <div class="cart-icon">{{ isSuccess ? '✓' : '✗' }}</div>
      <div class="cart-message">{{ addCartMessage }}</div>
    </div>
    
    <!-- 封面 -->
    <div class="cover-wrapper">
      <img 
        :src="selectedImage" 
        alt="书籍封面" 
        class="book-cover"  
        v-if="images.length > 0"
      />
      <!-- 图片选择区域 -->
      <div class="image-selector" v-if="images.length > 0">
        <img 
          v-for="(image, index) in images" 
          :key="index" 
          :src="image" 
          class="thumbnail" 
          :class="{ active: selectedImage === image }" 
          @click="selectedImage = image" 
        />
      </div>
    </div>

    <!-- 书籍信息 -->
    <div class="info-wrapper">
      <h2 class="book-title">{{ bookInfo.title || '未知书名' }}</h2>

      <!-- 价格和库存并排显示 -->
      <div class="price-stock-row">
        <div class="price-section">
          <span class="current-price">
            ¥{{ Number(bookInfo.price || 0).toFixed(2) }}
          </span>
          <span 
            v-if="bookInfo.originalPrice && bookInfo.originalPrice > bookInfo.price" 
            class="original-price"
          >
            ¥{{ Number(bookInfo.originalPrice).toFixed(2) }}
          </span>
        </div>

        <div class="stock-badge" :class="{ 'low-stock': isLowStock }">
          库存: {{ bookInfo.stock?.amount || 0 }}
        </div>
      </div>

      <!-- 评分 -->
      <div class="rating-section">
        <RatingStars :rating="bookInfo.rate" />
        
        <!-- 将数量选择器移到这里 -->
        <div class="quantity-selector" v-if="!isOutOfStock">
          <span class="quantity-label">数量:</span>
          <div class="quantity-control">
            <button class="quantity-btn" @click="decreaseQuantity">
              <span class="btn-icon">−</span>
            </button>
            <input type="number" v-model="quantity" min="1" max="99" />
            <button class="quantity-btn" @click="increaseQuantity">
              <span class="btn-icon">+</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 描述 -->
      <p class="description">{{ bookInfo.description }}</p>

      <!-- 书籍细节信息 -->
      <div class="details-card">
        <div 
          class="detail-item" 
          v-for="detail in bookDetails" 
          :key="detail.key">
          <strong>{{ detail.key }}：</strong>
          <span>{{ detail.value }}</span>
        </div>
      </div>

      <!-- 购买按钮 -->
      <div class="button-section">
        <button 
          class="add-cart-btn"
          :disabled="isOutOfStock || isAddingToCart"
          @click="addToCart"
        >
          <span v-if="isAddingToCart">加入中...</span>
          <span v-else>{{ isOutOfStock ? '已售罄' : '加入购物车' }}</span>
        </button>
        <button 
          class="buy-now-btn">
          {{ isOutOfStock ? '补货提醒' : '立即购买' }}
        </button>
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
  align-items: stretch; /* 确保子元素高度一致 */
}

.book-info-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.cover-wrapper {
  flex-shrink: 0;
  width: 350px; /* 缩小宽度 */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;

  padding: 15px; /* 缩小内边距 */
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto; /* 自动调整高度 */
}

.book-cover {
  width: 280px; /* 缩小封面图片宽度 */
  height: 370px; /* 缩小封面图片高度 */
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
  justify-content: space-between; /* 保证内容均匀分布 */
  height: 100%; /* 设置两者高度一致 */
}

.book-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.price-stock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.price-section {
  display: flex;
  align-items: center;
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

.stock-badge {
  display: inline-block;
  padding: 8px 15px;  /* 增大内边距 */
  border-radius: 20px;
  font-size: 16px;  /* 增大字体 */
  font-weight: bold;
  background-color: #e0f2e9;
  color: #2e8b57;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stock-badge.low-stock {
  background-color: #fff0f0;
  color: #ff6b6b;
  border-left: 2px solid #ff6b6b; /* 调整左边框宽度 */
  padding-left: 10px; /* 调整内边距 */
  box-shadow: 0 4px 8px rgba(255, 107, 107, 0.25);
  position: relative;
  overflow: hidden;
}

.stock-badge.low-stock::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 1.5s infinite;
}

@keyframes shine {
  to {
    left: 100%;
  }
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 20px; /* 增加间距以容纳数量选择器 */
  margin-bottom: 15px;
  justify-content: space-between; /* 左右两端对齐 */
  flex-wrap: wrap; /* 在小屏幕上允许换行 */
}

.description {
  font-size: 16px;
  line-height: 1.8;
  color: #666;
  margin-bottom: 20px;
}

.details-card {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列布局 */
  gap: 10px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #333;
}

.detail-item strong {
  font-weight: bold;
  color: #555;
}

.button-section {
  display: flex;
  gap: 20px;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  height: 36px;
}

.quantity-label {
  margin-right: 12px;
  font-size: 15px;
  color: #555;
  font-weight: 500;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  background: white;
  transition: all 0.3s ease;
}

.quantity-control:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  border-color: #ddd;
}

.quantity-selector input {
  width: 45px;
  height: 36px;
  text-align: center;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  -moz-appearance: textfield;
  background: transparent;
  border-left: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
}

.quantity-selector input::-webkit-outer-spin-button,
.quantity-selector input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  background-color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d); /* 修改为与立即购买按钮一致的渐变色 */
  color: white;
}

.quantity-btn:active {
  transform: scale(0.95);
  background: linear-gradient(90deg, #ff5252, #ff8a65); /* 点击时使用更深的渐变色 */
}

.btn-icon {
  font-size: 18px;
  line-height: 1;
  position: relative;
  top: -1px;
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
  background: #ffcc00; /* 保持黄色背景 */
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 204, 0, 0.3);
}

.add-cart-btn:hover {
  background: #ffb700;
}

.add-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.buy-now-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d); /* 保持红色渐变背景 */
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.buy-now-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
}

/* 全局购物车提示样式 - 与ProductShow保持一致 */
.global-cart-result {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  min-width: 300px;
  max-width: 90%;
}

.global-cart-result.success {
  border-left: 5px solid #ff6b6b;
}

.global-cart-result.error {
  border-left: 5px solid #ff6b6b;
}

.cart-icon {
  font-size: 24px;
  margin-right: 15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-cart-result.success .cart-icon {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
}

.global-cart-result.error .cart-icon {
  background-color: #fff0f0;
  color: #ff6b6b;
}

.cart-message {
  font-size: 16px;
  font-weight: 500;
}

.global-cart-result.success .cart-message {
  color: #ff6b6b;
}

.global-cart-result.error .cart-message {
  color: #ff6b6b;
}

@keyframes popIn {
  0% { 
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.8);
  }
  100% { 
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 可以移除旧的局部提示样式 */
.cart-result {
  display: none; /* 隐藏旧的提示样式 */
}

/* 响应式布局 - 调整数量选择器在移动端的显示 */
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
    width: 100%;
  }
  
  .rating-section {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .quantity-selector {
    margin: 0 auto;
    flex-direction: column;
    gap: 8px;
    height: auto;
  }
  
  .quantity-label {
    margin-right: 0;
    margin-bottom: 5px;
  }
}
</style>