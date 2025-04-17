<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const props = ({
  adverId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

// 编辑的广告信息
const editingAdver = ref<any>({
  id: props.adverId,
  title: '',
  image: '',
  image_name: '',
  images: [],
  images_name: [],
  link: '',
  position: '',
  startTime: '',
  endTime: '',
  status: 'inactive',
  description: ''
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
    editingAdver.value.images = [];
    editingAdver.value.images_name = [];
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
        editingAdver.value.images_name.push(randomFileName);
        editingAdver.value.images.push(imageUrl);
      } else {
        throw new Error(response.data?.msg || '上传图片失败');
      }
    } catch (error: any) {
      console.error('上传图片错误:', error);
      alert(error.message || '上传图片失败');
    }
  }

  // 自动选择第一张新图片（如果是替换模式）
  if (mode === 'replace' && editingAdver.value.images.length > 0) {
    selectedImage.value = editingAdver.value.images[0];
    editingAdver.value.image = editingAdver.value.images[0];
  }
}

// 加载状态和错误信息
const loading = ref(false);
const error = ref('');

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
    
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/advertisements/${props.adverId}`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.code === '200') {
      const adverData = response.data.data;

      editingAdver.value = {
        id: adverData.id,
        title: adverData.title || '',
        image: adverData.imageUrl || '/src/assets/logo.png',
        image_name: adverData.image_name,
        images: adverData.imageUrl ? [adverData.imageUrl] : [],
        images_name: adverData.image_name ? [adverData.image_name] : [],
        link: adverData.link || '',
        position: adverData.position || '',
        startTime: adverData.startTime ? new Date(adverData.startTime).toISOString().split('T')[0] : '',
        endTime: adverData.endTime ? new Date(adverData.endTime).toISOString().split('T')[0] : '',
        status: adverData.status || 'inactive',
        description: adverData.description || ''
      };

      selectedImage.value = editingAdver.value.image;
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

// 切换图片
const changeImage = (image: string) => {
  selectedImage.value = image;
  editingAdver.value.image = image;
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
    // 准备广告数据
    const adverData = {
      id: editingAdver.value.id,
      title: editingAdver.value.title,
      imageUrl: editingAdver.value.image,
      image_name: editingAdver.value.image_name || (editingAdver.value.images_name.length > 0 ? editingAdver.value.images_name[0] : ''),
      link: editingAdver.value.link,
      position: editingAdver.value.position,
      startTime: editingAdver.value.startTime,
      endTime: editingAdver.value.endTime,
      status: editingAdver.value.status,
      description: editingAdver.value.description
    };

    // 调用更新广告信息的 API
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/advertisements`;
    const response = await axios.put(apiUrl, adverData, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.code !== '200') {
      throw new Error(response.data?.msg || '更新广告信息失败');
    }

    alert('广告信息更新成功');
    emit('save', adverData);
  } catch (err: any) {
    console.error('保存修改出错:', err);
    error.value = `保存修改失败: ${err.message || '未知错误'}`;
  } finally {
    closeModal(); // 无论成功或失败都关闭弹窗
  }
};

// 关闭弹窗
const closeModal = () => {
  emit('close');
}

// 广告位置选项
const positionOptions = [
  { value: 'home_banner', label: '首页轮播' },
  { value: 'home_sidebar', label: '首页侧边栏' },
  { value: 'category_top', label: '分类页顶部' },
  { value: 'search_result', label: '搜索结果页' }
];

// 广告状态选项
const statusOptions = [
  { value: 'active', label: '激活' },
  { value: 'inactive', label: '未激活' },
  { value: 'scheduled', label: '定时发布' }
];

// 组件挂载时获取广告详情
onMounted(() => {
  fetchAdverDetail();
});
</script>

<template>
  <!-- 显示加载状态 -->
  <div v-if="loading" class="loading-state">
    <div class="loading-spinner"></div>
    <p>正在加载广告详情...</p>
  </div>
  
  <!-- 显示错误信息 -->
  <div v-else-if="error" class="error-state">
    <p>{{ error }}</p>
    <button @click="fetchAdverDetail" class="retry-btn">重试</button>
    <button @click="closeModal" class="cancel-btn">取消</button>
  </div>
  
  <!-- 广告编辑表单 -->
  <div v-else class="adver-info-container">
    <!-- 封面 -->
    <div class="cover-wrapper">
      <img :src="selectedImage" alt="广告图片" class="adver-cover" />
      <!-- 图片选择区域 -->
      <div class="image-selector" v-if="editingAdver.images && editingAdver.images.length > 0">
        <img 
          v-for="(image, index) in editingAdver.images" 
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

    <!-- 广告信息 -->
    <div class="info-wrapper">
      <!-- 标题编辑 -->
      <input 
        type="text" 
        v-model="editingAdver.title" 
        placeholder="输入广告标题" 
        class="adver-title-input"
      />

      <!-- 链接和位置 -->
      <div class="link-position-row">
        <div class="link-section">
          <label>链接URL：</label>
          <input 
            type="text" 
            v-model="editingAdver.link" 
            placeholder="输入广告链接URL" 
            class="link-input"
          />
        </div>

        <div class="position-section">
          <label>广告位置：</label>
          <select 
            v-model="editingAdver.position" 
            class="position-select"
          >
            <option value="">请选择位置</option>
            <option v-for="option in positionOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 展示时间和状态 -->
      <div class="time-status-row">
        <div class="time-section">
          <label>开始时间：</label>
          <input 
            type="date" 
            v-model="editingAdver.startTime" 
            class="time-input"
          />
          
          <label>结束时间：</label>
          <input 
            type="date" 
            v-model="editingAdver.endTime" 
            class="time-input"
          />
        </div>

        <div class="status-section">
          <label>状态：</label>
          <select 
            v-model="editingAdver.status" 
            class="status-select"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 描述 -->
      <div class="description-section">
        <label for="description">描述：</label>
        <textarea 
          id="description"
          v-model="editingAdver.description" 
          placeholder="输入广告描述" 
          class="description-input"
          rows="5"
        ></textarea>
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
.adver-info-container {
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

.link-position-row, .time-status-row {
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

.adver-title-input,
.link-input,
.position-select,
.time-input,
.status-select,
.description-input {
  border: 1px solid #e0e0e0; /* 默认边框颜色 */
  transition: all 0.3s;
}

.adver-title-input:focus,
.link-input:focus,
.position-select:focus,
.time-input:focus,
.status-select:focus,
.description-input:focus {
  border-color: #d44c4c; /* 修改为红色 */
  box-shadow: 0 0 0 1px rgba(212, 76, 76, 0.1); /* 添加红色阴影 */
  outline: none;
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
}

.adver-title-input:focus {
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.15);
  outline: none;
}

.link-input, .position-select, .time-input, .status-select {
  padding: 10px 12px;
  border-radius: 8px;
  margin: 0 8px;
  font-size: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.link-input {
  width: 100%;
}

.position-select, .status-select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
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
  min-height: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.description-section {
  margin-bottom: 30px;
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

.time-section, .status-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.link-section, .position-section {
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
  .adver-info-container {
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

.adver-cover {
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

.button-section {
  display: flex;
  gap: 25px;
  margin-top: 10px;
}

label {
  font-weight: 500;
  color: #555;
}
</style>
