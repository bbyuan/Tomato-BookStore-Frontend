<script setup lang="ts">
const technicalBooks = [
  {
    id: 1,
    title: '凤凰架构：构建可靠的大型分布式系统',
    price: '¥0.00',
    originalPrice: '¥79.00',
    image: '/src/assets/images/BookTemplate.avif',
    description: '这是一部以"如何构建一套可靠的分布式大型软件系统"为贯穿主线的开源文档，是一幅帮助开发人员提升系统架构能力的知识地图。'
  },
  {
    id: 2,
    title: '深入理解Java虚拟机（第3版）',
    price: '¥129.00',
    originalPrice: '¥159.00',
    image: '/src/assets/images/BookTemplate.avif',
    description: '这是一部从工作原理和工程实践两个维度深入分析新版JVM的著作，通过算机领域公认的经典，繁体版在台湾地区上市后连续多月占据程序语言类畅销榜前两位。'
  },
  {
    id: 3,
    title: '智慧的疆界',
    price: '¥69.00',
    originalPrice: '¥89.00',
    image: '/src/assets/images/BookTemplate.avif',
    description: '这是一部对人工智能充满敬畏之心的近心之作，由《深入理解Java虚拟机》作者历时一年完成，它将带你认识真正的人工智能。'
  },
  {
    id: 4,
    title: 'Java虚拟机规范（Java SE 8）',
    price: '¥79.00',
    originalPrice: '¥99.00',
    image: '/src/assets/images/BookTemplate.avif',
    description: '本书完整而精确地阐释了Java虚拟机各个方面细节，包括Java虚拟机架构、类文件格式、加载、链接、初始化，类与接口，常量池等。'
  },
  {
    id: 5,
    title: '代码整洁之道',
    price: '¥59.00',
    originalPrice: '¥79.00',
    image: '/src/assets/images/BookTemplate.avif',
    description: '软件工程领域的经典之作，讲述如何编写整洁、可维护的代码，提升代码质量和开发效率。'
  },
  {
    id: 6,
    title: '重构：改善既有代码的设计',
    price: '¥68.00',
    originalPrice: '¥88.00',
    image: '/src/assets/images/BookTemplate.avif',
    description: '软件开发领域的经典著作，揭示重构的原理和最佳实践，帮助改善代码设计'
  },
  {
    id: 7,
    title: '算法导论',
    price: '¥128.00',
    originalPrice: '¥168.00',
    image: '/src/assets/images/BookTemplate.avif',
    description: '全球公认的算法经典教材，全面论述算法设计与分析技术'
  },
  {
    id: 8,
    title: '设计模式：可复用面向对象软件的基础',
    price: '¥55.00',
    originalPrice: '¥75.00',
    image: '/src/assets/images/BookTemplate.avif',
    description: 'GoF经典著作，深入讲解23种设计模式'
  },
  {
    id: 9,
    title: '人月神话',
    price: '¥45.00',
    originalPrice: '¥65.00',
    image: '/src/assets/images/BookTemplate.avif',
    description: '软件工程领域的经典作品，探讨软件开发项目管理之道'
  },
  {
    id: 10,
    title: '黑客与画家',
    price: '¥49.00',
    originalPrice: '¥69.00',
    image: '/src/assets/images/BookTemplate.avif',
    description: '硅谷创业教父Paul Graham的文集，探讨编程与创新的关系'
  }
]

const rankings = [
  { id: 1, title: '生死场', price: '¥12.1', originalPrice: '¥36.0' },
  { id: 2, title: '我的心看起来很冷', price: '¥18.5', originalPrice: '¥42.0' },
  { id: 3, title: '时空迷途：刘慈欣作品集', price: '¥25.8', originalPrice: '¥58.0' },
  { id: 4, title: '公主之死：你所不知道的中国', price: '¥29.9', originalPrice: '¥68.0' },
  { id: 5, title: '我在史料生', price: '¥19.5', originalPrice: '¥45.0' },
]

// 计算折扣
const calculateDiscount = (price: string, originalPrice: string) => {
  const currentPrice = parseFloat(price.replace('¥', ''))
  const original = parseFloat(originalPrice.replace('¥', ''))
  if (original === 0) return 0
  return Math.round(currentPrice / original * 10)
}
</script>

<template>
  <div class="hot-books-container">
    <div class="hot-books-header">
      <h2>热销书籍</h2>
      <div class="view-more">查看更多 <i class="arrow-right">›</i></div>
    </div>
    
    <div class="hot-books-list">
      <div v-for="book in technicalBooks" :key="book.id" class="book-card">
        <div class="book-image">
          <img :src="book.image" :alt="book.title">
        </div>
        <div class="book-details">
          <h3 class="book-title">{{ book.title }}</h3>
          <div class="book-pricing">
            <span class="price">{{ book.price }}</span>
            <span class="original-price">{{ book.originalPrice }}</span>
            <span class="discount" v-if="book.price !== '¥0.00'">
              {{ calculateDiscount(book.price, book.originalPrice) }}折
            </span>
          </div>
          <p class="book-description">{{ book.description }}</p>
          <div class="book-actions">
            <button class="add-cart-btn">加入购物车</button>
            <button class="favorite-btn">❤</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hot-books-container {
  background: #ffffff;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
  margin: 30px 0;
  padding: 0 25px 25px;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.hot-books-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

.hot-books-header {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hot-books-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2d3436;
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hot-books-header h2::after {
  content: "";
  position: absolute;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  bottom: 0;
  left: 0;
}

.view-more {
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(255,107,107,0.1);
}

.view-more:hover {
  color: #ff6b6b;
  background: rgba(255,107,107,0.2);
  transform: translateX(5px);
}

.arrow-right {
  margin-left: 5px;
  font-size: 18px;
  font-style: normal;
}

.hot-books-list {
  display: flex;
  flex-wrap: wrap;
  padding: 20px 0;
  margin: 0 -10px;
  position: relative;
  z-index: 1;
}

.book-card {
  width: 20%;
  padding: 0 10px;
  margin: 10px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.book-card::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 80%;
  width: 1px;
  background: linear-gradient(to bottom, 
    rgba(200, 200, 200, 0) 0%,
    rgba(200, 200, 200, 0.3) 50%,
    rgba(200, 200, 200, 0) 100%);
}

.book-card:nth-child(5n)::after {
  display: none;
}

.book-image {
  text-align: center;
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
  padding: 20px 15px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.03);
  margin: 15px;
  transition: transform 0.3s ease;
}

.book-image img {
  height: 180px;
  max-width: 130px;
  transition: transform 0.5s ease;
  display: block;
  margin: 0 auto;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.book-image:hover {
  transform: scale(0.98);
}

.book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 15px 15px;
}

.book-title {
  font-size: 16px;
  margin: 0 0 12px 0;
  font-weight: 500;
  line-height: 1.4;
  height: 46px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #333;
  transition: color 0.3s;
}

.book-card:hover .book-title {
  color: #ff6b6b;
}

.book-pricing {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.price {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: bold;
  margin-right: 8px;
  position: relative;
  padding-left: 18px;
}

.price::before {
  content: "¥";
  position: absolute;
  left: 0;
  top: 2px;
  font-size: 14px;
}

.original-price {
  color: #999;
  font-size: 14px;
  text-decoration: line-through;
  margin-right: 8px;
}

.discount {
  background: #ffe8e8;
  color: #ff6b6b;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
}

.book-description {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  flex: 1;
}

.book-actions {
  display: flex;
  justify-content: space-between;
  margin: 20px 0 15px;
  padding-top: 15px;
  position: relative;
  gap: 8px;
}

.book-actions::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0,0,0,0.05);
}

.add-cart-btn {
  flex: 1;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 10px 0;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 10px;
  box-shadow: 0 3px 10px rgba(255, 107, 107, 0.2);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.add-cart-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
  box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
}

.favorite-btn {
  width: 40px;
  background: #f5f5f5;
  color: #999;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  background: #ffeded;
  color: #ff6b6b;
}

@media (max-width: 1400px) {
  .book-card {
    width: 20%;
  }
  .book-card:nth-child(5n)::after {
    display: none;
  }
}

@media (max-width: 1200px) {
  .book-card {
    width: 25%;
  }
  .book-card:nth-child(4n)::after {
    display: none;
  }
}

@media (max-width: 992px) {
  .book-card {
    width: 33.33%;
  }
  .book-card:nth-child(3n)::after {
    display: none;
  }
}

@media (max-width: 768px) {
  .book-card {
    width: 50%;
  }
  .book-card:nth-child(2n)::after {
    display: none;
  }
}

@media (max-width: 576px) {
  .book-card {
    width: 100%;
  }
  .book-card::after {
    display: none;
  }
}
</style>

