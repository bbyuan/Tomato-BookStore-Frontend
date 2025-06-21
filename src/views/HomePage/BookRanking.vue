<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

interface BookItem {
  id: string;
  rank: number;
  title: string;
  price: number;
  originalPrice?: number;
  rate: number;
  description: string;
  category: string;
  cover: string;
  cover_name: string;
  covers: string[];
  covers_name: string[];
  detail: string;
  specifications: any[];
  stock: any;
  metricValue: number;
}

interface RankingData {
  rankings: BookItem[];
}

const activeTab = ref('rate');
const categories = [
  { key: 'rate', name: '评分榜' },
  { key: 'sales', name: '销量榜' },
  { key: 'composite', name: '综合榜' }
];
const selectedBooks = reactive<Record<string, boolean>>({});
const bookLists = reactive<Record<string, BookItem[]>>({
  'rate': [],
  'sales': [],
  'composite': []
});
const isLoading = ref(false);

const fetchRankings = async (metric: string) => {
  if (bookLists[metric].length > 0) {
    return; // 如果已经有数据，不重复请求
  }

  isLoading.value = true;
  
  try {
    const token = sessionStorage.getItem('token');
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['token'] = token;
    }

    // 使用products接口获取所有图书数据
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/search`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    console.log(`获取图书数据响应:`, data);

    if (data && (data.code === '200' || data.code === 200) && data.data) {
      let sortedBooks = [...data.data];
      
      // 根据不同的指标进行排序
      if (metric === 'rate') {
        // 按评分排序（降序）
        sortedBooks.sort((a: any, b: any) => (b.rate || 0) - (a.rate || 0));
      } else if (metric === 'sales') {
        // 按价格反向排序模拟销量（价格越低销量越高）
        sortedBooks.sort((a: any, b: any) => a.price - b.price);
      } else if (metric === 'composite') {
        // 综合排序：评分 * 0.7 + (100 - 价格占比) * 0.3
        sortedBooks.sort((a: any, b: any) => {
          const scoreA = (a.rate || 0) * 0.7 + (100 - a.price / 10) * 0.3;
          const scoreB = (b.rate || 0) * 0.7 + (100 - b.price / 10) * 0.3;
          return scoreB - scoreA;
        });
      }

      // 取前10名并添加排名信息
      bookLists[metric] = sortedBooks.slice(0, 10).map((book: any, index: number) => ({
        ...book,
        rank: index + 1,
        metricValue: metric === 'rate' 
          ? book.rate 
          : metric === 'sales' 
            ? Math.floor(Math.random() * 1000) + 100 // 模拟销量
            : ((book.rate || 0) * 0.7 + (100 - book.price / 10) * 0.3) // 综合分数
      }));
    } else {
      console.error(`获取图书数据失败:`, data.msg);
    }
  } catch (error) {
    console.error(`获取图书数据出错:`, error);
  } finally {
    isLoading.value = false;
  }
};

const changeTab = async (categoryKey: string) => {
  activeTab.value = categoryKey;
  
  // 清除所有选中状态
  Object.keys(selectedBooks).forEach(id => {
    selectedBooks[id] = false;
  });
  
  // 获取对应的排行榜数据
  await fetchRankings(categoryKey);
};

const toggleBook = (book: BookItem) => {
  const currentState = selectedBooks[book.id];
  
  // 关闭所有其他书籍的展开状态
  Object.keys(selectedBooks).forEach(id => {
    selectedBooks[id] = false;
  });
  
  // 切换当前书籍的展开状态
  selectedBooks[book.id] = !currentState;
};

const formatRank = (rank: number): string => {
  return rank.toString().padStart(2, '0');
};

const getRankDisplayValue = (book: BookItem): string => {
  if (activeTab.value === 'rate') {
    return `${book.rate}分`;
  } else if (activeTab.value === 'sales') {
    return `${Math.floor(book.metricValue)}册`;
  } else {
    return book.metricValue.toFixed(1) + '分';
  }
};

// 组件挂载时获取默认的评分榜数据
onMounted(() => {
  fetchRankings('rate');
});
</script>

<template>
  <div class="book-ranking-container">
    <div class="ranking-header">
      <h3>图书排行榜</h3>
      <a href="#" class="more-link">更多 »</a>
    </div>
    
    <div class="tabs">
      <div 
        v-for="category in categories" 
        :key="category.key"
        :class="['tab', { active: activeTab === category.key }]"
        @click="changeTab(category.key)"
      >
        {{ category.name }}
      </div>
    </div>
    
    <div class="book-list" v-loading="isLoading">
      <div 
        v-for="book in bookLists[activeTab]" 
        :key="book.id"
        class="book-item"
        :class="{ 'selected': selectedBooks[book.id] }"
        @click="toggleBook(book)"
      >
        <div class="book-row">
          <div class="rank" :class="{ 'top-rank': book.rank <= 3 }">{{ formatRank(book.rank) }}</div>
          <div class="book-title">{{ book.title }}</div>
          <div class="rank-value">{{ getRankDisplayValue(book) }}</div>
          <div class="expand-icon" :class="{ 'expanded': selectedBooks[book.id] }">›</div>
        </div>
        
        <transition name="preview-slide">
          <div v-if="selectedBooks[book.id]" class="book-preview">
            <img :src="book.cover || '/src/assets/images/BookTemplate.avif'" class="preview-image" :alt="book.title">
            <div class="preview-info">
              <div class="price-row">
                <span class="current-price">¥{{ book.price }}</span>
                <span v-if="book.originalPrice && book.originalPrice > book.price" class="original-price">¥{{ book.originalPrice }}</span>
                <span class="category">{{ book.category }}</span>
              </div>
              <div class="description">{{ book.description && book.description.length > 80 ? book.description.substring(0, 80) + '...' : book.description }}</div>
            </div>
          </div>
        </transition>
      </div>
      
      <div v-if="bookLists[activeTab].length === 0 && !isLoading" class="empty-state">
        暂无排行榜数据
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-ranking-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 18px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.ranking-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.more-link {
  color: #999;
  text-decoration: none;
  font-size: 12px;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 10px;
}

.more-link:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.06);
  transform: translateY(-1px);
}

.tabs {
  display: flex;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 3px;
  margin-bottom: 14px;
}

.tab {
  flex: 1;
  padding: 7px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  text-align: center;
  border-radius: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab:hover {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.06);
}

.tab.active {
  color: #fff;
  background: #ff6b6b;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.25);
}

.book-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 0; /* 移除底部间距 */
  padding-right: 2px;
}

.book-item {
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;
  margin-bottom: 2px;
  position: relative;
  overflow: hidden;
}

.book-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: #ff6b6b;
  transform: scaleY(0);
  transition: transform 0.25s ease;
  transform-origin: center;
}

.book-item:hover {
  background: rgba(255, 107, 107, 0.03);
  transform: translateX(2px);
}

.book-item:hover::before {
  transform: scaleY(1);
}

.book-item.selected {
  background: rgba(255, 107, 107, 0.05);
  transform: translateX(2px);
}

.book-item.selected::before {
  transform: scaleY(1);
}

.book-row {
  display: flex;
  align-items: center;
  padding: 11px 12px;
  gap: 12px;
}

.rank {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 11px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #f5f5f5;
  color: #999;
  transition: all 0.3s ease;
}

.rank.top-rank {
  background: #ff6b6b;
  color: #fff;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
}

.book-title {
  flex: 1;
  font-size: 13px;
  color: #333;
  font-weight: 400;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  transition: color 0.3s ease;
}

.book-item:hover .book-title {
  color: #ff6b6b;
}

.rank-value {
  font-size: 11px;
  color: #ff6b6b;
  font-weight: 500;
  flex-shrink: 0;
  padding: 2px 7px;
  background: rgba(255, 107, 107, 0.08);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.book-item:hover .rank-value {
  background: rgba(255, 107, 107, 0.12);
}

.expand-icon {
  color: #ddd;
  font-size: 13px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  width: 14px;
  text-align: center;
}

.expand-icon.expanded {
  transform: rotate(90deg);
  color: #ff6b6b;
}

.preview-slide-enter-active,
.preview-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-slide-enter-from,
.preview-slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.preview-slide-enter-to,
.preview-slide-leave-from {
  opacity: 1;
  max-height: 100px;
  transform: translateY(0);
}

.book-preview {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 6px;
  margin: 0 8px 4px 8px;
  border: 1px solid rgba(255, 107, 107, 0.08);
  position: relative;
}

.book-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #ff6b6b;
}

.preview-image {
  width: 42px;
  height: 60px;
  object-fit: cover;
  border-radius: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.book-preview:hover .preview-image {
  transform: scale(1.02);
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.current-price {
  color: #ff6b6b;
  font-weight: 600;
  font-size: 13px;
}

.original-price {
  color: #999;
  font-size: 10px;
  text-decoration: line-through;
}

.category {
  color: #666;
  font-size: 9px;
  background: rgba(255, 107, 107, 0.08);
  padding: 2px 5px;
  border-radius: 6px;
  margin-left: auto;
  transition: all 0.3s ease;
}

.book-preview:hover .category {
  background: rgba(255, 107, 107, 0.12);
  color: #ff6b6b;
}

.description {
  color: #666;
  font-size: 10px;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 20px 16px;
  font-size: 13px;
}

/* 自定义滚动条 */
.book-list::-webkit-scrollbar {
  width: 3px;
}

.book-list::-webkit-scrollbar-track {
  background: #f8f8f8;
  border-radius: 2px;
}

.book-list::-webkit-scrollbar-thumb {
  background: #ff6b6b;
  border-radius: 2px;
}

.book-list::-webkit-scrollbar-thumb:hover {
  background: #ff5757;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .book-ranking-container {
    padding: 14px;
  }
  
  .ranking-header h3 {
    font-size: 15px;
  }
  
  .book-row {
    padding: 10px;
    gap: 10px;
  }
  
  .book-title {
    font-size: 12px;
  }
  
  .rank {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}
</style>