<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Header from './Header.vue'
import AsideLeft from './Aside-left.vue'
import ProductShow from './ProductShow.vue'

// 路由相关
const route = useRoute()

// 响应式数据
const currentCategory = ref('')

// 中英文分类映射
const categoryMapping = {
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

// 获取中文分类名用于显示
const getChineseCategoryName = (englishName: string) => {
  // 反向查找中文名称
  for (const [chinese, english] of Object.entries(categoryMapping)) {
    if (english === englishName) {
      return chinese
    }
  }
  return englishName // 如果找不到映射，直接返回英文名
}

// 监听路由变化
watch(() => route.params.category, (newCategory) => {
  if (newCategory) {
    const englishCategory = newCategory as string
    currentCategory.value = getChineseCategoryName(englishCategory)
  }
}, { immediate: true })

// 组件挂载
onMounted(() => {
  const category = route.params.category as string
  if (category) {
    currentCategory.value = getChineseCategoryName(category)
  }
})
</script>

<template>
  <div class="category-container">
    <Header class="fixed-header" />
    <div class="main-content">
      <AsideLeft class="aside-left" />
      <div class="right-content">
        <div class="category-header">
          <h1 class="category-title">{{ currentCategory }} 图书</h1>
        </div>
        <div class="category-product-section">
          <ProductShow :category="route.params.category as string" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  width: 100%;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.main-content {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  margin-top: 60px;
  width: 100%;
  max-width: 100%;
  gap: 6px;
}

.aside-left {
  flex-shrink: 0;
  width: 240px;
  background-color: #fff;
}

.right-content {
  flex: 1;
  padding: 0 20px;
  max-width: calc(100% - 260px);
}

.category-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 30px 40px;
  border-radius: 12px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.category-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

.category-title {
  font-size: 32px;
  font-weight: 600;
  color: #2d3436;
  margin: 0;
  position: relative;
  display: inline-block;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.category-product-section {
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .aside-left {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .right-content {
    width: 100%;
    max-width: 100%;
    padding: 0 10px;
  }
  
  .category-header {
    padding: 20px;
    margin-bottom: 15px;
  }
  
  .category-title {
    font-size: 24px;
  }
}
</style>