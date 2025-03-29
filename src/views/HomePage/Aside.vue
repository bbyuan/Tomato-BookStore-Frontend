<script setup lang="ts">
const menuItems = [
  { id: 1, name: 'ΠOΠO', icon: 'user', logo: '@/assets/menu-logo1.png' },
  { id: 2, name: 'DXOXO星', icon: 'star', logo: '@/assets/menu-logo2.png' },
  { id: 3, name: '数码科技', icon: 'mobile', logo: '@/assets/menu-logo3.png' },
  { id: 4, name: 'KOUSIOU', icon: 'fire', logo: '@/assets/menu-logo4.png' },
  { id: 5, name: 'Transeat Chinese', icon: 'globe', logo: '@/assets/menu-logo5.png' },
  { id: 6, name: 'FG自习室', icon: 'book', logo: '@/assets/menu-logo6.png' },
  { id: 7, name: 'SMT990元', icon: 'coin', logo: '@/assets/menu-logo7.png' },
]
</script>

<template>
  <div class="aside-menu">
    <div v-for="item in menuItems" :key="item.id" class="menu-item">
      <div class="menu-logo">
        <el-avatar :size="40" :src="item.logo" />
      </div>
      <span class="menu-name">{{ item.name }}</span>
    </div>
  </div>
</template>

<style scoped>
.aside-menu {
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  width: 200px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-logo {
  margin-right: 12px;
}

.menu-name {
  font-size: 14px;
  color: #333;
}
</style>
