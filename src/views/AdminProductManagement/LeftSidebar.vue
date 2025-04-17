<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 定义菜单项数据，可根据需要修改/扩展
const menuItems = ref([
  { name: '商品管理', route: '/admin/product-management' },
  { name: '订单管理', route: '/admin/order-management' },
  { name:  '广告管理', route: '/admin/adver-management'},
  { name: '用户管理', route: '/admin/user-management' },
  { name: '数据统计', route: '/admin/stats' },
  { name: '系统设置', route: '/admin/settings' }
])

const router = useRouter()
const route = useRoute()

function navigateTo(route: string) {
  router.push(route)
}

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path)
</script>

<template>
  <div class="sidebar-container">
    <!-- Logo & 标题区域 -->
    <div class="sidebar-header">
      <img src="@/assets/logo.png" alt="番茄书城Logo" class="logo" />
      <h2 class="sidebar-title">管理员后台</h2>
    </div>

    <!-- 菜单列表 -->
    <ul class="menu-list">
      <li
        v-for="(item, index) in menuItems"
        :key="index"
        class="menu-item"
        :class="{ active: activeMenu === item.route }"
        @click="navigateTo(item.route)"
      >
        <span class="menu-text">{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sidebar-container {
  width: 100%;
  height: 100vh;
  background-color: #fff;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  box-sizing: border-box;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 8px;
}

.sidebar-title {
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  color: #555;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.menu-item:hover {
  background-color: #ffe8e8;
  color: #ff6b6b;
}

.menu-text {
  margin-left: 8px;
  color: inherit;
  white-space: nowrap;
}

.menu-item.router-link-active,
.menu-item.active {
  background-color: #ffeded;
  color: #ff6b6b;
  font-weight: 500;
}
</style>