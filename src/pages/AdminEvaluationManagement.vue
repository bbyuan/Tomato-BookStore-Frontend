<script setup lang="ts">
import AdminHeader from '@/views/AdminProductManagement/AdminHeader.vue';
import LeftSidebar from '@/views/AdminProductManagement/LeftSidebar.vue';
import AllEva from '@/views/AdminEvaluationManagement/AllEva.vue';
</script>

<template>
    <div class="management-container">
      <AdminHeader class="fixed-header" />
      <div class="management-content">
        <LeftSidebar class="left-sidebar" />
        <AllEva class="all-eva" />
      </div>
    </div>
  </template>

<style scoped>

.management-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  width: 100%;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 220px;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  
}

.management-content {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  margin-top: 100px;
  width: 100%;
  padding: 0 20px;
  max-width: 100%;
  gap: 6px;
  flex-wrap: wrap;
}

.left-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px; /* 左侧边栏宽度 */
  height: 100vh; /* 高度占满屏幕 */
  background-color: #fff;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
}

.all-eva {
  margin-left: 220px; /* 留出左侧边栏的空间 */
  top: 0;
  margin-top: 0;
}
</style>

