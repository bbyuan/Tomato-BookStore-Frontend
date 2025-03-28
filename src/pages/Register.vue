<template>
  <div class="page-container">
    <div class="register-container">
      <h2>注册账号</h2>
      
      <!-- 步骤指示器 -->
      <div class="steps-container">
        <div class="steps">
          <div class="step" :class="{ active: currentStep === 1, visible: isStepVisible(1) }">
            <div class="step-number">01</div>
            <div class="step-content">
              <h3>账号信息</h3>
              <p>请设置账号信息</p>
            </div>
          </div>
          <div class="step-line" :class="{ visible: isLineVisible(1) }"></div>
          <div class="step" :class="{ active: currentStep === 2, visible: isStepVisible(2) }">
            <div class="step-number">02</div>
            <div class="step-content">
              <h3>个人信息</h3>
              <p>请输入基本信息</p>
            </div>
          </div>
          <div class="step-line" :class="{ visible: isLineVisible(2) }"></div>
          <div class="step" :class="{ active: currentStep === 3, visible: isStepVisible(3) }">
            <div class="step-number">03</div>
            <div class="step-content">
              <h3>扩展信息</h3>
              <p>请输入扩展信息</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="form-content">
        <!-- 第一步：账号信息 -->
        <div v-if="currentStep === 1" class="form-step">
          <h3>账号信息</h3>
          <p>输入你的账户信息 <span class="required">*</span></p>
          
          <div class="form-grid">
            <div class="form-field">
              <input type="text" v-model="form.username" id="username" class="input-field">
              <label for="username" :class="{ 'label-float': form.username }">用户名</label>
            </div>
            <div class="form-field">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="form.password" 
                id="password" 
                class="input-field"
              >
              <label for="password" :class="{ 'label-float': form.password }">密码</label>
              <img 
                class="password-toggle" 
                :src="showPassword ? '/src/assets/images/眼睛_显示.svg' : '/src/assets/images/眼睛_隐藏.svg'"
                @click="showPassword = !showPassword"
                alt="toggle password visibility"
              >
            </div>
            <div class="form-field">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                v-model="form.confirmPassword" 
                id="confirmPassword" 
                class="input-field"
                :class="{ 'input-error': passwordMismatch }"
              >
              <label for="confirmPassword" :class="{ 'label-float': form.confirmPassword }">确认密码</label>
              <img 
                class="password-toggle" 
                :src="showConfirmPassword ? '/src/assets/images/眼睛_显示.svg' : '/src/assets/images/眼睛_隐藏.svg'"
                @click="showConfirmPassword = !showConfirmPassword"
                alt="toggle password visibility"
              >
              <span class="error-message" v-if="passwordMismatch">两次输入的密码不一致</span>
            </div>
            <div class="form-field">
              <select v-model="form.role" id="role" class="input-field">
            
                <option value="customer">顾客</option>
                <option value="publisher">出版社</option>
                <option value="admin">管理员</option>
              </select>
              <label for="role" :class="{ 'label-float': form.role }">角色</label>
            </div>
          </div>
        </div>

        <!-- 第二步：基本信息 -->
        <div v-if="currentStep === 2" class="form-step">
          <h3>基本信息</h3>
          <p>设置个人信息 <span class="required">*</span></p>
          
          <div class="form-grid">
            <div class="form-field">
              <input type="text" v-model="form.name" id="name" class="input-field">
              <label for="name" :class="{ 'label-float': form.name }">姓名</label>
            </div>
            
            <div class="form-field">
              <input type="tel" v-model="form.telephone" id="telephone" class="input-field">
              <label for="telephone" :class="{ 'label-float': form.telephone }">手机号</label>
            </div>

            <div class="form-field">
              <input type="email" v-model="form.email" id="email" class="input-field">
              <label for="email" :class="{ 'label-float': form.email }">邮箱</label>
            </div>

            <div class="form-field avatar-field">
              <div class="avatar-upload">
                <div class="avatar-preview" v-if="avatarPreview">
                  <img :src="avatarPreview" alt="头像预览">
                </div>
                <div class="avatar-placeholder" v-else>
                  <i class="avatar-icon">📷</i>
                  <span>点击上传头像</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleAvatarUpload" 
                  id="avatarUpload" 
                  class="avatar-input"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 第三步：位置信息 -->
        <div v-if="currentStep === 3" class="form-step">
          <h3>位置信息</h3>
          <p>添加你的位置信息 (可选)</p>
          
          <div class="form-grid">
            <div class="form-field">
              <input type="text" v-model="form.location" id="location" class="input-field">
              <label for="location" :class="{ 'label-float': form.location }">所在地</label>
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
            :disabled="(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)"
            "
          >
            {{ currentStep === 3 ? '提交 ✓' : '下一步 →' }}
          </button>
        </div>

        <div class="login-link">
          已有账号？<router-link to="/" class="login-text">返回登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const currentStep = ref(1)
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: '',
  name: '',
  avatar: '',
  telephone: '',
  email: '',
  location: ''
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const passwordMismatch = computed(() => {
  return form.password && form.confirmPassword && (form.password !== form.confirmPassword)
})

const isStep1Valid = computed(() => {
  return form.username.trim() !== '' &&
         form.password.trim() !== '' &&
         form.confirmPassword.trim() !== '' &&
         form.role.trim() !== '' &&
         form.password === form.confirmPassword
})

const isStep2Valid = computed(() => {
  if (form.name.trim() === '') return false
  if (form.email.trim() !== '' && !emailRegex.test(form.email)) return false
  return true
})

const nextStep = async () => {
  if (currentStep.value === 1 && !isStep1Valid.value) {
    alert("请填写完整账号信息，并确保密码一致：用户名、密码、确认密码和角色")
    return
  }
  if (currentStep.value === 2 && !isStep2Valid.value) {
    alert("请填写姓名，并确保邮箱格式正确（如填写）")
    return
  }
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    try {
      const formData = {
        username: form.username,
        password: form.password,
        name: form.name,
        role: form.role,
        avatar: form.avatar,
        telephone: form.telephone,
        email: form.email,
        location: form.location
      }

      const response = await axios.post('/api/accounts', formData)
      
      if (response.status === 200 || response.status === 201) {
        router.push({
          path: '/',
          query: { 
            username: form.username,
            registered: 'true'
          }
        })
      } else {
        throw new Error('注册失败')
      }
    } catch (error: any) {
      console.error('注册错误:', error)
      alert(error.response?.data?.message || '注册失败，请稍后重试')
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const avatarPreview = ref<string | null>(null)

const handleAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      avatarPreview.value = reader.result as string
      form.avatar = avatarPreview.value // 将 base64 存到 avatar 字段中
    }
    reader.readAsDataURL(file)
  }
}

// 判断步骤是否应该显示
const isStepVisible = (stepNumber: number) => {
  // 当前步骤始终显示
  if (stepNumber === currentStep.value) return true
  
  // 如果是第一步，显示当前步骤和下一步
  if (currentStep.value === 1) {
    return stepNumber <= 2
  }
  
  // 如果是最后一步，显示当前步骤和上一步
  if (currentStep.value === 3) {
    return stepNumber >= 2
  }
  
  // 在中间步骤时，显示三个步骤
  return true
}

// 判断连接线是否应该显示
const isLineVisible = (lineNumber: number) => {
  if (currentStep.value === 1) {
    return lineNumber === 1
  }
  if (currentStep.value === 3) {
    return lineNumber === 2
  }
  return true
}

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const getButtonDisabledMessage = () => {
  if (currentStep.value === 1 && !isStep1Valid.value) {
    return '请填写完整账号信息：用户名、密码、确认密码和角色'
  }
  if (currentStep.value === 2 && !isStep2Valid.value) {
    return '请填写姓名，并确保邮箱格式正确（如填写）'
  }
  return ''
}

</script>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('@/assets/images/login_background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow-y: auto;
  background-color: #f3f4f6;  /* 添加一个与背景图片相近的背景色 */
}

.register-container {
  width: 100%;
  max-width: 600px;  /* 减小最大宽度 */
  max-height: 85vh;
  margin: 2rem;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

/* 修改滚动条样式 */
.register-container::-webkit-scrollbar {
  width: 4px;  /* 减小滚动条宽度 */
}

.register-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;  /* 减小圆角 */
}

.register-container::-webkit-scrollbar-thumb {
  background: rgba(212, 76, 76, 0.3);  /* 降低滚动条不透明度 */
  border-radius: 2px;  /* 减小圆角 */
}

.register-container::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 76, 76, 0.5);  /* 悬停时稍微加深 */
}

h2 {
  color: #1a1a1a;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
}

/* 步骤导航容器 */
.steps-container {
  margin: 2rem 0 3rem;
  overflow: hidden;
  position: relative;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  position: relative;
}

/* 修改步骤样式 */
.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 1;  /* 取消透明度 */
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}

/* 当前步骤样式 */
.step.active {
  opacity: 1;
  flex: 0 0 auto;  /* 不允许压缩 */
  max-width: none;  /* 移除最大宽度限制 */
}

/* 非当前步骤样式 */
.step:not(.active) {
  opacity: 1;  /* 取消非激活状态的透明度 */
  max-width: 50px;  /* 限制非活动步骤的宽度 */
  overflow: hidden;
}

/* 步骤数字样式 */
.step-number {
  flex: 0 0 auto;  /* 不允许压缩 */
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #d44c4c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.9rem;
}

/* 步骤内容样式 */
.step-content {
  overflow: hidden;  /* 超出部分隐藏 */
  transition: all 0.3s ease;
}

/* 连接线样式 */
.step-line {
  width: 60px;
  height: 2px;
  background: #e5e7eb;
  flex: 0 0 auto;  /* 不允许压缩 */
}

/* 移除之前的 visible 相关样式 */
.step.visible {
  max-width: none;
  visibility: visible;
}

.input-field {
  width: 100%;
  padding: 1rem 1.2rem;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: all 0.3s ease;
  color: #1a1a1a;
  outline: none;  /* 移除默认的焦点轮廓 */
}

.input-field:focus {
  border-color: #d44c4c;  /* 保持红色边框 */
  box-shadow: 0 4px 12px rgba(212, 76, 76, 0.1);
  outline: none;  /* 确保移除默认的蓝色轮廓 */
}

/* 修改选择框样式 */
select.input-field:focus {
  border-color: #d44c4c;  /* 确保下拉框也保持红色边框 */
  outline: none;
}

.form-field {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .avatar-field {
    grid-column: span 2;
  }
}

/* 修改导航按钮的样式 */
.navigation-buttons {
  display: flex;
  justify-content: space-between;  /* 改为两端对齐 */
  align-items: center;
  margin-top: 3rem;  /* 增加与表单的间距 */
  padding: 0 1rem;  /* 添加左右内边距 */
  margin-bottom: 0;  /* 移除底部边距 */
}

.btn-previous,
.btn-next {
  padding: 1rem 2.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 1rem;
  min-width: 140px;  /* 设置最小宽度确保按钮大小一致 */
}

.btn-previous {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #eee;
}

.btn-previous:hover:not(:disabled) {
  background: #f1f3f5;
  border-color: #ddd;
}

.btn-next {
  background: #d44c4c;
  color: white;
  box-shadow: 0 4px 12px rgba(212, 76, 76, 0.2);
}

.btn-next:hover:not(:disabled) {
  background: #c43c3c;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(212, 76, 76, 0.3);
}

.btn-submit {
  background: #22c55e !important;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2) !important;
}

.btn-submit:hover:not(:disabled) {
  background: #16a34a !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3) !important;
}

/* 修改第二步的表单布局 */
.avatar-field {
  margin-top: 1rem;
}

.avatar-upload {
  width: 100%;
  height: 120px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.avatar-upload:hover {
  border-color: #ddd;  /* 改为灰色边框 */
  background-color: #f8f9fa;  /* 改为浅灰色背景 */
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.avatar-icon {
  font-size: 2rem;
}

.avatar-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview img {
  height: 100px;
  width: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: none;  /* 移除边框 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);  /* 调整阴影效果 */
  transition: all 0.3s ease;
}

.avatar-preview img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);  /* 悬停时增加阴影 */
}

/* 美化错误提示 */
.error-message {
  position: absolute;
  left: 0;
  bottom: -22px;
  font-size: 0.85rem;
  color: #dc2626;
  padding: 0.2rem 0;
  opacity: 0.9;
}

/* 添加表单标题样式 */
.form-step h3 {
  color: #1a1a1a;
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-step p {
  color: #666;
  margin-bottom: 1.5rem;
}

/* 修改标签样式 */
.form-field label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  padding: 0 0.25rem;
  color: #666;
  transition: all 0.2s;
  pointer-events: none;
  font-size: 1rem;
}

/* 修改浮动标签样式 */
.form-field .input-field:focus + label,
.form-field .label-float {
  top: 0;
  font-size: 0.85rem;
  color: #d44c4c;
  font-weight: 500;
}

/* 修改选择框文字颜色 */
select.input-field {
  color: #1a1a1a;
}

/* 修改必填标记样式 */
.required {
  color: #d44c4c;
  margin-left: 4px;
}

/* 步骤指示器文字样式 */
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

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  width: 20px;  /* 设置图标大小 */
  height: 20px;
  opacity: 0.6;  /* 默认状态稍微透明 */
  transition: opacity 0.3s ease;
}

.password-toggle:hover {
  opacity: 1;  /* 悬停时完全不透明 */
}

/* 调整带有切换按钮的输入框的内边距 */
.form-field input[type="password"],
.form-field input[type="text"] {
  padding-right: 2.5rem;
}

/* 修改登录链接样式 */
.login-link {
  text-align: center;
  margin-top: 2rem;  /* 调整与按钮的间距 */
  color: #666;
  font-size: 0.9rem;
}

.login-text {
  color: #d44c4c;
  text-decoration: none;
  margin-left: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-text:hover {
  color: #c43c3c;
  text-decoration: underline;
}

.btn-next:disabled {
  background: #ccc !important;  /* 使用灰色背景 */
  color: #666 !important;  /* 文字颜色变浅 */
  cursor: not-allowed;  /* 鼠标显示禁用状态 */
  box-shadow: none !important;  /* 移除阴影 */
  transform: none !important;  /* 禁用悬停效果 */
}

.btn-next:disabled:hover {
  background: #ccc !important;
  transform: none !important;
  box-shadow: none !important;
}

</style>