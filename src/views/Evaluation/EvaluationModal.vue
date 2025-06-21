<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>商品评价</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-content">
        <!-- 商品信息 -->
        <div class="product-info">
          <div class="product-image-wrapper">
            <img :src="product.image" :alt="product.title" class="product-image">
          </div>
          <div class="product-details">
            <h3 class="product-title">{{ product.title }}</h3>
            <div class="product-price-wrapper">
              <span class="price-label">商品价格</span>
              <span class="product-price">¥{{ product.price.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- 评分区域 -->
        <div class="rating-section">
          <div class="section-header">
            <h4><i class="icon">⭐</i>商品评分</h4>
            <span class="required-badge">必填</span>
          </div>
          <div class="rating-container">
            <!-- 分数输入 -->
            <div class="rating-input-wrapper">
              <input 
                type="number" 
                v-model="rating" 
                min="1" 
                max="10" 
                step="1"
                class="rating-input"
                placeholder="1-10分"
              />
              <span class="rating-unit">/10分</span>
            </div>
            
            <!-- 星星预览 -->
            <div class="rating-preview">
              <RatingStars :rating="rating" />
            </div>
          </div>
        </div>

        <!-- 评价内容 -->
        <div class="comment-section">
          <h4>评价内容</h4>
          <textarea
            v-model="comment"
            placeholder="请写下您对商品的评价..."
            class="comment-textarea"
            rows="4"
            maxlength="500"
          ></textarea>
          <div class="char-count">{{ comment.length }}/500</div>
        </div>

        <!-- 图片上传 -->
        <div class="image-section">
          <h4>晒图 <span class="optional">(选填)</span></h4>
          <div class="image-upload-area">
            <div class="uploaded-images">
              <div 
                v-for="(image, index) in uploadedImages" 
                :key="index"
                class="image-item"
              >
                <img :src="image" alt="评价图片" class="uploaded-image">
                <button 
                  type="button" 
                  class="remove-image" 
                  @click="removeImage(index)"
                  :title="'删除图片 ' + (index + 1)"
                >
                  ×
                </button>
              </div>
              
              <div 
                v-if="uploadedImages.length < 5"
                class="upload-trigger"
                @click="triggerFileUpload"
                :class="{ 'uploading': isUploading }"
              >
                <div v-if="isUploading" class="upload-loading">
                  <div class="loading-spinner"></div>
                  <span class="upload-text">上传中...</span>
                </div>
                <div v-else class="upload-content">
                  <span class="upload-icon">+</span>
                  <span class="upload-text">添加图片</span>
                </div>
              </div>
            </div>
            
            <input 
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              @change="handleImageUpload"
              style="display: none;"
            >
            
            <p class="upload-tip">
              最多上传5张图片，每张不超过5MB，支持JPG、PNG格式
              <span v-if="uploadedImages.length > 0" class="image-count">
                (已上传{{ uploadedImages.length }}/5张)
              </span>
            </p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button 
            class="submit-btn" 
            @click="submitEvaluation"
            :disabled="!canSubmit || isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '提交评价' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import RatingStars from '@/views/Detail/RatingStars.vue'

// Props
const props = defineProps<{
  product: {
    productId: string
    title: string
    image: string
    price: number
  }
  orderId?: string
  review?: {
    reviewId: string
    rating: number
    comment: string
    media?: Array<{image: string, imageName: string}>
  }
}>()

// Emits
const emit = defineEmits(['close', 'submitted'])

// 评分相关
const rating = ref(0)

// 评价内容
const comment = ref('')

// 图片上传
const uploadedImages = ref<string[]>([])
const uploadedImageNames = ref<string[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

// 提交状态
const isSubmitting = ref(false)

// 计算属性
const canSubmit = computed(() => {
  return rating.value > 0 && comment.value.trim().length > 0
})

// 评分相关方法
const setRating = (value: number) => {
  rating.value = value
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files) return

  // 检查总数量限制
  const remainingSlots = 5 - uploadedImages.value.length
  if (files.length > remainingSlots) {
    alert(`最多只能上传5张图片，您还可以选择${remainingSlots}张`)
    return
  }

  isUploading.value = true

  try {
    for (const file of files) {
      try {
        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} 文件大小超过5MB，已跳过`)
          continue
        }

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} 不是图片文件，已跳过`)
          continue
        }

        // 生成随机文件名
        const fileExt = file.name.split('.').pop()
        const randomFileName = `${uuidv4()}.${fileExt}`

        // 创建 FormData
        const formData = new FormData()
        formData.append('file', file, randomFileName)

        // 上传图片
        const token = sessionStorage.getItem('token')
        if (!token) {
          throw new Error('请先登录')
        }

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upload/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'token': token
          }
        })

        if (response.data && response.data.code === '200') {
          uploadedImages.value.push(response.data.data)
          uploadedImageNames.value.push(randomFileName)
          console.log('图片上传成功:', { url: response.data.data, name: randomFileName })
        } else {
          throw new Error(response.data?.msg || '上传失败')
        }
      } catch (error: any) {
        console.error(`上传 ${file.name} 失败:`, error)
        alert(`上传 ${file.name} 失败: ${error.message}`)
      }
    }
  } finally {
    isUploading.value = false
    // 重置文件输入框
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
  uploadedImageNames.value.splice(index, 1)
}

const submitEvaluation = async () => {
  if (!canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const token = sessionStorage.getItem('token')
    if (!token) {
      throw new Error('请先登录')
    }

    // 按照接口要求构建评价数据
    const reviewData = {
      bookId: props.product.productId,  // 书籍ID (即productId)
      rating: rating.value,             // 评分 (10分制)
      comment: comment.value.trim(),    // 评价内容
      media: uploadedImageNames.value.map(imageName => ({
        imageName: imageName,  // 图片名称
        image: ''              // 图片链接留空
      }))
    }

    console.log('提交评价数据:', reviewData)

    // 调用评价接口
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${props.orderId}`, 
      reviewData,
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data && response.data.code === '200') {
      alert('评价提交成功！')
      emit('submitted', {
        orderId: props.orderId,
        productId: props.product.productId,
        rating: rating.value,
        comment: comment.value.trim(),
        images: uploadedImageNames.value
      })
      closeModal()
    } else {
      throw new Error(response.data?.msg || '评价提交失败')
    }
  } catch (error: any) {
    console.error('提交评价失败:', error)
    alert(error.message || '评价提交失败')
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  emit('close')
}
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
  max-width: 600px;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  animation: scaleIn 0.3s ease;
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
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ff6b6b;
}

.modal-content {
  padding: 25px;
}

.product-info {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  margin-bottom: 30px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.product-info:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.product-image-wrapper {
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 70px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
}

.product-price-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.product-price {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #ff6b6b;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.required-badge {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
}

.rating-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.interactive-stars {
  display: flex;
  gap: 0;
  justify-content: center;
  margin-bottom: 15px;
}

.interactive-star {
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.4;
  filter: grayscale(80%);
}

.interactive-star.active {
  opacity: 1;
  filter: none;
  transform: scale(1.05);
}

.interactive-star:hover {
  transform: scale(1.2);
  opacity: 0.8;
}

.rating-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: linear-gradient(135deg, #fff9f9, #fff);
  border-radius: 12px;
  border: 1px solid #ffe8e8;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.1);
}

.rating-section,
.comment-section,
.image-section {
  margin-bottom: 25px;
}

.rating-section h4,
.comment-section h4,
.image-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-section h4::before {
  content: "📷";
  font-size: 18px;
}

.number-rating {
  display: flex;
  align-items: center;
  gap: 20px;
}

.rating-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-value {
  font-size: 16px;
  font-weight: 600;
  color: #ff6b6b;
  text-align: center;
  margin-top: 5px;
}

.rating-max {
  font-weight: normal;
  color: #999;
  margin-left: 2px;
}

.comment-section {
  margin-bottom: 25px;
}

.comment-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-section h4::before {
  content: "✍️";
  font-size: 18px;
}

.comment-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  min-height: 120px;
}

.comment-textarea:focus {
  border-color: #ff6b6b;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
  background: white;
}

.comment-textarea::placeholder {
  color: #adb5bd;
  font-style: italic;
}

.char-count {
  text-align: right;
  margin-top: 8px;
  font-size: 12px;
  color: #6c757d;
  padding: 0 5px;
}

.char-count.warning {
  color: #ffc107;
}

.char-count.danger {
  color: #dc3545;
}

.optional {
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

.image-upload-area {
  margin-top: 10px;
}

.uploaded-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.image-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}

.remove-image {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
}

.remove-image:hover {
  background: #ff5252;
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.4);
}

.upload-trigger {
  width: 80px;
  height: 80px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  position: relative;
}

.upload-trigger:hover {
  border-color: #ff6b6b;
  background: #fff9f9;
}

.upload-trigger.uploading {
  cursor: not-allowed;
  border-color: #bbb;
  background: #f5f5f5;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 24px;
  color: #999;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.upload-trigger:hover .upload-icon {
  color: #ff6b6b;
}

.upload-text {
  font-size: 10px;
  color: #999;
  text-align: center;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.upload-trigger:hover .upload-text {
  color: #ff6b6b;
}

.upload-trigger.uploading .upload-text {
  color: #bbb;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin: 10px 0 0 0;
  text-align: center;
  line-height: 1.4;
}

.image-count {
  color: #ff6b6b;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 25px;
  border-top: 1px solid #f0f0f0;
  margin-top: 30px;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  min-width: 100px;
}

.cancel-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.cancel-btn:hover {
  background: #e9ecef;
  color: #495057;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:disabled {
  background: linear-gradient(135deg, #ced4da, #dee2e6);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.rating-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.rating-input {
  width: 80px;
  height: 40px;
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
  color: #333;
  background: white;
}

.rating-input:focus {
  border-color: #ff6b6b;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.rating-input::-webkit-outer-spin-button,
.rating-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.rating-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.rating-unit {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}
</style>