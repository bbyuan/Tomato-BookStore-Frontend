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
    router.push('/account-settings/account');
    activeTab.value = '5'
  } else if (command === 'logout') {
    // 处理登出逻辑
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')
    router.push('/login')
  } else if (command === 'admin-dashboard') {
    router.push('/admin/product-management');
    activeTab.value = '6'
  } else if (command === 'homepage') {
    router.push('/homepage'); 
    activeTab.value = '1'
  } else if (command === 'cart') {
    router.push('/cart');
    activeTab.value = '2'
  } else if (command === 'myorders') {
    router.push('/myorders');
    activeTab.value = '3'
  } else if (command === 'my-evaluation') {
    router.push('/myevaluation');
    activeTab.value = '4'
  } else if (command === 'personal-center') {
    router.push('/account-settings/account')
    activeTab.value = '5'
  }
};
</script>

<template>
  <el-header class="header">
    <div class="header-left">
      <!-- Logo区域 -->
      <div class="logo-section">
        <img src="@/assets/logo.png" alt="Logo" class="logo-img">
        <div class="brand-info">
          <span class="brand-name">番茄书城</span>
          <span class="brand-subtitle">管理后台</span>
        </div>
      </div>
      
      <!-- 导航标签 -->
      <div class="custom-tabs">
        <input type="radio" id="tab-1" name="tabs" value="1" v-model="activeTab"/>
        <label class="tab" for="tab-1" @click="handleCommand('homepage')">
          <i class="tab-icon">🏠</i>
          <span>主页</span>
        </label>
        <input type="radio" id="tab-2" name="tabs" value="2" v-model="activeTab" />
        <label class="tab" for="tab-2" @click="handleCommand('cart')">
          <i class="tab-icon">🛒</i>
          <span>购物车</span>
        </label>
        <input type="radio" id="tab-3" name="tabs" value="3" v-model="activeTab" />
        <label class="tab" for="tab-3" @click="handleCommand('myorders')">
          <i class="tab-icon">📋</i>
          <span>订单</span>
        </label>
        <input type="radio" id="tab-4" name="tabs" value="4" v-model="activeTab" />
        <label class="tab" for="tab-4" @click="handleCommand('my-evaluation')">
          <i class="tab-icon">⭐</i>
          <span>评价</span>
        </label>
        <input type="radio" id="tab-5" name="tabs" value="5" v-model="activeTab" />
        <label class="tab" for="tab-5" @click="handleCommand('personal-center')">
          <i class="tab-icon">👤</i>
          <span>个人</span>
        </label>
        <input type="radio" id="tab-6" name="tabs" value="6" v-model="activeTab" checked/>
        <label class="tab" for="tab-6" @click="handleCommand('admin-dashboard')">
          <i class="tab-icon">⚙️</i>
          <span>后台</span>
        </label>
        <span class="glider"></span>
      </div>
    </div>
    
    <div class="header-right">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchInput"
          placeholder="搜索内容..."
          :prefix-icon="Search"
          class="search-input"
          clearable
        />
      </div>
      
      <!-- 用户信息区域 -->
      <el-dropdown @command="handleCommand" class="user-dropdown">
        <div class="avatar-container">
          <el-avatar
            :size="38"
            :src="userAvatar || defaultAvatar"
            class="user-avatar"
          />
          <div class="status-indicator" :class="{ 'online': isLoggedIn }"></div>
          <div class="user-info">
            <span class="username">管理员</span>
            <i class="dropdown-arrow">▼</i>
          </div>
        </div>
        
        <template #dropdown>
          <el-dropdown-menu class="custom-dropdown">
            <el-dropdown-item command="account-settings" class="dropdown-item">
              <i class="item-icon">⚙️</i>
              <span>账户设置</span>
            </el-dropdown-item>
            <el-dropdown-item command="logout" class="dropdown-item logout">
              <i class="item-icon">🚪</i>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  padding: 0 24px;
  height: 70px;
  min-height: 70px;
  border-bottom: 1px solid rgba(228, 57, 60, 0.08);
  flex-wrap: nowrap;
  box-shadow: 
    0 2px 20px rgba(0, 0, 0, 0.04),
    0 1px 4px rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(10px);
  position: relative;
}

.header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #e4393c 0%, #ff6b6b 50%, #e4393c 100%);
  opacity: 0.6;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 2;
  min-width: 0;
  gap: 32px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(228, 57, 60, 0.05) 0%, rgba(255, 107, 107, 0.03) 100%);
  border-radius: 16px;
  border: 1px solid rgba(228, 57, 60, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-section:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(228, 57, 60, 0.1);
  border-color: rgba(228, 57, 60, 0.15);
}

.logo-img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.brand-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  font-size: 11px;
  color: rgba(228, 57, 60, 0.7);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.custom-tabs {
  display: flex;
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 20px rgba(228, 57, 60, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  padding: 6px;
  height: 48px;
  border-radius: 24px;
  border: 1px solid rgba(228, 57, 60, 0.1);
  min-width: 500px;
  overflow: hidden;
  flex-shrink: 1;
  transition: all 0.3s ease;
}

.custom-tabs:hover {
  box-shadow: 
    0 6px 30px rgba(228, 57, 60, 0.12),
    0 3px 12px rgba(0, 0, 0, 0.06);
}

.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 100%;
  width: 100px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  padding: 0 8px;
  position: relative;
  z-index: 2;
  cursor: pointer;
  color: rgba(102, 102, 102, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 18px;
  user-select: none;
}

.tab-icon {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.tab:hover {
  color: #e4393c;
  background: rgba(228, 57, 60, 0.04);
}

.tab:hover .tab-icon {
  transform: scale(1.1);
}

.glider {
  position: absolute;
  top: 50%;
  left: 6px;
  transform: translateY(-50%);
  height: 36px;
  width: 100px;
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  z-index: 1;
  border-radius: 18px;
  transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 12px rgba(228, 57, 60, 0.25),
    0 2px 6px rgba(228, 57, 60, 0.15);
}

.custom-tabs input[type="radio"] {
  display: none;
}

.custom-tabs input[type="radio"]:checked + label {
  color: #ffffff;
  z-index: 3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
}

.search-box {
  width: 280px;
  position: relative;
}

.search-input {
  width: 100%;
}

:deep(.el-input__wrapper) {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(228, 57, 60, 0.1);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  height: 42px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 
    0 4px 20px rgba(228, 57, 60, 0.15),
    0 2px 8px rgba(228, 57, 60, 0.08) !important;
  border-color: #e4393c !important;
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(228, 57, 60, 0.2);
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

:deep(.el-input__inner) {
  font-size: 14px;
  color: #333;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(102, 102, 102, 0.6);
}

.member-btn {
  border-radius: 22px;
  padding: 0 20px;
  height: 44px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 12px rgba(228, 57, 60, 0.25),
    0 2px 6px rgba(228, 57, 60, 0.15);
  position: relative;
  overflow: hidden;
}

.member-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.member-btn:hover::before {
  left: 100%;
}

.member-btn:hover {
  background: linear-gradient(135deg, #d63031 0%, #ff5757 100%);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(228, 57, 60, 0.3),
    0 4px 12px rgba(228, 57, 60, 0.2);
}

.member-btn .btn-icon {
  margin-right: 6px;
  font-size: 16px;
}

.user-dropdown {
  position: relative;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 22px;
  border: 1px solid rgba(228, 57, 60, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.avatar-container:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(228, 57, 60, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(228, 57, 60, 0.1);
}

.user-avatar {
  position: relative;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.status-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  background-color: #ddd;
  transition: all 0.3s ease;
}

.status-indicator.online {
  background-color: #00d084;
  box-shadow: 0 0 8px rgba(0, 208, 132, 0.4);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
  color: rgba(102, 102, 102, 0.6);
  transition: transform 0.3s ease;
}

.avatar-container:hover .dropdown-arrow {
  transform: rotate(180deg);
  color: #e4393c;
}

:deep(.custom-dropdown) {
  border-radius: 12px;
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(228, 57, 60, 0.08);
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  padding: 8px;
}

:deep(.dropdown-item) {
  border-radius: 8px;
  padding: 12px 16px;
  margin: 2px 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

:deep(.dropdown-item:hover) {
  background: rgba(228, 57, 60, 0.06);
  color: #e4393c;
}

:deep(.dropdown-item.logout:hover) {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.item-icon {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .custom-tabs {
    min-width: 600px;
  }
  
  .tab {
    width: 100px;
    font-size: 12px;
  }
  
  .glider {
    width: 100px;
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
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
    height: 60px;
    min-height: 60px;
  }
  
  .header-left {
    gap: 16px;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .custom-tabs {
    min-width: 300px;
  }
  
  .search-box {
    width: 200px;
  }
  
  .username {
    display: none;
  }
}
</style>
