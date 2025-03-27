<template>
  <div class="page-container">
    <div class="register-container">
      <h2>基本信息</h2>
      
      <!-- 步骤指示器 -->
      <div class="steps">
        <div class="step" :class="{ active: currentStep === 1 }">
          <div class="step-number">01</div>
          <div class="step-content">
            <h3>账户信息</h3>
            <p>设置账户信息</p>
          </div>
        </div>
        <div class="step" :class="{ active: currentStep === 2 }">
          <div class="step-number">02</div>
          <div class="step-content">
            <h3>个人信息</h3>
            <p>设置个人信息</p>
          </div>
        </div>
        <div class="step" :class="{ active: currentStep === 3 }">
          <div class="step-number">03</div>
          <div class="step-content">
            <h3>扩展信息</h3>
            <p>添加扩展信息</p>
          </div>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="form-content">
        <!-- 第一步：账户信息 -->
        <div v-if="currentStep === 1" class="form-step">
          <h3>账户信息</h3>
          <p>输入你的账户信息 <span class="required">*</span></p>
          
          <div class="form-grid">
            <div class="form-field">
              <input type="text" v-model="form.username" id="username" class="input-field">
              <label for="username" :class="{ 'label-float': form.username }">用户名</label>
            </div>
            <div class="form-field">
              <select v-model="form.country" id="country" class="input-field">
                <option value="" disabled selected></option>
                <option value="manager">管理员</option>
                <option value="customer">顾客</option>
                <option value="supplier">出版社</option>
              </select>
              <label for="country" :class="{ 'label-float': form.country }">角色</label>
            </div>
            <div class="form-field">
              <input 
                type="password" 
                v-model="form.password" 
                id="password" 
                class="input-field"
                :class="{ 'input-error': passwordError }"
              >
              <label for="password" :class="{ 'label-float': form.password }">密码</label>
            </div>
            <div class="form-field">
              <input 
                type="password" 
                v-model="form.confirmPassword" 
                id="confirmPassword" 
                class="input-field"
                :class="{ 'input-error': passwordError }"
              >
              <label for="confirmPassword" :class="{ 'label-float': form.confirmPassword }">确认密码</label>
              <span class="error-message" v-if="passwordError">密码不匹配</span>
            </div>
          </div>
        </div>

        <!-- 第二步：个人信息 -->
        <div v-if="currentStep === 2" class="form-step">
          <h3>个人信息</h3>
          <p>设置个人信息 <span class="required">*</span></p>
          
          <div class="form-grid">
            <div class="form-field">
              <input type="text" v-model="form.firstName" id="firstName" class="input-field">
              <label for="firstName" :class="{ 'label-float': form.firstName }">名字</label>
            </div>
            <div class="form-field">
              <input type="text" v-model="form.lastName" id="lastName" class="input-field">
              <label for="lastName" :class="{ 'label-float': form.lastName }">姓氏</label>
            </div>
            <div class="form-field">
              <select v-model="form.country" id="country" class="input-field">
                <option value="" disabled selected></option>
                <option value="china">中国</option>
                <option value="usa">美国</option>
                <option value="uk">英国</option>
              </select>
              <label for="country" :class="{ 'label-float': form.country }">国家</label>
            </div>
          </div>
        </div>

        <!-- 第三步：社交链接 -->
        <div v-if="currentStep === 3" class="form-step">
          <h3>社交链接</h3>
          <p>添加你的社交链接 (可选)</p>
          
          <div class="form-grid">
            <div class="form-field">
              <input type="text" v-model="form.qq" id="qq" class="input-field">
              <label for="qq" :class="{ 'label-float': form.qq }">QQ</label>
            </div>
            <div class="form-field">
              <input type="text" v-model="form.wechat" id="wechat" class="input-field">
              <label for="wechat" :class="{ 'label-float': form.wechat }">微信</label>
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
          >
            {{ currentStep === 3 ? '提交 ✓' : '下一步 →' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const currentStep = ref(1)
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  country: '',
  language: '',
  qq: '',
  wechat: ''
})

// 添加表单验证
const isStep1Valid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return form.username.trim() !== '' && 
         form.role !== '' && 
         form.password.length >= 6 && 
         form.password === form.confirmPassword
})

const isStep2Valid = computed(() => {
  return form.firstName.trim() !== '' && 
         form.lastName.trim() !== '' && 
         form.country !== '' && 
         form.language !== '' &&
         emailRegex.test(form.email) 
})

// 添加密码匹配检查
const passwordError = computed(() => {
  return form.password && form.confirmPassword && 
         form.password !== form.confirmPassword
})

const nextStep = () => {
  if (currentStep.value === 1 && !isStep1Valid.value) {
    alert('Please fill in all required fields in step 1:\n' +
          '- Username is required\n' +
          '- Valid email is required\n' +
          '- Password must be at least 6 characters\n' +
          '- Passwords must match')
    return
  }
  
  if (currentStep.value === 2 && !isStep2Valid.value) {
    alert('Please fill in all required fields in step 2:\n' +
          '- First Name is required\n' +
          '- Last Name is required\n' +
          '- Country is required\n' +
          '- Language is required')
    return
  }

  if (currentStep.value < 3) {
    currentStep.value++
  } else {
    // 提交表单
    console.log('Form submitted:', form)
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  padding: 2rem 0;  /* 添加上下内边距 */
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;  /* 添加滚动条 */
}

.register-container {
  width: 100%;
  max-width: 800px;
  margin: 0 2rem;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  max-height: fit-content;  /* 让容器高度适应内容 */
}

.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;  /* 减小步骤指示器的下边距 */
  padding: 0.5rem 0;  /* 减小内边距 */
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0.5;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #7c3aed;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step-content h3 {
  margin: 0;
  font-size: 1.1rem;
}

.step-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.form-content {
  /* 保持原有样式 */
}

.form-field {
  position: relative;
  margin-bottom: 1rem;  /* 减小表单字段之间的间距 */
}

.input-field {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;
  appearance: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #7c3aed;
}

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
}

.form-field .input-field:focus + label,
.form-field .label-float {
  top: 0;
  font-size: 0.85rem;
  color: #7c3aed;
}

.form-field .input-field:focus {
  border-color: #7c3aed;
}

select.input-field {
  padding-right: 2.5rem;
}

.form-field select.input-field + label {
  background: white;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;  /* 减小表单项之间的间距 */
  margin-top: 1rem;  /* 减小上边距 */
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn-previous,
.btn-next {
  padding: 0.8rem 2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-previous {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-next {
  background: #7c3aed;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

/* 添加提交按钮的绿色样式 */
.btn-submit {
  background: #22c55e !important; /* 使用绿色 */
}

.btn-submit:hover {
  background: #16a34a !important; /* 深绿色悬停效果 */
}

.btn-next:disabled {
  background: #9ca3af !important; /* 确保禁用状态覆盖所有按钮 */
  cursor: not-allowed;
}

.btn-previous:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 添加必填标记样式 */
.required {
  color: #dc2626;
  margin-left: 4px;
}

/* 添加输入验证样式 */
.input-field:invalid {
  border-color: #dc2626;
}

.input-error {
  border-color: #dc2626 !important;
}

.error-message {
  position: absolute;
  left: 0;
  bottom: -20px;
  font-size: 0.8rem;
  color: #dc2626;
}
</style>