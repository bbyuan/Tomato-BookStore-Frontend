<script setup lang="ts">
import { defineProps, ref, computed, defineEmits, onMounted } from 'vue'
import RatingStars from '/src/views/Detail/RatingStars.vue'
import axios from 'axios';

const props = defineProps({
  bookId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

// 编辑的商品信息
const editingBook = ref<any>({
  id: props.bookId,
  title: '',
  price: '',
  originalPrice: '',
  image: '',
  description: '',
  author: '',
  subtitle: '',
  isbn: '',
  binding: '',
  pages: 0,
  publisher: '',
  publishDate: '',
  stock: 0,
  rating: 0,
});

// 当前选中的图片
const selectedImage = ref('')

// 处理文件上传
const handleFileUpload = (event: Event, mode: 'add' | 'replace') => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const files = Array.from(input.files);
  const newImages: string[] = [];

  if(mode === 'replace') {
    // 清空之前的图片
    editingBook.value.images = [];
  }
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target?.result as string;
      newImages.push(dataURL);

      // 最后一个图片加载完成时更新
      if (newImages.length === files.length) {
        editingBook.value.images = [
          ...(mode === 'add' ? editingBook.value.images || [] : []),
          ...newImages
        ];

        // 自动选择第一个新图片（如果是替换模式）
        if (mode === 'replace' && newImages.length > 0) {
          selectedImage.value = newImages[0];
          editingBook.value.image = newImages[0];
        }
      }
    
    };
    reader.readAsDataURL(file);
  });
}

// 加载状态和错误信息
const loading = ref(false);
const error = ref('');

// 获取商品详情
const fetchProductDetail = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      return;
    }
    
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products/${props.bookId}`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.code === '200') {
      const productData = response.data.data;
      
      // 处理价格格式
      const price = productData.price ? 
        productData.price.toString().startsWith('¥') ? 
        productData.price.substring(1) : productData.price 
        : '0.00';
        
      const originalPrice = productData.originalPrice ? 
        productData.originalPrice.toString().startsWith('¥') ? 
        productData.originalPrice.substring(1) : productData.originalPrice
        : '0.00';
      
      editingBook.value = {
        id: productData.id,
        title: productData.title || '',
        price: price,
        originalPrice: originalPrice,
        image: productData.cover || '/src/assets/images/BookTemplate.avif',
        description: productData.description || '',
        author: productData.author || '',
        subtitle: productData.subtitle || '',
        isbn: productData.isbn || '',
        binding: productData.binding || '',
        pages: productData.pages || 0,
        publisher: productData.publisher || '',
        publishDate: productData.publishDate || '',
        stock: productData.stock || 0,
        rating: productData.rating || 0,
        // 如果API返回的有图片数组，则使用，否则创建包含当前图片的数组
        images: productData.images || [productData.cover || '/src/assets/images/BookTemplate.avif']
      };
      
      // 设置当前显示的图片
      selectedImage.value = editingBook.value.image;
      
    } else {
      error.value = '获取商品详情失败: ' + (response.data ? response.data.msg || '未知错误' : '服务器响应格式错误');
    }
  } catch (err: any) {
    console.error('获取商品详情出错:', err);
    error.value = `获取商品详情失败: ${err.message || '未知错误'}`;
  } finally {
    loading.value = false;
  }
};

// 切换图片
const changeImage = (image: string) => {
  selectedImage.value = image;
  editingBook.value.image = image;
}

// 保存编辑
const saveChanges = () => {
  // 处理提交的数据格式
  const productData = {
    ...editingBook.value,
    // 确保价格格式正确
    price: editingBook.value.price.toString().replace('¥', ''),
    originalPrice: editingBook.value.originalPrice.toString().replace('¥', ''),
    // 添加其他需要的字段
    cover: editingBook.value.image
  };
  
  emit('save', productData);
}

// 关闭弹窗
const closeModal = () => {
  emit('close');
}

// 添加计算属性检查库存是否低
const isLowStock = computed(() => {
  return (editingBook.value.stock || 0) < 50;
});

// 添加计算属性检查库存是否为 0
const isOutOfStock = computed(() => {
  return (editingBook.value.stock || 0) === 0;
});

// 组件挂载时获取商品详情
onMounted(() => {
  fetchProductDetail();
});
</script>

<template>
  <!-- 显示加载状态 -->
  <div v-if="loading" class="loading-state">
    <div class="loading-spinner"></div>
    <p>正在加载商品详情...</p>
  </div>
  
  <!-- 显示错误信息 -->
  <div v-else-if="error" class="error-state">
    <p>{{ error }}</p>
    <button @click="fetchProductDetail" class="retry-btn">重试</button>
    <button @click="closeModal" class="cancel-btn">取消</button>
  </div>
  
  <!-- 商品编辑表单 -->
  <div v-else class="book-info-container">
    <!-- 封面 -->
    <div class="cover-wrapper">
      <img :src="selectedImage" alt="书籍封面" class="book-cover" />
      <!-- 图片选择区域 -->
      <div class="image-selector" v-if="editingBook.images && editingBook.images.length > 0">
        <img 
          v-for="(image, index) in editingBook.images" 
          :key="index" 
          :src="image" 
          :alt="'图片 ' + (index + 1)" 
          class="thumbnail" 
          :class="{ active: selectedImage === image }" 
          @click="changeImage(image)" 
        />
      </div>
      
      <div class="image-upload-group">
        <div class="upload-buttons centered-buttons">
          <div class="upload-wrapper">
            <label for="add-file" class="upload-btn add-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              新增图片
            </label>
            <input 
              type="file" 
              id="add-file" 
              multiple 
              accept="image/*"
              @change="(e) => handleFileUpload(e, 'add')"
              class="hidden-input"
            />
          </div>

          <div class="upload-wrapper">
            <label for="replace-file" class="upload-btn replace-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14zm-7 10.414l3-3 1.414 1.414L12 17.242l-4.414-4.414L9 11.414l3 3V6h2v8.414z"/>
                </svg>
              替换全部
            </label>
            <input 
              type="file" 
              id="replace-file" 
              multiple 
              accept="image/*"
              @change="(e) => handleFileUpload(e, 'replace')"
              class="hidden-input"
            />
          </div>
        </div>
        <p class="upload-tip">支持JPEG/PNG格式，单张不超过5MB</p>
      </div>
    </div>

    <!-- 书籍信息 -->
    <div class="info-wrapper">
      <!-- 书名编辑 -->
      <input 
        type="text" 
        v-model="editingBook.title" 
        placeholder="输入书名" 
        class="book-title-input"
      />

      <!-- 价格和库存并排显示 -->
      <div class="price-stock-row">
        <div class="price-section">
          <label>价格：</label>
          <input 
            type="number" 
            v-model="editingBook.price" 
            placeholder="当前价格" 
            class="price-input"
            step="0.01"
          />
          <label>原价：</label>
          <input 
            type="number" 
            v-model="editingBook.originalPrice" 
            placeholder="原价" 
            class="price-input"
            step="0.01"
          />
        </div>

        <div class="stock-section">
          <label>库存：</label>
          <input 
            type="number" 
            v-model="editingBook.stock" 
            placeholder="库存数量" 
            class="stock-input"
            min="0"
          />
          <label>冻结库存：</label>
          <input 
            type="number" 
            v-model="editingBook.stock" 
            placeholder="冻结库存数量" 
            class="stock-input"
            min="0"
          />
        </div>
      </div>

      <!-- 评分 (只读展示) -->
      <div class="rating-section">
        <span>评分：</span>
        <RatingStars :rating="editingBook.rating" />
        <input 
          type="number" 
          v-model="editingBook.rating" 
          step="0.1"
          min="0"
          max="5"
          class="rating-input"
        />
      </div>

      <!-- 描述 -->
      <div class="description-section">
        <label for="description">描述：</label>
        <textarea 
          id="description"
          v-model="editingBook.description" 
          placeholder="输入描述" 
          class="description-input"
          rows="4"
        ></textarea>
      </div>

      <!-- 书籍细节信息 -->
      <div class="details-card">
        <div class="detail-item">
          <strong>作者：</strong>
          <input type="text" v-model="editingBook.author" placeholder="作者" class="detail-input" />
        </div>
        <div class="detail-item">
          <strong>副标题：</strong>
          <input type="text" v-model="editingBook.subtitle" placeholder="副标题" class="detail-input" />
        </div>
        <div class="detail-item">
          <strong>ISBN：</strong>
          <input type="text" v-model="editingBook.isbn" placeholder="ISBN" class="detail-input" />
        </div>
        <div class="detail-item">
          <strong>装帧：</strong>
          <input type="text" v-model="editingBook.binding" placeholder="装帧" class="detail-input" />
        </div>
        <div class="detail-item">
          <strong>页数：</strong>
          <input type="number" v-model="editingBook.pages" placeholder="页数" class="detail-input" />
        </div>
        <div class="detail-item">
          <strong>出版社：</strong>
          <input type="text" v-model="editingBook.publisher" placeholder="出版社" class="detail-input" />
        </div>
        <div class="detail-item">
          <strong>出版日期：</strong>
          <input type="date" v-model="editingBook.publishDate" class="detail-input" />
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="button-section">
        <button class="cancel-btn" @click="closeModal">取消</button>
        <button class="save-btn" @click="saveChanges">保存修改</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-info-container {
  display: flex;
  gap: 60px; /* 增加左右内容的间距 */
  padding: 50px; /* 增加内边距 */
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  align-items: stretch; /* 确保子元素高度一致 */
  min-height: 600px;
}

/* 添加加载和错误状态的样式 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  text-align: center;
  width: 100%;
  min-height: 400px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 5px solid rgba(255, 107, 107, 0.1);
  border-left-color: #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state p {
  color: #ff6b6b;
  margin-bottom: 30px;
  font-size: 20px;
  font-weight: 500;
}

.retry-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 500;
  margin-right: 15px;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.retry-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}

.price-stock-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 25px;
}

.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  margin: 0 5px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.thumbnail.active {
  border-color: #ff6b6b;
  box-shadow: 0 0 12px rgba(255, 107, 107, 0.6);
  transform: scale(1.1);
}

.thumbnail:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.image-selector {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.image-upload {
  margin-top: 20px;
  width: 100%;
}

#file-upload {
  display: none;
}

.image-upload-group {
  margin-top: 20px;
  width:100%;
}

.upload-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.upload-buttons.centered-buttons {
  display: flex;
  justify-content: center; /* 水平居中 */
  gap: 20px; /* 按钮之间的间距 */
}

.upload-wrapper {
  flex: 1;
  position: relative;
  max-width: 150px; /* 限制按钮宽度 */
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
  text-align: center; /* 确保文字居中 */
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 添加省略号 */
}

.hidden-input {
  display: none;
}

.add-btn {
  background: #f0f9ff;
  border: 2px dashed #7bc4ff;
  color: #1890ff;
}

.add-btn:hover {
  background: #e6f4ff;
  border-color: #1890ff;
}

.replace-btn {
  background: #fff0f6;
  border: 2px dashed #ff85c0;
  color: #eb2f96;
}

.replace-btn:hover {
  background: #ffe5f0;
  border-color: #eb2f96;
}

.upload-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.upload-tip {
  color: #999;
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
}

.book-title-input {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 25px;
  color: #333;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.book-title-input:focus {
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
  border-color: #ff9e7d;
  outline: none;
}

.price-input, .stock-input, .rating-input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin: 0 8px;
  width: 100px;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.price-input:focus, .stock-input:focus, .rating-input:focus, .detail-input:focus, .description-input:focus, .form-input:focus {
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
  border-color: #ff9e7d;
  outline: none;
}

.description-input {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  padding: 16px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.8;
  resize: vertical;
  box-sizing: border-box;
  min-height: 150px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.description-section {
  margin-bottom: 30px;
}

.detail-input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.image-input {
  margin-top: 20px;
  width: 100%;
}

.image-input .form-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-top: 8px;
  box-sizing: border-box;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stock-section {
  display: flex;
  align-items: center;
}

.price-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.cancel-btn, .save-btn {
  flex: 1;
  padding: 15px 0;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 0.5px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #555;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cancel-btn:hover {
  background: #e6e6e6;
  transform: translateY(-3px);
}

.save-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: #fff;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.save-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .book-info-container {
    flex-direction: column;
    padding: 25px;
  }

  .cover-wrapper {
    width: 100%;
    max-width: 280px;
    margin: 0 auto 30px;
  }

  .info-wrapper {
    text-align: center;
  }

  .button-section {
    flex-direction: column;
    gap: 15px;
  }
}

/* 保持原有样式覆盖 */
.cover-wrapper {
  flex-shrink: 0;
  width: 450px; /* 增加宽度 */
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  padding: 25px; /* 增加内边距 */
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto; /* 自动调整高度 */
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
}

.book-cover {
  width: 360px; /* 增加封面图片宽度 */
  height: 480px; /* 增加封面图片高度 */
  object-fit: contain;
  object-position: center;
  border-radius: 10px;
  background-color: #fff;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
  padding: 10px;
}

.info-wrapper {
  flex: 1;
  max-width: 800px; /* 限制右侧信息区域最大宽度 */
  display: flex;
  flex-direction: column;
}

.details-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 改为三列布局 */
  gap: 15px;
  padding: 25px;
  background-color: #f9f9f9;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

@media (max-width: 1400px) {
  .details-card {
    grid-template-columns: 1fr 1fr; /* 窄屏幕时恢复两列布局 */
  }
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #333;
  padding: 5px 0;
}

.detail-item strong {
  min-width: 80px;
  color: #555;
}

.button-section {
  display: flex;
  gap: 25px;
  margin-top: 10px;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
}

label {
  font-weight: 500;
  color: #555;
}
</style>