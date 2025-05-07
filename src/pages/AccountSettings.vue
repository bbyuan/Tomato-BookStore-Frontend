<template>
<div class="account-settings-page">
  <div class="nav-tabs">
    <router-link 
      to="/account-settings/account" 
      class="tab" 
      :class="{ active: currentTab === 'account' }"
    >
      <i class="fas fa-user"></i> 个人信息
    </router-link>
    <router-link 
      to="/account-settings/security" 
      class="tab" 
      :class="{ active: currentTab === 'security' }"
    >
      <i class="fas fa-lock"></i> 修改密码
    </router-link>
    
    <div class="spacer"></div>
    
    <button class="home-button" @click="goToHomepage">
      <i class="fas fa-home"></i> 返回主页
    </button>
  </div>
  <div class="account-settings">
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const currentTab = computed(() => route.path.split('/').pop())

const goToHomepage = () => {
  router.push('/homepage')
}
</script>

<style scoped>
.account-settings-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  background-image: url('@/assets/images/login_background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-top: 2rem;
}

.nav-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  width: 80rem;
  margin: 0 auto;
  padding: 0 20px;
  align-items: center;
}

.tab {
  text-decoration: none;
  color: #666;
  padding: 12px 24px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.tab:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
}

.tab.active {
  color: white;
  background-color: #d44c4c;
  font-size: 1rem;
  transform: translateY(-2px);
}

.spacer {
  flex-grow: 1;
}

.home-button {
  background-color: #d44c4c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.home-button:hover {
  background-color: #c43c3c;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.account-settings {
  height: calc(90vh - 80px); /* 减去导航的高度 */
  width: 80rem;
  margin: 1rem auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.content {
  background: white;
  border-radius: 4px;
  padding: 20px;
  height: 100%;
  overflow: hidden;
}
</style>
