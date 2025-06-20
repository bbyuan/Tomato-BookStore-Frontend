<script setup lang="ts">
import { ref } from 'vue'

const categories = ref([
  { id: 1, name: '文学', active: false },
  { id: 2, name: '社科', active: false },
  { id: 3, name: '少儿', active: false },
  { id: 4, name: '艺术', active: false },
  { id: 5, name: '生活', active: false },
  { id: 6, name: '文教', active: false },
])

// 根据图片更新子分类
const subcategories = {
  1: [ // 文学
    { id: 101, name: '小说' },
    { id: 102, name: '青春文学' },
    { id: 103, name: '中国散文' },
    { id: 104, name: '外国散文' },
    { id: 105, name: '悬疑推理' },
    { id: 106, name: '文学理论' },
    { id: 107, name: '文集' },
    { id: 108, name: '世界名著' },
  ],
  2: [ // 社科
    { id: 201, name: '历史' },
    { id: 202, name: '哲学/宗教' },
    { id: 203, name: '社会科学' },
    { id: 204, name: '政治军事' },
    { id: 205, name: '传记' },
    { id: 206, name: '文化' },
    { id: 207, name: '古籍' },
    { id: 208, name: '管理' },
    { id: 209, name: '经济' },
    { id: 210, name: '成功励志' },
    { id: 211, name: '法律' },
    { id: 212, name: '语言文字' },
  ],
  3: [ // 少儿
    { id: 301, name: '中国儿童文学' },
    { id: 302, name: '外国儿童文学' },
    { id: 303, name: '科普读物' },
    { id: 304, name: '绘本' },
    { id: 305, name: '动漫/卡通' },
    { id: 306, name: '幼儿启蒙' },
  ],
  4: [ // 艺术
    { id: 401, name: '绘画' },
    { id: 402, name: '书法篆刻' },
    { id: 403, name: '艺术理论' },
    { id: 404, name: '摄影' },
    { id: 405, name: '音乐' },
  ],
  5: [ // 生活
    { id: 501, name: '美食' },
    { id: 502, name: '保健/心理健康' },
    { id: 503, name: '旅游' },
    { id: 504, name: '家庭教育' },
    { id: 505, name: '家居休闲' },
  ],
  6: [ // 文教
    { id: 601, name: '中小学教辅' },
    { id: 602, name: '外语' },
    { id: 603, name: '教材' },
    { id: 604, name: '医学' },
    { id: 605, name: '计算机' },
    { id: 606, name: '自然科学' },
  ],
}

// 切换分类
const toggleCategory = (id: number) => {
  categories.value.forEach(cat => {
    // 如果点击的是当前激活的分类，则关闭它
    if (cat.id === id) {
      cat.active = !cat.active
    } else {
      // 其他分类设为非激活
      cat.active = false
    }
  })
}

// 获取指定分类的子分类
const getSubcategories = (categoryId: number) => {
  return subcategories[categoryId as keyof typeof subcategories] || []
}

const activities = ref([
  { id: 1, name: '全场图书满100减30，限时48小时！', type: 'hot' },
  { id: 2, name: '新书抢先预定，享独家首发福利', type: 'new' },
  { id: 3, name: '知名作家线下签售会火热报名中', type: 'event' },
]);
</script>

<template>
  <div class="aside-container">
    <div class="category-title">
      <div class="title-icon">📚</div>
      <span class="title-text">图书分类</span>
    </div>
    
    <div class="category-list">
      <div v-for="category in categories" :key="category.id">
        <div class="category-item" 
             :class="{ active: category.active }"
             @click="toggleCategory(category.id)">
          {{ category.name }}
          <i :class="category.active ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"></i>
        </div>
        
        <div class="subcategory-panel" v-if="category.active">
          <div class="subcategory-grid">
            <div v-for="subcat in getSubcategories(category.id)" 
                 :key="subcat.id" 
                 class="subcategory-item">
              {{ subcat.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="activity-section">
      <div class="activity-title">
        <div class="title-icon">🔥</div>
        <span class="title-text">热门活动</span>
      </div>
      
      <div class="activity-list">
        <div v-for="activity in activities" 
             :key="activity.id" 
             class="activity-item">
          <div class="activity-content">
            <p class="activity-text">{{ activity.name }}</p>
            <span class="activity-tag" :class="activity.type">
              {{ activity.type === 'hot' ? 'HOT' : activity.type === 'new' ? 'NEW' : 'EVENT' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aside-container {
  background: #fff;
  border-radius: 8px;
  width: 240px;
  height: fit-content;
  max-height: 100vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
}

.category-title {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5757 100%);
  color: white;
  padding: 18px 20px;
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: none;
  box-shadow: 0 2px 12px rgba(255, 107, 107, 0.25);
  position: relative;
  overflow: hidden;
}

.category-title::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) rotate(45deg); }
  100% { transform: translateX(100%) rotate(45deg); }
}

.title-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title-text {
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.category-list {
  overflow: hidden;
  padding-right: 2px;
  max-height: 360px;
}

.category-item {
  padding: 10px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.015);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  font-weight: 500;
  position: relative;
  color: #666;
  margin-bottom: 1px;
  border-radius: 6px;
}

.category-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(135deg, #ff6b6b, #ff5757);
  transform: scaleY(0);
  transition: transform 0.25s ease;
  transform-origin: center;
  border-radius: 0 2px 2px 0;
}

.category-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.02), rgba(255, 87, 87, 0.02));
  opacity: 0;
  transition: opacity 0.25s ease;
  border-radius: 6px;
}

.category-item:hover {
  color: #ff6b6b;
  transform: translateX(3px);
}

.category-item:hover::before {
  transform: scaleY(1);
}

.category-item:hover::after {
  opacity: 1;
}

.category-item.active {
  color: #ff6b6b;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.03), rgba(255, 87, 87, 0.02));
  transform: translateX(3px);
}

.category-item.active::before {
  transform: scaleY(1);
}

.subcategory-panel {
  padding: 10px 12px;
  background: linear-gradient(135deg, #fafafa, #f7f8fc);
  border-bottom: 1px solid rgba(255, 107, 107, 0.06);
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 6px 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(255, 107, 107, 0.06);
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02);
}

.subcategory-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff6b6b, #ff5757);
  border-radius: 6px 6px 0 0;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 150px;
    transform: translateY(0);
  }
}

.subcategory-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.subcategory-item {
  padding: 3px 7px;
  font-size: 10px;
  cursor: pointer;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 3px;
  border: 1px solid rgba(255, 107, 107, 0.08);
  font-weight: 500;
  color: #666;
}

.subcategory-item:hover {
  color: #ff6b6b;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.03), #ffffff);
  border-color: rgba(255, 107, 107, 0.2);
}

.activity-section {
  background: #fff;
  border-top: 1px solid #f5f5f5;
  margin-top: 8px;
}

.activity-title {
  padding: 18px 20px;
  font-weight: 700;
  font-size: 16px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5757 100%);
  border-bottom: none;
  box-shadow: 0 2px 12px rgba(255, 107, 107, 0.25);
  position: relative;
  overflow: hidden;
}

.activity-title::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

.activity-list {
  padding: 16px 20px;
  max-height: 280px;
  overflow: hidden;
}

.activity-item {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fafafa, #f7f8fc);
  border-radius: 8px;
  border-left: 4px solid #ff6b6b;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 107, 107, 0.06);
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.activity-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff6b6b, #ff5757);
  border-radius: 8px 8px 0 0;
}

.activity-item:hover {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.03), rgba(255, 87, 87, 0.02));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.12);
  border-color: rgba(255, 107, 107, 0.15);
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.activity-text {
  font-size: 12px;
  line-height: 1.5;
  color: #555;
  margin: 0;
  flex: 1;
  font-weight: 500;
}

.activity-tag {
  font-size: 9px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 700;
  flex-shrink: 0;
  text-transform: uppercase;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.activity-tag.hot {
  background: linear-gradient(135deg, #ff6b6b, #ff5757);
  color: white;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
}

.activity-tag.new {
  background: linear-gradient(135deg, #2ed573, #17c0eb);
  color: white;
  box-shadow: 0 2px 6px rgba(46, 213, 115, 0.3);
}

.activity-tag.event {
  background: linear-gradient(135deg, #ffa502, #ff7675);
  color: white;
  box-shadow: 0 2px 6px rgba(255, 165, 2, 0.3);
}

/* 自定义滚动条 */
.category-list::-webkit-scrollbar {
  width: 3px;
}

.category-list::-webkit-scrollbar-track {
  background: #f8f8f8;
  border-radius: 2px;
}

.category-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #ff6b6b, #ff5757);
  border-radius: 2px;
}

.category-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #ff5757, #ff4757);
}

@media (max-width: 768px) {
  .aside-container {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .category-title {
    padding: 16px 18px;
    font-size: 15px;
  }
  
  .title-icon {
    width: 24px;
    height: 24px;
    font-size: 18px;
  }
  
  .category-item {
    padding: 9px 16px;
    font-size: 12px;
  }
  
  .subcategory-panel {
    padding: 8px 10px;
    margin: 0 4px 2px 4px;
  }
  
  .activity-title {
    padding: 16px 18px;
    font-size: 15px;
  }
  
  .activity-list {
    padding: 14px 18px;
  }
  
  .activity-item {
    padding: 10px 12px;
  }
  
  .activity-text {
    font-size: 11px;
  }
}
</style>
