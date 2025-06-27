<template>
  <div class="security-settings">
    <h2>修改密码</h2>

    <form @submit.prevent="handleSubmit" class="password-form">


      <div class="form-row">
        <div class="form-group">
          <label>新密码</label>
          <div class="input-wrapper">
            <input v-model="passwordForm.newPassword" :type="showNewPassword ? 'text' : 'password'" placeholder="请输入新密码"
              :class="{ 'input-error': newPasswordError }">
            <button type="button" class="toggle-password" @click="showNewPassword = !showNewPassword">
              <span v-if="showNewPassword" class="eye-icon" aria-label="显示密码">
                <!-- 可见小眼睛 SVG -->
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <ellipse cx="10" cy="10" rx="7" ry="4" stroke="#333" stroke-width="1.5" fill="none"/>
                  <circle cx="10" cy="10" r="2" fill="#333"/>
                </svg>
              </span>
              <span v-else class="eye-icon" aria-label="隐藏密码">
                <!-- 隐藏小眼睛 SVG（带斜杠） -->
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <ellipse cx="10" cy="10" rx="7" ry="4" stroke="#333" stroke-width="1.5" fill="none"/>
                  <circle cx="10" cy="10" r="2" fill="#333"/>
                  <line x1="4" y1="16" x2="16" y2="4" stroke="#d44c4c" stroke-width="1.5"/>
                </svg>
              </span>
            </button>
          </div>
          <div v-if="newPasswordError" class="error-message">
            {{ newPasswordErrorMessage }}
          </div>
        </div>

        <div class="form-group">
          <label>确认新密码</label>
          <div class="input-wrapper">
            <input v-model="passwordForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入新密码" :class="{ 'input-error': confirmPasswordError }">
            <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
              <span v-if="showConfirmPassword" class="eye-icon" aria-label="显示密码">
                <!-- 可见小眼睛 SVG -->
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <ellipse cx="10" cy="10" rx="7" ry="4" stroke="#333" stroke-width="1.5" fill="none"/>
                  <circle cx="10" cy="10" r="2" fill="#333"/>
                </svg>
              </span>
              <span v-else class="eye-icon" aria-label="隐藏密码">
                <!-- 隐藏小眼睛 SVG（带斜杠） -->
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <ellipse cx="10" cy="10" rx="7" ry="4" stroke="#333" stroke-width="1.5" fill="none"/>
                  <circle cx="10" cy="10" r="2" fill="#333"/>
                  <line x1="4" y1="16" x2="16" y2="4" stroke="#d44c4c" stroke-width="1.5"/>
                </svg>
              </span>
            </button>
          </div>
          <div v-if="confirmPasswordError" class="error-message">
            {{ confirmPasswordErrorMessage }}
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
        <button type="submit" class="save-btn" :disabled="hasErrors">保存修改</button>
        <button type="button" class="reset-btn" @click="resetForm">重置</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

interface Errors {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const errors = ref<Errors>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const clearErrors = () => {
  setTimeout(() => {
    errors.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  }, 3000)
}

// 验证密码强度
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


const newPasswordError = computed(() => {
  if (passwordForm.value.newPassword === '') return false
  if (!passwordForm.value.newPassword) return true
  if (passwordForm.value.newPassword.length < 8) return true
  return !validatePassword(passwordForm.value.newPassword).isValid
})

const newPasswordErrorMessage = computed(() => {
  if (!passwordForm.value.newPassword && passwordForm.value.newPassword !== '')
    return '新密码不能为空'
  if (passwordForm.value.newPassword.length < 8)
    return '新密码长度必须至少为8个字符'
  const validation = validatePassword(passwordForm.value.newPassword)
  if (!validation.isValid) return validation.message
  return ''
})

const confirmPasswordError = computed(() => {
  if (passwordForm.value.confirmPassword === '') return false
  if (!passwordForm.value.confirmPassword) return true
  return passwordForm.value.newPassword !== passwordForm.value.confirmPassword
})

const confirmPasswordErrorMessage = computed(() => {
  if (!passwordForm.value.confirmPassword && passwordForm.value.confirmPassword !== '')
    return '请确认新密码'
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword)
    return '新密码与确认密码不匹配'
  return ''
})

const hasErrors = computed(() => {
  return newPasswordError.value ||
    confirmPasswordError.value ||
    !passwordForm.value.newPassword ||
    !passwordForm.value.confirmPassword
})

const handleSubmit = async () => {
  if (hasErrors.value) {
    return
  }

  try {
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (!token || !username) {
      console.error('未找到token或用户名')
      return
    }

    const requestData = {
      username: username,
      password: passwordForm.value.newPassword
    }

    console.log('发送的数据:', requestData)
    console.log('Token:', token)

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/accounts`, {
      method: 'PUT',
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    console.log('响应状态:', response.status)
    console.log('响应头:', Object.fromEntries(response.headers.entries()))

    const responseData = await response.json()
    console.log('响应数据:', responseData)

    if (responseData.code === '200') {
      errors.value.currentPassword = '密码修改成功'
      clearErrors()
      resetForm()
    } else {
      errors.value.currentPassword = responseData.msg || '密码修改失败'
      clearErrors()
    }
  } catch (error) {
    errors.value.currentPassword = '修改密码失败，请稍后重试'
    clearErrors()
    console.error('修改密码出错:', error instanceof Error ? error.message : String(error))
  }
}

const resetForm = () => {
  passwordForm.value = {
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

.error-message {
  color: #d44c4c;
  font-size: 12px;
  margin-top: 4px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-error {
  border-color: #dc2626 !important;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
