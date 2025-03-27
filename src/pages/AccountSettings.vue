<template>
  <div class="account-settings">
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
    </div>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentTab = computed(() => route.path.split('/').pop())
</script>

<style scoped>
.account-settings {
  height: 55rem;
  width: 80rem;
  margin: 0 auto;
  padding: 20px;
}

.nav-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.tab {
  text-decoration: none;
  color: #666;
  padding: 8px 16px;
  border-radius: 4px;
}

.tab:hover {
  background-color: #f5f5f5;
}

.tab.active {
  color: white;
  background-color: #d44c4c;
  font-size: 1rem;
}

.content {
  background: white;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
