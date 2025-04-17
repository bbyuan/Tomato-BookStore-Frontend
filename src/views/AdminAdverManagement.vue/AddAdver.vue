<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>新增广告</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <!-- 步骤指示器 -->
      <div class="steps-container">
        <div class="steps">
          <div class="step" :class="{ active: currentStep === 1, visible: isStepVisible(1) }">
            <div class="step-number">01</div>
            <div class="step-content">
              <h3>基本信息</h3>
              <p>请输入广告基本信息</p>
            </div>
          </div>
          <div class="step-line" :class="{ visible: isLineVisible(1) }"></div>
          <div class="step" :class="{ active: currentStep === 2, visible: isStepVisible(2) }">
            <div class="step-number">02</div>
            <div class="step-content">
              <h3>广告描述</h3>
              <p>添加广告详细描述</p>
            </div>
          </div>
          <div class="step-line" :class="{ visible: isLineVisible(2) }"></div>
          <div class="step" :class="{ active: currentStep === 3, visible: isStepVisible(3) }">
            <div class="step-number">03</div>
            <div class="step-content">
              <h3>展示设置</h3>
              <p>设置广告展示时间和状态</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="form-content">
        <!-- 第一步：基本信息 -->
        <div v-if="currentStep === 1" class="form-step">
          <h3>基本信息</h3>
          <p>添加广告的基本信息 <span class="required">*</span></p>
          
          <div class="form-grid">
            <div class="form-field">
              <input 
                type="text" 
                v-model="form.title" 
                id="title" 
                class="input-field"
                :class="{ 'input-error': titleError }"
              >
              <label for="title" :class="{ 'label-float': form.title }">广告标题</label>
            </div>
            
            <div class="form-field">
              <input 
                type="text" 
                v-model="form.link" 
                id="link" 
                class="input-field"
              >
              <label for="link" :class="{ 'label-float': form.link }">链接URL</label>
            </div>

            <div class="form-field">
              <select 
                v-model="form.position" 
                id="position" 
                class="input-field"
                :class="{ 'input-error': positionError }"
              >
                <option value="">请选择位置</option>
                <option v-for="option in positionOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <label for="position" :class="{ 'label-float': form.position }">广告位置</label>
            </div>
          </div>
        </div>

        <!-- 第二步：广告描述 -->
        <div v-if="currentStep === 2" class="form-step">
          <h3>广告描述</h3>
          <p>添加广告的详细信息 <span class="optional">(选填)</span></p>
          
          <div class="form-grid">
            <div class="form-field full-width">
              <textarea 
                v-model="form.description" 
                id="description" 
                class="input-field textarea-field"
                rows="4"
              ></textarea>
              <label for="description" :class="{ 'label-float': form.description }">广告描述</label>
            </div>
            
            <div class="form-field full-width">
              <div class="cover-upload-container">
                <h4>广告图片</h4>
                <div class="cover-preview-list">
                  <div 
                    v-for="(image, index) in form.images" 
                    :key="index" 
                    class="cover-preview-item"
                  >
                    <img :src="image" :alt="`图片 ${index+1}`">
                    <button type="button" class="remove-image" @click.stop="removeImage(index)">×</button>
                  </div>
                  <div class="cover-upload-box" @click="triggerFileUpload">
                    <span class="upload-icon">+</span>
                    <span>上传图片</span>
                  </div>
                </div>
                <input 
                  type="file"
                  ref="fileInput"
                  @change="handleImageUpload"
                  accept="image/*"
                  multiple
                  style="display: none;"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 第三步：展示设置 -->
        <div v-if="currentStep === 3" class="form-step">
          <h3>展示设置</h3>
          <p>设置广告的展示时间和状态 <span class="optional">(选填)</span></p>
          
          <div class="form-grid">
            <div class="form-field">
              <input 
                type="date" 
                v-model="form.startTime" 
                id="startTime" 
                class="input-field"
              >
              <label for="startTime" :class="{ 'label-float': form.startTime }">开始时间</label>
            </div>
            
            <div class="form-field">
              <input 
                type="date" 
                v-model="form.endTime" 
                id="endTime" 
                class="input-field"
              >
              <label for="endTime" :class="{ 'label-float': form.endTime }">结束时间</label>
            </div>
            
            <div class="form-field">
              <select 
                v-model="form.status" 
                id="status" 
                class="input-field"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <label for="status" :class="{ 'label-float': form.status }">广告状态</label>
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="navigation-buttons">
          <button 
            class="btn-previous" 
            @click="previousStep"
            :disabled="currentStep === 1"
          >
            ← 上一步
          </button>
          <button 
            class="btn-next" 
            :class="{ 'btn-submit': currentStep === 3 }"
            @click="nextStep"
            :disabled="(currentStep === 1 && !isStep1Valid)"
          >
            {{ currentStep === 3 ? '提交 ✓' : '下一步 →' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// 事件
const emit = defineEmits(['close', 'adver-added']);

// 当前步骤
const currentStep = ref(1);

// 文件上传相关
const fileInput = ref<HTMLInputElement | null>(null);

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

// 表单数据
const form = reactive({
  title: '',
  link: '',
  position: '',
  description: '',
  images: [] as string[], // 用于预览的图片URL
  imagesNames: [] as string[], // 用于提交的图片文件名
  startTime: '',
  endTime: '',
  status: 'inactive'
});

// 表单验证
const titleError = computed(() => {
  return form.title === '' && currentStep.value === 1;
});

const positionError = computed(() => {
  return form.position === '' && currentStep.value === 1;
});

const isStep1Valid = computed(() => {
  return form.title !== '' && form.position !== '';
});

// 步骤显示逻辑
const isStepVisible = (stepNumber: number) => {
  if (stepNumber === currentStep.value) return true;
  
  if (currentStep.value === 1) {
    return stepNumber <= 2;
  }
  
  if (currentStep.value === 3) {
    return stepNumber >= 2;
  }
  
  return Math.abs(stepNumber - currentStep.value) <= 1;
};

// 连接线显示逻辑
const isLineVisible = (lineNumber: number) => {
  if (currentStep.value === 1) {
    return lineNumber === 1;
  }
  if (currentStep.value === 3) {
    return lineNumber === 2;
  }
  return Math.abs(lineNumber - currentStep.value) <= 1;
};

// 步骤导航
const nextStep = async () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  } else {
    try {
      await submitAdver();
      emit('adver-added', form);
      closeModal();
    } catch (error) {
      console.error('提交广告失败:', error);
    }
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// 图片上传
const triggerFileUpload = () => {
  fileInput.value?.click();
};

// 处理图片上传
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files) {
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
          form.imagesNames.push(randomFileName); // 保存文件名
          form.images.push(imageUrl); // 保存URL用于预览

          console.log('图片上传成功:', { 
            url: imageUrl,  // 仅用于前端预览
            name: randomFileName  // 保存到数据库
          });
        } else {
          console.log(response.data);
          throw new Error(response.data?.msg || '上传图片失败');
          
        }
      } catch (error: any) {
        console.error('上传图片错误:', error);
        alert(error.message || '上传图片失败');
        
      }
    }

    // 重置文件输入框
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

// 移除图片
const removeImage = (index: number) => {
  // 同时移除预览URL和文件名
  form.images.splice(index, 1);
  form.imagesNames.splice(index, 1);
};

// 提交广告
const submitAdver = async () => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('未登录或登录已过期');
    }

    // 生成临时ID
    const tempAdverId = Math.floor(Date.now() / 1000); // 使用时间戳作为临时ID

    // 准备广告数据
    const adverData = {
      id: tempAdverId, 
      title: form.title,
      link: form.link || '',
      position: form.position,
      description: form.description || '',
      imageUrl: form.images.length > 0 ? form.images[0] : '',
      image_name: form.imagesNames.length > 0 ? form.imagesNames[0] : '',
      startTime: form.startTime || null,
      endTime: form.endTime || null,
      status: form.status
    };

    console.log('提交的广告数据:', adverData);

    // 调用创建广告API
    const apiUrl = '/api/advertisements';
    const response = await axios.post(apiUrl, adverData, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.code === '200') {
      const adverId = response.data.data.id;
      console.log('广告创建成功，ID:', adverId);
      alert('广告添加成功!');
      return response.data.data;
    } else {
      throw new Error(response.data?.msg || '添加广告失败');
    }
  } catch (error: any) {
    console.error('添加广告错误:', error);
    alert(`添加广告失败: ${error.message || '未知错误'}`);
    throw error;
  }
};

// 关闭模态框
const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background: white;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  animation: scaleIn 0.3s ease;
  padding: 0;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  position: relative;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #d44c4c; /* 修改为红色 */
}

/* 步骤导航容器 */
.steps-container {
  margin: 2rem 0;
  padding: 0 25px;
  overflow: hidden;
  position: relative;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 2rem;
  position: relative;
  transition: transform 0.3s ease;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 1;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  flex: 0 0 auto;
}

.step.active {
  opacity: 1;
  flex: 0 0 auto;
  max-width: none;
}

.step:not(.active) {
  max-width: none;
  overflow: visible;
}

.step-number {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d44c4c; /* 修改为红色 */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.9rem;
}

.step-content {
  overflow: hidden;
}

.step-content h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #1a1a1a;
}

.step-content p {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

.step-line {
  width: 80px;
  height: 2px;
  background: #e5e7eb;
  flex: 0 0 auto;
}

.step.visible {
  max-width: none;
  visibility: visible;
}

.form-content {
  padding: 0 25px 25px;
}

.form-step h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-step p {
  color: #666;
  margin-bottom: 20px;
}

.required {
  color: #d44c4c; /* 修改为红色 */
}

.optional {
  color: #999;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 两列布局 */
  gap: 20px; /* 增加字段之间的间距 */
  width: 100%; /* 确保网格占满父容器 */
  box-sizing: border-box; /* 确保边框和内边距不会影响宽度 */
}

.full-width {
  grid-column: span 2;
}

.form-field {
  position: relative;
  margin-bottom: 20px; /* 增加底部间距，避免内容重叠 */
  width: 100%; /* 确保表单字段占满父容器 */
  box-sizing: border-box; /* 确保边框和内边距不会影响宽度 */
}

.input-field {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  transition: all 0.3s ease;
  color: #333;
  outline: none;
  box-sizing: border-box; /* 确保内边距和边框不会影响宽度 */
}

.input-field:focus {
  border-color: #d44c4c; /* 修改为红色 */
  box-shadow: 0 0 0 3px rgba(212, 76, 76, 0.1); /* 修改为红色 */
}

.textarea-field {
  resize: vertical;
  min-height: 100px;
}

.form-field label {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  padding: 0 5px;
  color: #666;
  transition: all 0.2s;
  pointer-events: none;
}

.form-field textarea + label {
  top: 25px;
}

.form-field .input-field:focus + label,
.form-field .label-float {
  top: 0;
  font-size: 12px;
  color: #d44c4c; /* 修改为红色 */
  font-weight: 500;
}

.error-message {
  font-size: 12px;
  color: #d44c4c; /* 修改为红色 */
  margin-top: 5px;
  display: block;
}

.input-error {
  border-color: #d44c4c; /* 修改为红色 */
}

/* 图片上传样式 */
.cover-upload-container {
  width: 100%;
}

.cover-upload-container h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.cover-preview-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.cover-preview-item {
  width: 100px;
  height: 100px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cover-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  padding: 0;
}

.cover-upload-box {
  width: 100px;
  height: 100px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f9f9f9;
  color: #999;
}

.cover-upload-box:hover {
  border-color: #d44c4c; /* 修改为红色 */
  background: #fff0f0;
  color: #d44c4c; /* 修改为红色 */
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

/* 导航按钮 */
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.btn-previous,
.btn-next {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
  border: none;
}

.btn-previous {
  background: #f2f2f2;
  color: #666;
}

.btn-previous:hover:not(:disabled) {
  background: #e6e6e6;
}

.btn-previous:disabled {
  background: #f8f8f8;
  color: #ccc;
  cursor: not-allowed;
}

.btn-next {
  background: #d44c4c; /* 修改为红色 */
  color: white;
  box-shadow: 0 4px 12px rgba(212, 76, 76, 0.2); /* 修改为红色 */
}

.btn-next:hover:not(:disabled) {
  background: #c43c3c; /* 红色按钮悬停颜色变深 */
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(212, 76, 76, 0.3); /* 修改为红色 */
}

.btn-submit {
  background: #22c55e; /* 保持绿色提交按钮 */
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.btn-submit:hover:not(:disabled) {
  background: #16a34a; /* 绿色按钮悬停颜色变深 */
  box-shadow: 0 6px 15px rgba(34, 197, 94, 0.3);
}

.btn-next:disabled {
  background: #ffb3b3;
  cursor: not-allowed;
  box-shadow: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: 1;
  }
}
</style>
