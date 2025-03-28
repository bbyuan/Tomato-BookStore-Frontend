<template>
  <div class="account-details">
    <h2>个人信息</h2>
    
    <div class="avatar-section">
      <div class="avatar">
        <img :src="userInfo.avatar || defaultAvatar" alt="用户头像">
      </div>
      <div class="avatar-actions">
        <button class="upload-btn" @click="handleUploadClick">上传新头像</button>
        <button class="reset-btn" @click="handleReset">重置</button>
        <div class="upload-hint">支持 JPG, GIF 或 PNG, 文件大小 800K 以内</div>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          accept="image/*"
          @change="handleFileChange"
        >
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="form-grid">
      <div class="form-group">
        <label>用户名</label>
        <input v-model="userInfo.userName" type="text" placeholder="请输入用户名">
      </div>

      <div class="form-group">
        <label>姓名</label>
        <input v-model="userInfo.realName" type="text" placeholder="请输入姓名">
      </div>

      <div class="form-group">
        <label>邮箱</label>
        <input v-model="userInfo.email" type="email" placeholder="请输入邮箱">
      </div>

      <div class="form-group">
        <label>手机号码</label>
        <input v-model="userInfo.phoneNumber" type="text" placeholder="请输入手机号码">
      </div>

      <div class="form-group">
        <label>角色</label>
        <input v-model="userInfo.role" type="text" readonly class="readonly-input">
      </div>

      <div class="form-group">
        <label>地址</label>
        <input v-model="userInfo.address" type="text" placeholder="请输入地址">
      </div>

      <div class="form-actions">
        <button type="submit" class="save-btn">保存更改</button>
        <button type="button" class="reset-btn" @click="resetForm">重置</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import defaultAvatar from '@/assets/logo.png'

const fileInput = ref<HTMLInputElement | null>(null)

const userInfo = ref({
  avatar: '',
  userName: '潜心一志@ok爸',
  realName: '刘钦',
  email: 'liuqin@nju.edu.cn',
  phoneNumber: '13812345678',
  role: '管理员',
  address: '南京市鼓楼区汉口路22号'
})

const handleUploadClick = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      userInfo.value.avatar = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleReset = () => {
  userInfo.value.avatar = ''
}

const handleSubmit = () => {
  // 这里添加保存用户信息的逻辑
  console.log('保存用户信息:', userInfo.value)
}

const resetForm = () => {
  // 重置表单数据
  userInfo.value = {
    avatar: '',
    userName: '潜心一志@ok爸',
    realName: '刘钦',
    email: 'liuqin@nju.edu.cn',
    phoneNumber: '13812345678',
    role: '管理员',
    address: '南京市鼓楼区汉口路22号'
  }
}
</script>

<style scoped>
.account-details {
  margin: 0 auto;
}

h2 {
  margin-bottom: 24px;
  color: #333;
}

.avatar-section {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;
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
  gap: 8px;
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
  margin-top: 20px;
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
</style>
