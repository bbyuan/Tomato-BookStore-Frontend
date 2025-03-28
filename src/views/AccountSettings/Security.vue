<template>
  <div class="security-settings">
    <h2>修改密码</h2>
    
    <form @submit.prevent="handleSubmit" class="password-form">
      <div class="form-row">
        <div class="form-group">
          <label>当前密码</label>
          <div class="input-wrapper">
            <input 
              v-model="passwordForm.currentPassword" 
              :type="showCurrentPassword ? 'text' : 'password'" 
              placeholder="请输入当前密码"
            >
            <button type="button" class="toggle-password" @click="showCurrentPassword = !showCurrentPassword">
              <img 
                :src="showCurrentPassword ? '/src/assets/images/眼睛_隐藏.svg' : '/src/assets/images/眼睛_显示.svg'"
                alt="toggle password visibility"
                class="eye-icon"
              >
            </button>
          </div>
        </div>
        <div class="form-group">
          <!-- 空的form-group用于占位，保持布局一致 -->
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>新密码</label>
          <div class="input-wrapper">
            <input 
              v-model="passwordForm.newPassword" 
              :type="showNewPassword ? 'text' : 'password'" 
              placeholder="请输入新密码"
            >
            <button type="button" class="toggle-password" @click="showNewPassword = !showNewPassword">
              <img 
                :src="showNewPassword ? '/src/assets/images/眼睛_隐藏.svg' : '/src/assets/images/眼睛_显示.svg'"
                alt="toggle password visibility"
                class="eye-icon"
              >
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>确认新密码</label>
          <div class="input-wrapper">
            <input 
              v-model="passwordForm.confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="请再次输入新密码"
            >
            <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
              <img 
                :src="showConfirmPassword ? '/src/assets/images/眼睛_隐藏.svg' : '/src/assets/images/眼睛_显示.svg'"
                alt="toggle password visibility"
                class="eye-icon"
              >
            </button>
          </div>
        </div>
      </div>

      <div class="password-requirements">
        <p>密码要求：</p>
        <ul>
          <li>密码长度：确保密码至少包含8个字符</li>
          <li>字符种类：使用大小写字母、数字和特殊字符的组合</li>
        </ul>
      </div>

      <div class="form-actions">
        <button type="submit" class="save-btn">保存修改</button>
        <button type="button" class="reset-btn" @click="resetForm">重置</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import eyeIcon from '@/assets/images/眼睛_显示.svg'
import eyeOffIcon from '@/assets/images/眼睛_隐藏.svg'

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const handleSubmit = () => {
  // 验证密码
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('新密码与确认密码不匹配')
    return
  }

  // 这里添加更改密码的逻辑
  console.log('更改密码:', passwordForm.value)
}

const resetForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}
</script>

<style scoped>
.security-settings {
  margin: 0;
  padding: 0;
}

h2 {
  margin-bottom: 32px;
  color: #111827;
  font-size: 20px;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #374151;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  height: 50px;
  font-size: 1rem;
  color: #374151;
}

.form-group input:focus {
  outline: none;
  border-color: #d44c4c;
  box-shadow: 0 0 0 1px #d44c4c;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye-icon {
  width: 20px;
  height: 20px;
  opacity: 0.5;
}

.toggle-password:hover .eye-icon {
  opacity: 0.8;
}

.password-requirements {
  background: #F9FAFB;
  border-radius: 6px;
  padding: 16px;
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

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

button {
  height: 40px;
  padding: 0 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.save-btn {
  background: #d44c4c;
  color: white;
  border: none;
  font-size: 1rem;
}

.reset-btn {
  background: white;
  color: #374151;
  border: 1px solid #D1D5DB;
  font-size: 1rem;
}

.save-btn:hover {
  opacity: 0.9;
}

.reset-btn:hover {
  background: #F9FAFB;
}
</style>
