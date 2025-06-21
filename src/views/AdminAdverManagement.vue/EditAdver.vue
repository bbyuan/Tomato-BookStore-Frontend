<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps({
  adverId: {
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['save', 'close'])

// 编辑的广告信息
const editingAdver = ref<any>({
  id: props.adverId,
  title: '',
  content: '',
  imageUrl: '',
  imageName: '',
  productId: ''
});

// 加载状态和错误信息
const loading = ref(false);
const error = ref('');
const showSuccess = ref(false);

// 获取广告详情
const fetchAdverDetail = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      return;
    }

    console.log('正在获取广告信息，广告ID:', props.adverId);
    
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/advertisements`;
    const response = await axios.get(apiUrl, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('获取到的广告列表:', response.data);

    if (response.data.code === '200') {
      // 从广告列表中找到当前编辑的广告
      const adverData = response.data.data.find((ad: any) => ad.id === props.adverId);
      
      if (adverData) {
        console.log('当前编辑的广告信息:', adverData);
        editingAdver.value = {
          id: adverData.id,
          title: adverData.title || '',
          content: adverData.content || '',
          imageUrl: adverData.imageUrl,
          imageName: adverData.imageName || '',
          productId: adverData.productId || ''
        };
      } else {
        error.value = '未找到指定广告';
      }
    } else {
      error.value = '获取广告详情失败';
    }
  } catch (err: any) {
    console.error('获取广告详情出错:', err);
    error.value = `获取广告详情失败: ${err.message || '未知错误'}`;
  } finally {
    loading.value = false;
  }
};

// 处理文件上传
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const file = input.files[0];

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

    console.log('开始上传图片:', randomFileName);

    const response = await axios.post('/api/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'token': token
      }
    });

    console.log('图片上传响应:', response.data);

    if (response.data && response.data.code === '200') {
      // 保存文件名和返回的URL
      const imageUrl = response.data.data;
      editingAdver.value.imageName = randomFileName; // 保存文件名
      editingAdver.value.imageUrl = imageUrl; // 保存URL用于预览
      
      console.log('图片上传成功，更新后的广告信息:', {
        url: imageUrl,
        name: randomFileName,
        adver: editingAdver.value
      });
    } else {
      throw new Error(response.data?.msg || '上传图片失败');
    }
  } catch (error: any) {
    console.error('上传图片错误:', error);
    alert(error.message || '上传图片失败');
  }
}

// 保存编辑
const saveChanges = async () => {
  const token = sessionStorage.getItem('token');
  if (!token) {
    error.value = '您尚未登录或登录已过期，请重新登录';
    closeModal();
    return;
  }

  try {
    // 准备广告数据
    const adverData = {
      id: editingAdver.value.id,
      title: editingAdver.value.title,
      content: editingAdver.value.content,
      imageUrl: editingAdver.value.imageUrl,
      imageName: editingAdver.value.imageName,
      productId: editingAdver.value.productId
    };

    console.log('准备更新广告，数据:', adverData);

    // 调用更新广告信息的 API
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/advertisements`;
    const response = await axios.put(apiUrl, adverData, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    console.log('更新广告响应:', response.data);

    if (response.data.code !== '200') {
      throw new Error(response.data?.msg || '更新广告信息失败');
    }

    showSuccess.value = true;
    setTimeout(() => {
      showSuccess.value = false;
      emit('save', response.data.data);
      closeModal();
    }, 1500);
  } catch (err: any) {
    console.error('保存修改出错:', err);
    error.value = `保存修改失败: ${err.message || '未知错误'}`;
  }
};

// 关闭弹窗
const closeModal = () => {
  emit('close');
}

// 组件挂载时获取广告详情
onMounted(() => {
  fetchAdverDetail();
});
</script>

<template>
  <!-- 显示加载状态 -->
  <div v-if="loading" class="loading-state">
    <div class="loading-spinner"></div>
    <p>正在加载优惠券详情...</p>
  </div>
  
  <!-- 显示错误信息 -->
  <div v-else-if="error" class="error-state">
    <p>{{ error }}</p>
    <button @click="fetchAdverDetail" class="retry-btn">重试</button>
    <button @click="closeModal" class="cancel-btn">取消</button>
  </div>
  
  <!-- 广告编辑表单 -->
  <div v-else class="adver-info-container">
    <!-- 成功提示 -->
    <div v-if="showSuccess" class="success-message">
      <svg class="success-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
      <span>广告信息更新成功</span>
    </div>

    <!-- 图片部分 -->
    <div class="image-wrapper">
      <img :src="editingAdver.imageUrl" alt="广告图片" class="adver-image" />
      
      <div class="image-upload-group">
        <div class="upload-buttons centered-buttons">
          <div class="upload-wrapper">
            <label for="replace-file" class="upload-btn replace-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14zm-7 10.414l3-3 1.414 1.414L12 17.242l-4.414-4.414L9 11.414l3 3V6h2v8.414z"/>
              </svg>
              更换图片
            </label>
            <input 
              type="file"
              id="replace-file"
              accept="image/*"
              @change="handleFileUpload"
              class="hidden-input"
            />
          </div>
        </div>
        <p class="upload-tip">支持JPEG/PNG格式，单张不超过5MB</p>
      </div>
    </div>

    <!-- 广告信息 -->
    <div class="info-wrapper">
      <!-- 标题编辑 -->
      <input 
        type="text" 
        v-model="editingAdver.title" 
        placeholder="输入广告标题" 
        class="adver-title-input"
      />

      <!-- 内容编辑 -->
      <div class="content-section">
        <label for="content">广告内容：</label>
        <textarea 
          id="content"
          v-model="editingAdver.content" 
          placeholder="输入广告内容" 
          class="content-input"
          rows="4"
        ></textarea>
      </div>

      <!-- 关联商品ID -->
      <div class="product-section">
        <label for="productId">关联商品ID：</label>
        <input 
          id="productId"
          type="text" 
          v-model="editingAdver.productId" 
          placeholder="输入关联商品ID" 
          class="product-input"
        />
      </div>

      <!-- 按钮区域 -->
      <div class="button-section">
        <button class="cancel-btn" @click="closeModal">取消</button>
        <button class="save-btn" @click="saveChanges">保存修改</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adver-info-container {
  display: flex;
  gap: 60px;
  padding: 50px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  align-items: stretch;
  min-height: 600px;
}

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

.image-wrapper {
  flex-shrink: 0;
  width: 450px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
}

.adver-image {
  width: 360px;
  height: 480px;
  object-fit: contain;
  object-position: center;
  border-radius: 10px;
  background-color: #fff;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
  padding: 10px;
}

.image-upload-group {
  margin-top: 20px;
  width: 100%;
}

.upload-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.upload-buttons.centered-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.upload-wrapper {
  flex: 1;
  position: relative;
  max-width: 150px;
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
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hidden-input {
  display: none;
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

.info-wrapper {
  flex: 1;
  max-width: 800px;
  display: flex;
  flex-direction: column;
}

.adver-title-input {
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
  border: 1px solid #e0e0e0;
}

.adver-title-input:focus {
  border-color: #d44c4c;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
  outline: none;
}

.content-section {
  margin-bottom: 30px;
}

.content-input {
  width: 100%;
  border-radius: 10px;
  padding: 16px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.8;
  resize: vertical;
  box-sizing: border-box;
  min-height: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.content-input:focus {
  border-color: #d44c4c;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
  outline: none;
}

.product-section {
  margin-bottom: 30px;
}

.product-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.product-input:focus {
  border-color: #d44c4c;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
  outline: none;
}

.button-section {
  display: flex;
  gap: 25px;
  margin-top: auto;
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

label {
  font-weight: 500;
  color: #555;
  display: block;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .adver-info-container {
    flex-direction: column;
    padding: 25px;
  }

  .image-wrapper {
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

.success-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  animation: fadeInOut 1.5s ease-in-out;
}

.success-icon {
  width: 24px;
  height: 24px;
  fill: #52c41a;
}

.success-message span {
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
}
</style>
