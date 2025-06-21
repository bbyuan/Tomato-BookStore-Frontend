<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = ref([
  { id: 1, name: '文学' },
  { id: 2, name: '社科' },
  { id: 3, name: '少儿' },
  { id: 4, name: '艺术' },
  { id: 5, name: '生活' },
  { id: 6, name: '文教' },
  { id: 7, name: '科技' },
])

// 根据实际分类更新子分类
const subcategories = {
  1: [ // 文学
    { id: 101, name: '小说' },
    { id: 102, name: '散文' },
    { id: 103, name: '悬疑推理' },
    { id: 104, name: '文学理论' },
    { id: 105, name: '文集' },
    { id: 106, name: '世界名著' },
  ],
  2: [ // 社科
    { id: 201, name: '历史' },
    { id: 202, name: '哲学' },
    { id: 203, name: '宗教' },
    { id: 204, name: '社会科学' },
    { id: 205, name: '政治' },
    { id: 206, name: '军事' },
    { id: 207, name: '传记' },
    { id: 208, name: '文化' },
    { id: 209, name: '管理' },
    { id: 210, name: '经济' },
    { id: 211, name: '法律' },
  ],
  3: [ // 少儿
    { id: 301, name: '儿童文学' },
    { id: 302, name: '绘本' },
  ],
  4: [ // 艺术
    { id: 401, name: '动漫' },
    { id: 402, name: '绘画' },
    { id: 403, name: '书法' },
    { id: 404, name: '音乐' },
    { id: 405, name: '摄影' },
  ],
  5: [ // 生活
    { id: 501, name: '美食' },
    { id: 502, name: '旅游' },
    { id: 503, name: '家庭教育' },
  ],
  6: [ // 文教
    { id: 601, name: '教材' },
    { id: 602, name: '医学' },
  ],
  7: [ // 科技
    { id: 701, name: '计算机' },
    { id: 702, name: '自然科学' },
  ],
}

// 中英文分类映射 - 根据API接口要求
const categoryMapping: { [key: string]: string } = {
  '小说': 'Novel',
  '散文': 'Essay',
  '悬疑推理': 'MysteryThriller',
  '文学理论': 'LiteraryTheory',
  '文集': 'Anthology',
  '世界名著': 'WorldClassics',
  '历史': 'History',
  '哲学': 'Philosophy',
  '宗教': 'Religion',
  '社会科学': 'SocialScience',
  '政治': 'Politics',
  '军事': 'Military',
  '传记': 'Biography',
  '文化': 'Culture',
  '管理': 'Management',
  '经济': 'Economics',
  '法律': 'Law',
  '儿童文学': 'ChildrenLiterature',
  '绘本': 'PictureBook',
  '动漫': 'Animation',
  '绘画': 'Painting',
  '书法': 'Calligraphy',
  '音乐': 'Music',
  '摄影': 'Photography',
  '美食': 'Cuisine',
  '旅游': 'Travel',
  '家庭教育': 'FamilyEducation',
  '教材': 'Textbook',
  '医学': 'Medicine',
  '计算机': 'ComputerScience',
  '自然科学': 'NaturalScience',
  '未设置': 'NOT_SET'
}

// 获取指定分类的子分类
const getSubcategories = (categoryId: number) => {
  return subcategories[categoryId as keyof typeof subcategories] || []
}

// 跳转到分类页面 - 直接使用英文分类名作为URL参数
const goToCategory = (categoryName: string) => {
  // 这里暂时跳转到主分类的第一个子分类
  const categoryId = categories.value.find(cat => cat.name === categoryName)?.id
  if (categoryId) {
    const subcats = getSubcategories(categoryId)
    if (subcats.length > 0) {
      const englishName = categoryMapping[subcats[0].name] || subcats[0].name
      router.push({
        path: `/category/${englishName}`
      })
    }
  }
}

// 跳转到子分类页面 - 直接使用英文分类名作为URL参数
const goToSubcategory = (subcategoryName: string) => {
  const englishName = categoryMapping[subcategoryName] || subcategoryName
  router.push({
    path: `/category/${englishName}`
  })
}
</script>

<template>
  <div class="aside-container">
    <div class="category-title">
      <div class="title-icon">📚</div>
      <span class="title-text">图书分类</span>
    </div>
    
    <div class="category-list">
      <div v-for="category in categories" :key="category.id">
        <div class="category-item" @click="goToCategory(category.name)">
          {{ category.name }}
        </div>
        
        <div class="subcategory-panel">
          <div class="subcategory-grid">
            <div v-for="subcat in getSubcategories(category.id)" 
                 :key="subcat.id" 
                 class="subcategory-item"
                 @click.stop="goToSubcategory(subcat.name)">
              {{ subcat.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aside-container {
  background: #fff;
  border-radius: 12px;
  width: 240px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  height: fit-content;
}

.category-title {
  background: #fff;
  color: #333;
  padding: 16px 20px;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.title-icon {
  font-size: 18px;
}

.title-text {
  color: #333;
  font-weight: bolder;
}

.category-list {
  overflow-y: auto;
  padding: 8px 0;
}

.category-item {
  padding: 8px 20px 6px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  border-left: 3px solid #ff6b6b;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-item:hover {
  background: #ff6b6b;
  color: #fff;
}

.subcategory-panel {
  padding: 0 20px 8px 20px;
}

.subcategory-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.subcategory-item {
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  color: #666;
  transition: all 0.2s ease;
}

.subcategory-item:hover {
  background: #ff6b6b;
  color: #fff;
  border-color: #ff6b6b;
}

/* 滚动条样式 */
.category-list::-webkit-scrollbar {
  width: 4px;
}

.category-list::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.category-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.category-list::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
