<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import defaultAvatar from '@/assets/logo.png'

const router = useRouter()
const searchInput = ref('')
const isLoggedIn = ref(true)
const activeTab = ref('1')
const userAvatar = ref('')

const fetchUserAvatar = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (!token || !username) {
      console.error('未找到token或用户名')
      isLoggedIn.value = false
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

    if (data.code === '200') {
      userAvatar.value = data.data.avatar || defaultAvatar
      isLoggedIn.value = true
    } else {
      console.error('获取用户信息失败:', data.msg)
      isLoggedIn.value = false
    }
  } catch (error) {
    console.error('获取用户信息出错:', error)
    isLoggedIn.value = false
  }
}

onMounted(() => {
  fetchUserAvatar()
})

const handleCommand = (command: string) => {
  if (command === 'account-settings') {
    router.push('/account-settings');
  } else if (command === 'logout') {
    // 处理登出逻辑
  } else if (command === 'admin-dashboard') {
    router.push('/admin/product-management');
  } else if (command === 'homepage') {
    router.push('/homepage'); // 修复主页跳转路径
  }
};
</script>

<template>
  <el-header class="header">
    <div class="header-left">
      <div class="custom-tabs">
        <input type="radio" id="tab-1" name="tabs" value="1" v-model="activeTab"/>
        <label class="tab" for="tab-1" @click="handleCommand('homepage')">主页</label> <!-- 修复点击主页跳转 -->
        <input type="radio" id="tab-2" name="tabs" value="2" v-model="activeTab" />
        <label class="tab" for="tab-2">热门活动</label>
        <input type="radio" id="tab-3" name="tabs" value="3" v-model="activeTab" />
        <label class="tab" for="tab-3">购物车</label>
        <input type="radio" id="tab-4" name="tabs" value="4" v-model="activeTab" />
        <label class="tab" for="tab-4">我的订单</label>
        <input type="radio" id="tab-5" name="tabs" value="5" v-model="activeTab" />
        <label class="tab" for="tab-5">优惠券管理</label>
        <input type="radio" id="tab-6" name="tabs" value="6" v-model="activeTab" />
        <label class="tab" for="tab-6">客户服务</label>
        <input type="radio" id="tab-7" name="tabs" value="7" v-model="activeTab" />
        <label class="tab" for="tab-7">个人中心</label>
        <input type="radio" id="tab-8" name="tabs" value="8" v-model="activeTab" checked/>
        <label class="tab" for="tab-8" @click="handleCommand('admin-dashboard')">管理员后台</label>
        <span class="glider"></span>
      </div>
    </div>
    <div class="header-right">
      <div class="search-box">
        <el-input
          v-model="searchInput"
          placeholder="搜索..."
          :prefix-icon="Search"
          class="search-input"
        />
      </div>
      <el-button type="primary" class="register-btn">成为会员</el-button>
      <div class="avatar-container">
        <el-avatar
          size="medium"
          :src="userAvatar || defaultAvatar"
        />
        <div class="status-dot" :class="{ 'logged-in': isLoggedIn }"></div>
      </div>
    </div>
  </el-header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 0 20px;
  height: 60px;
  min-height: 40px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: nowrap;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 2;
  min-width: 0;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
  flex-shrink: 0;
}

.platform-name {
  font-size: 20px;
  font-weight: bold;
  margin-left: 10px;
  background: linear-gradient(135deg, #d44c4c 0%, #ff6b6b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.custom-tabs {
  display: flex;
  position: relative;
  background-color: #fff;
  box-shadow: 0 0 1px 0 rgba(212, 76, 76, 0.15), 0 6px 12px 0 rgba(212, 76, 76, 0.15);
  margin-left: 50px;
  padding: 5px;
  height: 40px;
  border-radius: 99px;
  width: 900px;
  overflow: hidden;
  flex-shrink: 1;
}

.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100px;
  font-size: 14px;
  white-space: nowrap;
  padding: 0;
  position: relative;
  z-index: 2;
  cursor: pointer;
  color: #666;
  transition: color 0.15s ease-in;
}

.glider {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  height: 30px;
  width: 100px;
  background: linear-gradient(135deg, #d44c4c 0%, #ff6b6b 100%);
  z-index: 1;
  border-radius: 99px;
  transition: 0.25s ease-out;
}

.custom-tabs input[type="radio"] {
  display: none;
}

.custom-tabs input[type="radio"]:checked + label {
  color: #fff;
  z-index: 3;
}

.custom-tabs input[id="tab-1"]:checked ~ .glider {
  transform: translateY(-50%) translateX(0);
}

.custom-tabs input[id="tab-2"]:checked ~ .glider {
  transform: translateY(-50%) translateX(100px);
}

.custom-tabs input[id="tab-3"]:checked ~ .glider {
  transform: translateY(-50%) translateX(200px);
}

.custom-tabs input[id="tab-4"]:checked ~ .glider {
  transform: translateY(-50%) translateX(300px);
}

.custom-tabs input[id="tab-5"]:checked ~ .glider {
  transform: translateY(-50%) translateX(400px);
}

.custom-tabs input[id="tab-6"]:checked ~ .glider {
  transform: translateY(-50%) translateX(500px);
}

.custom-tabs input[id="tab-7"]:checked ~ .glider {
  transform: translateY(-50%) translateX(600px);
}

.custom-tabs input[id="tab-8"]:checked ~ .glider {
  transform: translateY(-50%) translateX(700px);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
}

.search-box {
  margin-right: 10px;
  width: 250px;
}

.search-input {
  width: 100%;
}

:deep(.el-input__wrapper) {
  border-radius: 20px;
  background-color: #fff1f1;
  border: 1px solid #ffeded;
  box-shadow: 0 0 0 1px transparent inset;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #d44c4c inset !important;
  border-color: #d44c4c !important;
  background-color: #fff;
}

:deep(.el-input__wrapper:hover) {
  border-color: #ff6b6b;
  background-color: #fff;
}

.avatar-container {
  position: relative;
  margin-left: 10px;
}

.avatar-container :deep(.el-avatar) {
  width: 36px;
  height: 36px;
  min-width: 30px;
  min-height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

.status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  background-color: #ddd;
}

.status-dot.logged-in {
  background-color: #67C23A;
}

.register-btn, .login-btn {
  border-radius: 20px;
}

.register-btn {
  padding: 0 20px;
  height: 36px;
  font-size: 14px;
  background: linear-gradient(135deg, #d44c4c 0%, #ff6b6b 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-btn:hover {
  background: linear-gradient(135deg, #c43c3c 0%, #ff5b5b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 76, 76, 0.2);
}
</style>
