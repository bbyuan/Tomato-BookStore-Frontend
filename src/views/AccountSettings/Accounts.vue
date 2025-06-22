<template>
  <div class="account-details">
    <h2>个人信息</h2>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div class="avatar-section">
      <div class="avatar">
        <img :src="userInfo.avatar || defaultAvatar" alt="用户头像">
      </div>
      <div class="avatar-actions">
        <button class="upload-btn" @click="handleUploadClick">上传新头像</button>
        <button class="reset-btn" @click="handleReset">重置</button>
        <div class="upload-hint">支持 JPG, GIF 或 PNG, 文件大小 800K 以内</div>
        <input type="file" ref="fileInput" style="display: none" accept="image/*" @change="handleFileChange">
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="form-grid">
      <div class="form-group">
        <label>用户名<span class="required">*</span></label>
        <input v-model="userInfo.userName" type="text" placeholder="请输入用户名" :class="{ 'input-error': userNameError }">
        <div v-if="userNameError" class="error-message">
          用户名不能为空
        </div>
      </div>

      <div class="form-group">
        <label>姓名<span class="required">*</span></label>
        <input v-model="userInfo.realName" type="text" placeholder="请输入姓名" :class="{ 'input-error': realNameError }">
        <div v-if="realNameError" class="error-message">
          姓名不能为空
        </div>
      </div>

      <div class="form-group">
        <label>邮箱<span class="required">*</span></label>
        <input v-model="userInfo.email" type="email" placeholder="请输入邮箱" :class="{ 'input-error': emailError }">
        <div v-if="emailError" class="error-message">
          {{ emailErrorMessage }}
        </div>
      </div>

      <div class="form-group">
        <label>手机号码<span class="required">*</span></label>
        <input v-model="userInfo.phoneNumber" type="text" placeholder="请输入手机号码"
          :class="{ 'input-error': phoneNumberError }">
        <div v-if="phoneNumberError" class="error-message">
          {{ phoneNumberErrorMessage }}
        </div>
      </div>

      <div class="form-group">
        <label>角色</label>
        <input v-model="userInfo.role" type="text" readonly class="readonly-input">
      </div>

      <div class="form-group">
        <label>地址<span class="required">*</span></label>
        <input v-model="userInfo.address" type="text" placeholder="请输入地址" :class="{ 'input-error': addressError }">
        <div v-if="addressError" class="error-message">
          地址不能为空
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="save-btn" :disabled="hasErrors">保存更改</button>
        <button type="button" class="reset-btn" @click="resetForm">重置</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import defaultAvatar from '@/assets/logo.png'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

const fileInput = ref<HTMLInputElement | null>(null)

interface UserInfo {
  avatar: string
  avatar_name: string
  userName: string
  realName: string
  email: string
  phoneNumber: string
  role: string
  address: string
}

const userInfo = ref<UserInfo>({
  avatar: '',
  avatar_name: '',
  userName: '',
  realName: '',
  email: '',
  phoneNumber: '',
  role: '',
  address: ''
})

const errorMessage = ref('')

interface Errors {
  userName: string
  realName: string
  email: string
  phoneNumber: string
  address: string
}

const errors = ref<Errors>({
  userName: '',
  realName: '',
  email: '',
  phoneNumber: '',
  address: ''
})

const fetchUserInfo = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (!token || !username) {
      console.error('未找到token或用户名')
      return
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/accounts/${username}`, {
      method: 'GET',
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log(data.data)

    if (data.code === '200') {
      userInfo.value = {
        avatar: data.data.avatar,
        avatar_name: data.data.avatar_name,
        userName: data.data.username,
        realName: data.data.name,
        email: data.data.email,
        phoneNumber: data.data.telephone,
        role: translateRole(data.data.role),
        address: data.data.location
      }
    } else {
      console.error('获取用户信息失败:', data.msg)
    }
  } catch (error) {
    console.error('获取用户信息出错:', error)
  }
}

const translateRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'customer': '顾客',
    'publisher': '出版商',
    'admin': '管理员'
  }
  return roleMap[role] || role
}

onMounted(() => {
  fetchUserInfo()
})

const handleUploadClick = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
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

      const data = await response.data
      console.log('上传响应:', data)

      if (data.code === '200') {
        // 更新用户信息中的头像
        userInfo.value = {
          ...userInfo.value,
          avatar_name: randomFileName,  // 保存文件名
          avatar: data.data  // 使用返回的临时URL进行预览
        }
        console.log('更新后的用户信息:', userInfo.value)
        handleSubmit()
      } else {
        throw new Error(data.msg || '上传失败')
      }
    } catch (error) {
      console.error('上传失败:', error)
      alert(error instanceof Error ? error.message : '头像上传失败，请重试')
    }
  }
}

const handleReset = async () => {
  await fetchUserInfo()
}

const clearError = () => {
  setTimeout(() => {
    errorMessage.value = ''
  }, 3000)
}

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

const clearErrors = () => {
  setTimeout(() => {
    errors.value = {
      userName: '',
      realName: '',
      email: '',
      phoneNumber: '',
      address: ''
    }
  }, 3000)
}

// 验证规则
const userNameError = computed(() => {
  return userInfo.value.userName !== '' && !userInfo.value.userName
})

const realNameError = computed(() => {
  return userInfo.value.realName !== '' && !userInfo.value.realName
})

const emailError = computed(() => {
  if (userInfo.value.email === '') return false
  if (!userInfo.value.email) return true
  return !validateEmail(userInfo.value.email)
})

const emailErrorMessage = computed(() => {
  if (!userInfo.value.email && userInfo.value.email !== '') return '邮箱不能为空'
  if (!validateEmail(userInfo.value.email)) return '请输入正确的邮箱格式'
  return ''
})

const phoneNumberError = computed(() => {
  if (userInfo.value.phoneNumber === '') return false
  if (!userInfo.value.phoneNumber) return true
  return !validatePhone(userInfo.value.phoneNumber)
})

const phoneNumberErrorMessage = computed(() => {
  if (!userInfo.value.phoneNumber && userInfo.value.phoneNumber !== '') return '手机号码不能为空'
  if (!validatePhone(userInfo.value.phoneNumber)) return '请输入正确的11位手机号格式'
  return ''
})

const addressError = computed(() => {
  return userInfo.value.address !== '' && !userInfo.value.address
})

const hasErrors = computed(() => {
  return userNameError.value ||
    realNameError.value ||
    emailError.value ||
    phoneNumberError.value ||
    addressError.value ||
    !userInfo.value.userName ||
    !userInfo.value.realName ||
    !userInfo.value.email ||
    !userInfo.value.phoneNumber ||
    !userInfo.value.address
})

const handleSubmit = async () => {
  try {
    if (hasErrors.value) {
      return
    }

    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (!token || !username) {
      console.error('未找到token或用户名')
      return
    }

    // 转换角色
    let role = 'customer'
    if (userInfo.value.role === '顾客') {
      role = 'customer'
    } else if (userInfo.value.role === '出版商') {
      role = 'publisher'
    } else if (userInfo.value.role === '管理员') {
      role = 'admin'
    }

    // 构建请求数据
    const requestData = {
      username: userInfo.value.userName,
      name: userInfo.value.realName,
      role: role,
      telephone: userInfo.value.phoneNumber,
      email: userInfo.value.email,
      location: userInfo.value.address,
      avatar_name: userInfo.value.avatar_name  // 确保包含 avatar_name
    }

    console.log('发送的更新数据:', requestData)

    // 发送更新请求
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/accounts`, {
      method: 'PUT',
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })

    const responseData = await response.json()
    console.log('更新响应:', responseData)

    if (responseData.code === '200') {
      alert('更新成功')
      // 如果用户名改变了，更新 sessionStorage
      if (userInfo.value.userName !== username) {
        sessionStorage.setItem('username', userInfo.value.userName)
      }
      // 重新获取用户信息以刷新显示
      await fetchUserInfo()
    } else {
      throw new Error(responseData.msg || '更新失败')
    }
  } catch (error) {
    console.error('更新失败:', error)
    alert(error instanceof Error ? error.message : '更新失败，请稍后重试')
  }
}

const resetForm = async () => {
  await fetchUserInfo()
}
</script>

<style scoped>
.account-details {
  margin: 0 auto;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

h2 {
  margin-bottom: 15px;
  color: #333;
}

.avatar-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 20px;
  padding: 24px 0;
}

.avatar {
  width: 144px;
  height: 144px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f2f5;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.avatar-actions button {
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  border-radius: 6px;
}

.upload-btn {
  background: #d44c4c;
  color: white;
}

.reset-btn {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.upload-hint {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-weight: 500;
  color: #606266;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s;
  height: 50px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #d44c4c;
}

.readonly-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-actions {
  grid-column: span 2;
  display: flex;
  gap: 12px;
  margin-top: 15px;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.save-btn {
  background: #d44c4c;
  color: white;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background: #d44c4c;
}

.error-message {
  color: #d44c4c;
  font-size: 12px;
  margin-top: 4px;
  animation: fadeIn 0.3s ease;
}

.required {
  color: #d44c4c;
  margin-left: 4px;
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

.error-message {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

</style>
