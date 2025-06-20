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
  { id: 1, name: '全场图书满100减30，限时48小时！' },
  { id: 2, name: '新书抢先预定，享独家首发福利' },
  { id: 3, name: '知名作家线下签售会火热报名中' },
]);
</script>

<template>
  <div class="aside-container">
    <div class="category-title">
      <i class="el-icon-menu"></i>
      图书分类
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
        <i class="el-icon-star-on"></i>
        热门活动
      </div>
      
      <div class="activity-list">
        <div v-for="activity in activities" 
             :key="activity.id" 
             class="activity-item">
          <a href="#" class="activity-link">
            {{ activity.name }}
            <span class="activity-tag">HOT</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aside-container {
  background-color: #fff;
  border-radius: 12px;
  width: 240px;
  height: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.category-title {
  background: linear-gradient(135deg, #e4393c, #ff5757);
  color: white;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(228, 57, 60, 0.2);
}

.category-list {
  flex: 1;
  overflow-y: auto;
  border-left: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
}

.category-item {
  padding: 14px 20px;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 500;
  position: relative;
}

.category-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: #e4393c;
  transform: scaleY(0);
  transition: transform 0.3s ease;
  transform-origin: center;
}

.category-item:hover {
  color: #e4393c;
  background-color: rgba(228, 57, 60, 0.03);
  transform: translateX(4px);
}

.category-item:hover::before {
  transform: scaleY(1);
}

.category-item.active {
  color: #e4393c;
  background-color: rgba(228, 57, 60, 0.05);
  transform: translateX(4px);
}

.category-item.active::before {
  transform: scaleY(1);
}

.subcategory-panel {
  padding: 16px 20px;
  background: linear-gradient(135deg, #fafbfc, #f8f9fa);
  border-bottom: 1px solid #f0f0f0;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.subcategory-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.subcategory-item {
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 4px;
  border: 1px solid #f0f0f0;
  font-weight: 500;
}

.subcategory-item:hover {
  color: #e4393c;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(228, 57, 60, 0.15);
  background: rgba(228, 57, 60, 0.03);
  border-color: rgba(228, 57, 60, 0.2);
}

.activity-section {
  margin-top: auto;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.activity-title {
  padding: 16px 20px;
  font-weight: 600;
  font-size: 16px;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #e4393c, #ff5757);
  box-shadow: 0 -2px 8px rgba(228, 57, 60, 0.1);
}

.activity-list {
  padding: 16px 20px;
  max-height: 160px;
  overflow-y: auto;
}

.activity-item {
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
  line-height: 1.5;
  font-size: 13px;
  padding: 4px 0;
  border-radius: 4px;
}

.activity-link:hover {
  color: #e4393c;
  transform: translateX(2px);
}

.activity-tag {
  background: linear-gradient(135deg, #e4393c, #ff5757);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
  margin-left: 8px;
  flex-shrink: 0;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(228, 57, 60, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.category-list::-webkit-scrollbar,
.activity-list::-webkit-scrollbar {
  width: 4px;
}

.category-list::-webkit-scrollbar-track,
.activity-list::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.category-list::-webkit-scrollbar-thumb,
.activity-list::-webkit-scrollbar-thumb {
  background: #e4393c;
  border-radius: 2px;
}

.category-list::-webkit-scrollbar-thumb:hover,
.activity-list::-webkit-scrollbar-thumb:hover {
  background: #d63384;
}

@media (max-width: 768px) {
  .aside-container {
    width: 100%;
    height: auto;
    margin-bottom: 20px;
  }
  
  .category-title {
    padding: 14px 16px;
    font-size: 15px;
  }
  
  .category-item {
    padding: 12px 16px;
    font-size: 13px;
  }
  
  .subcategory-panel {
    padding: 14px 16px;
  }
  
  .activity-title {
    padding: 14px 16px;
    font-size: 15px;
  }
  
  .activity-list {
    padding: 14px 16px;
  }
}
</style>
