<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import RatingStars from '/src/views/Detail/RatingStars.vue'
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps({
  bookId: {
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['save', 'close'])

// 编辑的商品信息
const editingBook = ref<any>({
  id: props.bookId,
  title: '',
  price: '',
  originalPrice: '',
  image: '',
  description: '',
  details: '', 
  author: '',
  subtitle: '',
  isbn: '',
  binding: '',
  pages: 0,
  publisher: '',
  publishDate: '',
  stock: 0,
  frozenStock: 0, 
  rating: 0,
});

// 当前选中的图片
const selectedImage = ref('')

// 处理文件上传
const handleFileUpload = async (event: Event, mode: 'add' | 'replace') => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const files = Array.from(input.files);

  if (mode === 'replace') {
    // 清空之前的图片
    editingBook.value.images = [];
    editingBook.value.images_name = [];
  }

  for (const file of files) {
    try {
      // 检查文件大小
      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('文件大小不能超过5MB');
      }

      // 生成随机文件名
      const fileExt = file.name.split('.').pop(); // 获取文件扩展名
      const randomFileName = `${uuidv4()}.${fileExt}`; // 生成唯一文件名

      // 创建 FormData
      const formData = new FormData();
      formData.append('file', file, randomFileName);

      // 调用上传API
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('未登录或登录已过期');
      }

      const response = await axios.post('/api/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'token': token
        }
      });

      if (response.data && response.data.code === '200') {
        // 保存文件名和返回的URL
        const imageUrl = response.data.data;
        editingBook.value.images_name.push(randomFileName);
        editingBook.value.images.push(imageUrl);
      } else {
        throw new Error(response.data?.msg || '上传图片失败');
      }
    } catch (error: any) {
      console.error('上传图片错误:', error);
      alert(error.message || '上传图片失败');
    }
  }

  // 自动选择第一张新图片（如果是替换模式）
  if (mode === 'replace' && editingBook.value.images.length > 0) {
    selectedImage.value = editingBook.value.images[0];
    editingBook.value.image = editingBook.value.images[0];
  }
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

    console.log('props:', props);
    console.log('props.bookId:', props.bookId);
    
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products/${props.bookId}`;
    const stockUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products/stockpile/${props.bookId}`;
    
    const [productRes, stockRes] = await Promise.all([
      axios.get(apiUrl, {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }),
      axios.get(stockUrl, {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      })
    ]);

    console.log(productRes.data.data);

    if (productRes.data.code === '200' && stockRes.data.code === '200') {
      const productData = productRes.data.data;
      const stockData = stockRes.data.data;

      // 从 specifications 中提取字段
      const specifications = productData.specifications?.reduce((acc: Record<string, any>, spec: any) => {
        acc[spec.item] = spec.value;
        return acc;
      }, {}) || {};

      editingBook.value = {
        id: productData.id,
        title: productData.title || '',
        price: productData.price || 0,
        originalPrice: productData.price + 20,
        image: productData.covers[0] || '/src/assets/logo.png',
        image_name: productData.cover_name,
        images: productData.covers || [],
        images_name: productData.covers_name,
        description: productData.description || '',
        details: productData.details || '',
        author: specifications['作者'] || '',
        subtitle: specifications['副标题'] || '',
        isbn: specifications['ISBN'] || '',
        binding: specifications['装帧'] || '',
        pages: parseInt(specifications['页数']) || 0,
        publisher: specifications['出版社'] || '',
        publishDate: specifications['出版日期'] || '',
        stock: stockData.amount || 0,
        frozenStock: stockData.frozen || 0, // 冻结库存
        rating: productData.rate || 0
      };

      selectedImage.value = editingBook.value.image;
    } else {
      error.value = '获取商品详情失败';
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
const saveChanges = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    error.value = '您尚未登录或登录已过期，请重新登录';
    closeModal(); // 无论成功或失败都关闭弹窗
    return;
  }

  try {
    // 准备商品数据
    const specifications = [
      { id: '1', item: '作者', value: editingBook.value.author, productId: editingBook.value.id },
      { id: '2', item: '副标题', value: editingBook.value.subtitle, productId: editingBook.value.id },
      { id: '3', item: 'ISBN', value: editingBook.value.isbn, productId: editingBook.value.id },
      { id: '4', item: '装帧', value: editingBook.value.binding, productId: editingBook.value.id },
      { id: '5', item: '页数', value: (editingBook.value.pages ? editingBook.value.pages : 0) > 0 ?.toString(), productId: editingBook.value.id },
      { id: '6', item: '出版社', value: editingBook.value.publisher, productId: editingBook.value.id },
      { id: '7', item: '出版日期', value: editingBook.value.publishDate, productId: editingBook.value.id }
    ].filter(spec => spec.value); // 过滤掉空值

    const productData = {
      id: editingBook.value.id,
      title: editingBook.value.title,
      price: parseFloat(editingBook.value.price),
      originalPrice: parseFloat(editingBook.value.originalPrice),
      rate: editingBook.value.rating,
      description: editingBook.value.description,
      cover: '', // 不需要提供URL，后端会根据 cover_name 自行处理
      cover_name: editingBook.value.image_name,
      covers: [], // 不传递多图的URL数组，后端不需要
      covers_name: editingBook.value.images_name,
      detail: editingBook.value.details,
      specifications
    };

    // 调用更新商品信息的 API
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products`;
    const productResponse = await axios.put(apiUrl, productData, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    if (productResponse.data.code !== '200') {
      throw new Error(productResponse.data?.msg || '更新商品信息失败');
    }

    // 调用更新库存的 API
    const stockUrl = `${import.meta.env.VITE_API_BASE_URL}/api/products/stockpile/${editingBook.value.id}`;
    const stockData = { amount: editingBook.value.stock };
    const stockResponse = await axios.patch(stockUrl, stockData, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    if (stockResponse.data.code !== '200') {
      throw new Error(stockResponse.data?.msg || '更新库存失败');
    }

    alert('商品信息和库存更新成功');
    emit('save', productData);
  } catch (err: any) {
    console.error('保存修改出错:', err);
    error.value = `保存修改失败: ${err.message || '未知错误'}`;
  } finally {
    console.log("Close Modal");
    closeModal(); // 无论成功或失败都关闭弹窗
  }
};

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
      <div class="image-selector" v-else>
        <img 
          :src="'/src/assets/logo.png'" 
          alt="默认图片" 
          class="thumbnail" 
          :class="{ active: selectedImage === '/src/assets/logo.png' }" 
          @click="changeImage('/src/assets/logo.png')" 
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
          <div class="frozen-stock-badge">
            {{ editingBook.frozenStock }}
          </div>
        </div>
      </div>

      <!-- 评分 (只读展示) -->
      <div class="rating-section">
        <span>评分：</span>
        <RatingStars :rating="editingBook.rating" />
        <div class="rating-input-wrapper">
          <input 
            type="number" 
            v-model="editingBook.rating" 
            step="0.1"
            min="0"
            max="10"
            class="rating-input"
          />
          <span class="rating-hint">（满分为 10 分）</span>
        </div>
      </div>

      <!-- 描述 -->
      <div class="description-section">
        <label for="description">描述：</label>
        <textarea 
          id="description"
          v-model="editingBook.description" 
          placeholder="输入描述" 
          class="description-input"
          rows="2"
        ></textarea>
      </div>

      <!-- 详细说明 -->
      <div class="details-section">
        <label for="details">详细说明：</label>
        <textarea 
          id="details"
          v-model="editingBook.details" 
          placeholder="输入详细说明" 
          class="details-input"
          rows="5"
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

.book-title-input,
.price-input,
.stock-input,
.rating-input,
.detail-input,
.description-input,
.details-input {
  border: 1px solid #e0e0e0; /* 默认边框颜色 */
  transition: all 0.3s;
}

.book-title-input:focus,
.price-input:focus,
.stock-input:focus,
.rating-input:focus,
.detail-input:focus,
.description-input:focus,
.details-input:focus {
  border-color: #d44c4c; /* 修改为AddProduct的红色 */
  box-shadow: 0 0 0 1px rgba(212, 76, 76, 0.1); /* 添加红色阴影 */
  outline: none;
}

.book-title-input {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 25px;
  color: #333;
  padding: 12px 16px;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.book-title-input:focus {
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
  outline: none;
}

.price-input, .stock-input, .rating-input {
  padding: 10px 12px;
  border-radius: 8px;
  margin: 0 8px;
  width: 100px;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.description-input {
  width: 100%;
  border-radius: 10px;
  padding: 16px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.8;
  resize: vertical;
  box-sizing: border-box;
  min-height: 80px; /* 调整描述最小高度 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.details-input {
  width: 100%;
  border-radius: 10px;
  padding: 16px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.8;
  resize: vertical;
  box-sizing: border-box;
  min-height: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.description-section {
  margin-bottom: 30px;
}

.details-section {
  margin-bottom: 30px;
}

.detail-input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
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

.frozen-stock-badge {
  display: inline-block;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  background-color: #f0f0f0;
  color: #555;
  text-align: center;
  min-width: 80px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
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