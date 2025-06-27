<template>
  <div class="page-container">
    <div class="register-container">
      <h2>创建账号</h2>
      
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
              <input 
                type="text" 
                v-model="form.username" 
                id="username" 
                class="input-field"
                :class="{ 'input-error': usernameError }"
              >
              <label for="username" :class="{ 'label-float': form.username }">用户名</label>
              <span class="error-message" v-if="usernameError">用户名只能包含中文、英文字母、数字</span>
            </div>
            <div class="form-field">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="form.password" 
                id="password" 
                class="input-field"
                :class="{ 'input-error': passwordError }"
              >
              <label for="password" :class="{ 'label-float': form.password }">密码</label>
              <span 
                class="password-toggle" 
                @click="showPassword = !showPassword"
                style="display: flex; align-items: center;"
                aria-label="切换密码可见性"
              >
                <span v-if="showPassword">
                  <!-- 可见小眼睛 SVG -->
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <ellipse cx="10" cy="10" rx="7" ry="4" stroke="#333" stroke-width="1.5" fill="none"/>
                    <circle cx="10" cy="10" r="2" fill="#333"/>
                  </svg>
                </span>
                <span v-else>
                  <!-- 隐藏小眼睛 SVG（带斜杠） -->
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <ellipse cx="10" cy="10" rx="7" ry="4" stroke="#333" stroke-width="1.5" fill="none"/>
                    <circle cx="10" cy="10" r="2" fill="#333"/>
                    <line x1="4" y1="16" x2="16" y2="4" stroke="#d44c4c" stroke-width="1.5"/>
                  </svg>
                </span>
              </span>
              <span class="error-message" v-if="passwordError">{{ passwordErrorMessage }}</span>
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
              <span 
                class="password-toggle" 
                @click="showConfirmPassword = !showConfirmPassword"
                style="display: flex; align-items: center;"
                aria-label="切换密码可见性"
              >
                <span v-if="showConfirmPassword">
                  <!-- 可见小眼睛 SVG -->
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <ellipse cx="10" cy="10" rx="7" ry="4" stroke="#333" stroke-width="1.5" fill="none"/>
                    <circle cx="10" cy="10" r="2" fill="#333"/>
                  </svg>
                </span>
                <span v-else>
                  <!-- 隐藏小眼睛 SVG（带斜杠） -->
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <ellipse cx="10" cy="10" rx="7" ry="4" stroke="#333" stroke-width="1.5" fill="none"/>
                    <circle cx="10" cy="10" r="2" fill="#333"/>
                    <line x1="4" y1="16" x2="16" y2="4" stroke="#d44c4c" stroke-width="1.5"/>
                  </svg>
                </span>
              </span>
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
              <input 
                type="tel" 
                v-model="form.telephone" 
                id="telephone" 
                class="input-field"
                :class="{ 'input-error': telephoneError }"
              >
              <label for="telephone" :class="{ 'label-float': form.telephone }">手机号</label>
              <span class="error-message" v-if="telephoneError">请输入正确的11位手机号</span>
            </div>

            <div class="form-field">
              <input 
                type="email" 
                v-model="form.email" 
                id="email" 
                class="input-field"
                :class="{ 'input-error': emailError }"
              >
              <label for="email" :class="{ 'label-float': form.email }">邮箱</label>
              <span class="error-message" v-if="emailError">请输入正确的邮箱格式</span>
            </div>

            <div class="form-field avatar-field">
              <div class="avatar-upload">
                <div class="avatar-preview" v-if="avatarPreview">
                  <img :src="avatarPreview" :alt="'头像预览'" style="width: 100px; height: 100px; object-fit: cover; border-radius: 50%;">
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
              <input 
                type="text" 
                v-model="selectedProvince" 
                id="province" 
                class="input-field"
                @input="updateLocationValue"
              >
              <label for="province" :class="{ 'label-float': selectedProvince }">省份</label>
            </div>
            
            <div class="form-field">
              <input 
                type="text" 
                v-model="selectedCity" 
                id="city" 
                class="input-field"
                @input="updateLocationValue"
              >
              <label for="city" :class="{ 'label-float': selectedCity }">城市</label>
            </div>
            
            <div class="form-field">
              <input 
                type="text" 
                v-model="selectedDistrict" 
                id="district" 
                class="input-field"
                @input="updateLocationValue"
              >
              <label for="district" :class="{ 'label-float': selectedDistrict }">区/县</label>
            </div>
          </div>
        </div>

        <!-- 添加密码要求提示 -->
        <div class="password-requirements" v-if="currentStep === 1">
          <p>密码要求：</p>
          <ul>
            <li>密码长度：确保密码至少包含8个字符</li>
            <li>字符种类：使用大小写字母、数字和特殊字符的组合</li>
          </ul>
        </div>

        <!-- 导航按钮 -->
        <div class="navigation-buttons">
          <button 
            class="btn-previous" 
            @click="previousStep"
            :disabled="currentStep === 1"
            :title="currentStep === 1 ? '已经是第一步' : undefined"
          >
            ← 上一步
          </button>
          <button 
            class="btn-next" 
            :class="{ 'btn-submit': currentStep === 3 }"
            @click="nextStep"
            :disabled="(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid)"
            :title="getNextButtonTitle || undefined"
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const router = useRouter()

const currentStep = ref(1)
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  role: '',
  name: '',
  avatar: '',
  avatar_name: '',
  telephone: '',
  email: '',
  location: ''
})

// 省市区选择状态
const selectedProvince = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')

// 更新location值
const updateLocationValue = () => {
  const locationParts = []
  if (selectedProvince.value) locationParts.push(selectedProvince.value)
  if (selectedCity.value) locationParts.push(selectedCity.value)
  if (selectedDistrict.value) locationParts.push(selectedDistrict.value)
  
  form.location = locationParts.join(' ')
}

// 监听区/县的变化，更新location
watch(selectedDistrict, () => {
  updateLocationValue()
})

const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/  // 中文、英文字母、数字
const telephoneRegex = /^1[3-9]\d{9}$/  // 11位手机号
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/  // 邮箱格式

const passwordMismatch = computed(() => {
  return form.password && form.confirmPassword && (form.password !== form.confirmPassword)
})

const usernameError = computed(() => {
  return form.username && !usernameRegex.test(form.username)
})

const telephoneError = computed(() => {
  return form.telephone && !telephoneRegex.test(form.telephone)
})

const emailError = computed(() => {
  return form.email && !emailRegex.test(form.email)
})

const validatePassword = (password: string) => {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return {
    isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    message: !hasUpperCase ? '密码必须包含大写字母' :
             !hasLowerCase ? '密码必须包含小写字母' :
             !hasNumbers ? '密码必须包含数字' :
             !hasSpecialChar ? '密码必须包含特殊字符' : ''
  }
}

const passwordError = computed(() => {
  if (form.password === '') return false
  if (!form.password) return true
  if (form.password.length < 8) return true
  return !validatePassword(form.password).isValid
})

const passwordErrorMessage = computed(() => {
  if (!form.password && form.password !== '') 
    return '密码不能为空'
  if (form.password.length < 8) 
    return '密码长度必须至少为8个字符'
  const validation = validatePassword(form.password)
  if (!validation.isValid) return validation.message
  return ''
})

const isStep1Valid = computed(() => {
  return form.username.trim() !== '' &&
         !usernameError.value &&
         form.password.trim() !== '' &&
         !passwordError.value &&
         form.confirmPassword.trim() !== '' &&
         form.role.trim() !== '' &&
         form.password === form.confirmPassword
})

const isStep2Valid = computed(() => {
  if (form.name.trim() === '') return false
  if (form.telephone.trim() !== '' && !telephoneRegex.test(form.telephone)) return false
  if (form.email.trim() !== '' && !emailRegex.test(form.email)) return false
  return true
})

const getNextButtonTitle = computed(() => {
  if (currentStep.value === 1 && !isStep1Valid.value) {
    if (usernameError.value) return '请输入正确格式的用户名'
    return '请填写完整账号信息并确保密码一致'
  }
  if (currentStep.value === 2 && !isStep2Valid.value) {
    if (telephoneError.value) return '请输入正确的手机号格式'
    if (emailError.value) return '请输入正确的邮箱格式'
    return '请填写姓名'
  }
  return ''
})

const nextStep = async () => {
  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    try {
      // 更新location值，确保提交前是最新的
      updateLocationValue()
      
      const formData = {
        username: form.username,
        password: form.password,
        name: form.name,
        role: form.role,
        avatar_name: form.avatar_name,
        telephone: form.telephone,
        email: form.email,
        location: form.location
      }

      console.log('提交的数据:', formData) // 添加日志

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/accounts`, formData)
      
      console.log('注册响应:', response.data) // 添加日志

      // 修改判断条件，使用 response.data.code
      if (response.data.code === '200') {
        // 注册成功，跳转到登录页
        router.push({
          path: '/',
          query: { 
            username: form.username,
            registered: 'true'
          }
        })
      } else {
        // 如果后端返回了错误信息，显示具体错误
        throw new Error(response.data.msg || '注册失败')
      }
    } catch (error: any) {
      console.error('注册错误:', error)
      // 显示具体的错误信息
      alert(error.response?.data?.msg || error.message || '注册失败，请稍后重试')
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const avatarPreview = ref<string | null>(null)

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    try {
      // 检查文件大小（800KB限制）
      if (file.size > 800 * 1024) {
        throw new Error('文件大小不能超过800KB')
      }

      // 生成随机文件名
      const fileExt = file.name.split('.').pop() // 获取文件扩展名
      const randomFileName = `${uuidv4()}.${fileExt}` // 生成随机文件名

      // 创建 FormData
      const formData = new FormData()
      formData.append('file', file, randomFileName)

      // 调用上传接口
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upload/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('上传响应:', response.data) // 添加日志

      if (response.data.code === '200') {
        // 保存文件名和预览URL
        form.avatar_name = randomFileName  // 保存文件名，用于创建用户时传递
        // 直接使用返回的完整URL
        const imageUrl = response.data.data
        console.log('设置预览URL:', imageUrl) // 添加日志
        avatarPreview.value = imageUrl  // 更新预览图片
      } else {
        throw new Error(response.data.msg || '上传失败')
      }
    } catch (error) {
      console.error('上传失败:', error)
      alert(error instanceof Error ? error.message : '头像上传失败，请重试')
    }
  }
}

// 修改步骤显示逻辑
const isStepVisible = (stepNumber: number) => {
  // 当前步骤必须显示
  if (stepNumber === currentStep.value) return true
  
  // 如果是第一步
  if (currentStep.value === 1) {
    return stepNumber <= 2  // 显示第一步和第二步
  }
  
  // 如果是最后一步
  if (currentStep.value === 3) {
    return stepNumber >= 2  // 显示第二步和第三步
  }
  
  // 如果是中间步骤，显示前后各一个步骤
  return Math.abs(stepNumber - currentStep.value) <= 1
}

// 修改连接线显示逻辑
const isLineVisible = (lineNumber: number) => {
  // 确保当前步骤相邻的连接线可见
  if (currentStep.value === 1) {
    return lineNumber === 1
  }
  if (currentStep.value === 3) {
    return lineNumber === 2
  }
  return Math.abs(lineNumber - currentStep.value) <= 1
}

const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 监听 avatarPreview 的变化
watch(avatarPreview, (newValue) => {
  console.log('avatarPreview 更新为:', newValue)
})

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
  padding: 40px;  /* 增加内边距，让容器与屏幕边缘有更多空间 */
  overflow-y: auto;  /* 添加垂直滚动条 */
}

.register-container {
  width: 100%;
  max-width: 800px;  /* 从600px增加到800px */
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
  justify-content: flex-start;  /* 改为左对齐 */
  gap: 2rem;
  position: relative;
  transition: transform 0.3s ease;  /* 添加过渡效果 */
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 1;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  flex: 0 0 auto;  /* 防止步骤被压缩 */
}

/* 当前步骤样式 */
.step.active {
  opacity: 1;
  flex: 0 0 auto;  /* 不允许压缩 */
  max-width: none;  /* 移除最大宽度限制 */
}

/* 非当前步骤样式 */
.step:not(.active) {
  max-width: none;  /* 移除宽度限制，让所有步骤完全显示 */
  overflow: visible;
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
  width: 80px;  /* 增加连接线的宽度 */
  height: 2px;
  background: #e5e7eb;
  flex: 0 0 auto;
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
  margin-bottom: 1.5rem;  /* 增加底部间距，为错误消息留出空间 */
  display: flex;
  flex-direction: column;
  gap: 4px;  /* 调整为与 Security/Accounts 一致的间距 */
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

.btn-next:disabled {
  background: #ccc !important;
  cursor: not-allowed;
  box-shadow: none !important;
  transform: none !important;
}

.btn-previous:disabled {
  background: #f8f9fa;
  color: #ccc;
  cursor: not-allowed;
  border-color: #eee;
}

/* 修改提示框样式，只在有 title 且不为空时显示 */
.btn-next[title]:not([title=""]):hover::after,
.btn-previous[title]:not([title=""]):hover::after {
  content: attr(title);
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 0.85rem;
  white-space: nowrap;
  z-index: 1000;
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

/* 修改错误消息样式 */
.error-message {
  margin-top: 4px;  /* 调整为与 Security/Accounts 一致的间距 */
  font-size: 12px;  /* 调整字体大小 */
  color: #dc2626;
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

.input-error {
  border-color: #dc2626 !important;
}

/* 调整密码要求的位置 */
.password-requirements {
  background: #F9FAFB;
  border-radius: 6px;
  padding: 16px;
  margin-top: 0.5rem;  /* 稍微减小与上方表单的间距 */
  margin-bottom: 1rem;  /* 增加与下方按钮的间距 */
  grid-column: span 2;
}

.password-requirements p {
  color: #374151;
  font-size: 14px;
  margin-bottom: 12px;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  color: #6B7280;
  font-size: 14px;
  margin-bottom: 8px;
  padding-left: 24px;
  position: relative;
}

.password-requirements li::before {
  content: "•";
  position: absolute;
  left: 8px;
  color: #d44c4c;
}
</style>