<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// 路由
const router = useRouter()

</script>

<template>
  <div class="evaluations-container">
    <Header class="fixed-header" />
    
    <div class="evluations-content">
      <div class="page-header">
        <h2>我的评价</h2>
      </div>
    </div>
    </div>
</template>

<style scoped>
.evaluations-container {
  min-height: 100vh;
  background-color: #f9f9f9;
  width: 100%;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.evaluations-content {
  position: absolute;
  left: 0;
  right: 0;
  margin: 80px auto 30px;
  padding: 0 20px;
  max-width: 1200px;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
  position: relative;
  padding-left: 15px;
}

.page-header h2::before {
  content: "";
  position: absolute;
  left: 0;
  top: 5px;
  bottom: 5px;
  width: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  border-radius: 2px;
}
</style>
