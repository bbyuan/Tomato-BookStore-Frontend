<script setup lang="ts">
import { ref, reactive } from 'vue';

interface BookItem {
  id: number;
  rank: string;
  title: string;
  price: number;
  originalPrice?: number;
  link: string;
  image?: string;
}

const activeTab = ref('总榜');
const categories = ['总榜', '文学', '社科', '少儿', '生活'];
const selectedBook = ref<BookItem | null>(null);
const selectedBooks = reactive<Record<number, boolean>>({});

const bookLists = reactive({
  '总榜': [
    { id: 1, rank: '01', title: '活着', price: 28.5, originalPrice: 45.0, link: '#', image: 'https://img9.doubanio.com/view/subject/s/public/s29053580.jpg' },
    { id: 2, rank: '02', title: '百年孤独', price: 39.8, originalPrice: 59.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s27237850.jpg' },
    { id: 3, rank: '03', title: '三体全集', price: 99.0, originalPrice: 128.0, link: '#', image: 'https://img9.doubanio.com/view/subject/s/public/s2768378.jpg' },
    { id: 4, rank: '04', title: '平凡的世界', price: 78.0, originalPrice: 99.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1144911.jpg' },
    { id: 5, rank: '05', title: '人类简史', price: 45.6, originalPrice: 68.0, link: '#', image: 'https://img3.doubanio.com/view/subject/s/public/s27814883.jpg' },
    { id: 6, rank: '06', title: '解忧杂货店', price: 32.0, originalPrice: 45.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s27264181.jpg' },
    { id: 7, rank: '07', title: '小王子', price: 18.5, originalPrice: 28.0, link: '#', image: 'https://img3.doubanio.com/view/subject/s/public/s1103152.jpg' },
    { id: 8, rank: '08', title: '围城', price: 28.5, originalPrice: 42.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s1070222.jpg' },
    { id: 9, rank: '09', title: '白夜行', price: 35.0, originalPrice: 49.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s24514468.jpg' },
    { id: 10, rank: '10', title: '追风筝的人', price: 29.8, originalPrice: 42.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1727290.jpg' }
  ],
  '文学': [
    { id: 1, rank: '01', title: '活着', price: 28.5, originalPrice: 45.0, link: '#', image: 'https://img9.doubanio.com/view/subject/s/public/s29053580.jpg' },
    { id: 2, rank: '02', title: '百年孤独', price: 39.8, originalPrice: 59.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s27237850.jpg' },
    { id: 3, rank: '03', title: '围城', price: 28.5, originalPrice: 42.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s1070222.jpg' },
    { id: 4, rank: '04', title: '平凡的世界', price: 78.0, originalPrice: 99.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1144911.jpg' },
    { id: 5, rank: '05', title: '白鹿原', price: 35.0, originalPrice: 49.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s9137567.jpg' },
    { id: 6, rank: '06', title: '霍乱时期的爱情', price: 39.0, originalPrice: 55.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s11284102.jpg' },
    { id: 7, rank: '07', title: '挪威的森林', price: 29.8, originalPrice: 42.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1228930.jpg' },
    { id: 8, rank: '08', title: '1984', price: 25.0, originalPrice: 36.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s4371408.jpg' },
    { id: 9, rank: '09', title: '杀死一只知更鸟', price: 32.0, originalPrice: 45.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s23128183.jpg' },
    { id: 10, rank: '10', title: '飘', price: 45.0, originalPrice: 65.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1078958.jpg' }
  ],
  '社科': [
    { id: 1, rank: '01', title: '人类简史', price: 45.6, originalPrice: 68.0, link: '#', image: 'https://img3.doubanio.com/view/subject/s/public/s27814883.jpg' },
    { id: 2, rank: '02', title: '枪炮、病菌与钢铁', price: 42.0, originalPrice: 62.0, link: '#', image: 'https://img9.doubanio.com/view/subject/s/public/s1738643.jpg' },
    { id: 3, rank: '03', title: '乡土中国', price: 19.9, originalPrice: 32.0, link: '#', image: 'https://img9.doubanio.com/view/subject/s/public/s1790771.jpg' },
    { id: 4, rank: '04', title: '乌合之众', price: 15.0, originalPrice: 25.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s1988393.jpg' },
    { id: 5, rank: '05', title: '社会心理学', price: 78.0, originalPrice: 99.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1670932.jpg' },
    { id: 6, rank: '06', title: '经济学原理', price: 88.0, originalPrice: 120.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s4379914.jpg' },
    { id: 7, rank: '07', title: '中国历代政治得失', price: 22.0, originalPrice: 35.0, link: '#', image: 'https://img9.doubanio.com/view/subject/s/public/s1319205.jpg' },
    { id: 8, rank: '08', title: '万历十五年', price: 25.0, originalPrice: 38.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1800355.jpg' },
    { id: 9, rank: '09', title: '全球通史', price: 65.0, originalPrice: 88.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1728722.jpg' },
    { id: 10, rank: '10', title: '资本论', price: 99.0, originalPrice: 128.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s1311083.jpg' }
  ],
  '少儿': [
    { id: 1, rank: '01', title: '小王子', price: 18.5, originalPrice: 28.0, link: '#', image: 'https://img3.doubanio.com/view/subject/s/public/s1103152.jpg' },
    { id: 2, rank: '02', title: '夏洛的网', price: 19.9, originalPrice: 29.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s1120437.jpg' },
    { id: 3, rank: '03', title: '哈利·波特与魔法石', price: 35.0, originalPrice: 49.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1990480.jpg' },
    { id: 4, rank: '04', title: '安徒生童话', price: 25.0, originalPrice: 38.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1034063.jpg' },
    { id: 5, rank: '05', title: '格林童话', price: 22.0, originalPrice: 35.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s1034062.jpg' },
    { id: 6, rank: '06', title: '窗边的小豆豆', price: 22.0, originalPrice: 32.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s1067911.jpg' },
    { id: 7, rank: '07', title: '猜猜我有多爱你', price: 15.0, originalPrice: 25.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s1999110.jpg' },
    { id: 8, rank: '08', title: '不一样的卡梅拉', price: 28.0, originalPrice: 40.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s4397377.jpg' },
    { id: 9, rank: '09', title: '神奇校车系列', price: 88.0, originalPrice: 120.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s2503193.jpg' },
    { id: 10, rank: '10', title: '皮皮鲁传', price: 19.9, originalPrice: 30.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s1134341.jpg' }
  ],
  '生活': [
    { id: 1, rank: '01', title: '断舍离', price: 29.8, originalPrice: 45.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s33718942.jpg' },
    { id: 2, rank: '02', title: '小家，越住越大', price: 35.0, originalPrice: 49.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s28369176.jpg' },
    { id: 3, rank: '03', title: '健身营养全书', price: 78.0, originalPrice: 99.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s29418330.jpg' },
    { id: 4, rank: '04', title: '四季养生全书', price: 42.0, originalPrice: 60.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s33718943.jpg' },
    { id: 5, rank: '05', title: '咖啡品鉴大全', price: 55.0, originalPrice: 75.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s4075572.jpg' },
    { id: 6, rank: '06', title: '烘焙圣经', price: 65.0, originalPrice: 88.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s27244254.jpg' },
    { id: 7, rank: '07', title: '极简整理术', price: 25.0, originalPrice: 38.0, link: '#', image: 'https://img1.doubanio.com/view/subject/s/public/s28369177.jpg' },
    { id: 8, rank: '08', title: '家庭收纳1000例', price: 28.0, originalPrice: 40.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s27244255.jpg' },
    { id: 9, rank: '09', title: '花草时光：一草一天堂', price: 35.0, originalPrice: 49.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s29418331.jpg' },
    { id: 10, rank: '10', title: '旅行摄影圣经', price: 45.0, originalPrice: 65.0, link: '#', image: 'https://img2.doubanio.com/view/subject/s/public/s4075573.jpg' }
  ]
});

const changeTab = (tab: string) => {
  activeTab.value = tab;
  selectedBook.value = null;
};

const toggleBook = (book: BookItem) => {
  const currentState = selectedBooks[book.id];
  
  // 关闭所有其他书籍的展开状态
  Object.keys(selectedBooks).forEach(id => {
    selectedBooks[Number(id)] = false;
  });
  
  // 切换当前书籍的展开状态
  selectedBooks[book.id] = !currentState; // 反转当前状态
};
</script>

<template>
  <div class="book-ranking-container">
    <div class="ranking-header">
      <h3>图书畅销榜</h3>
      <a href="#" class="more-link">更多 &raquo;</a>
    </div>
    
    <div class="tabs">
      <div 
        v-for="category in categories" 
        :key="category"
        :class="['tab', { active: activeTab === category }]"
        @click="changeTab(category)"
      >
        {{ category }}
      </div>
    </div>
    
    <div class="book-list">
      <div 
        v-for="book in bookLists[activeTab]" 
        :key="book.id"
        class="book-item"
        :class="{ 'selected': selectedBooks[book.id] }"
        @click="toggleBook(book)"
      >
        <div class="rank" :class="{ 'top-rank': parseInt(book.rank) <= 3 }">{{ book.rank }}</div>
        <div class="book-info">
          <div class="book-title">{{ book.title }}</div>
          <div class="more-icon">&gt;</div>
        </div>
        <div v-if="selectedBooks[book.id]" class="book-preview">
          <img src="/src/assets/images/BookTemplate.avif" class="preview-image" alt="书籍预览">
          <div class="preview-price">¥{{ book.price }}</div>
        </div>
      </div>
    </div>
    
    <div class="view-all">
      <a href="#">查看完整榜单 &raquo;</a>
    </div>
  </div>
</template>

<style scoped>
.book-ranking-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.ranking-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: bold;
}

.more-link {
  color: #999;
  text-decoration: none;
  font-size: 14px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.tab {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  position: relative;
}

.tab.active {
  color: #e62828;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #e62828;
}

.book-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}

.book-item {
  position: relative;
  display: flex;
  flex-direction: row;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-wrap: wrap;
}

.book-item:hover {
  background-color: #f9f9f9;
}

.book-item.selected {
  background-color: #f9f9f9;
}

.rank {
  width: 30px;
  text-align: center;
  font-weight: bold;
  color: #999;
}

.top-rank {
  color: #e62828;
}

.book-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
  width: 100%;
  order: 1;
}

.book-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  letter-spacing: normal;
}

.more-icon {
  color: #ccc;
  margin-left: 10px;
}

.book-preview {
  width: 100%;
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 15px;
  padding-left: 30px;
  background: #f8f8f8;
  order: 2;
  border-radius: 4px;
}

.preview-image {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.preview-price {
  color: #e62828;
  font-weight: bold;
  font-size: 16px;
}

.view-all {
  text-align: center;
  padding: 8px 0;
  border-top: 1px solid #eee;
}

.view-all a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
}

.view-all a:hover {
  color: #e62828;
}
</style> 