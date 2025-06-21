<script setup lang="ts">
import { RouterView } from 'vue-router'
import AiChatFloat from './components/AiChatFloat.vue'
</script>

<template>
  <RouterView />
  <!-- 全局AI聊天浮窗 - 只应该有这一个 -->
  <AiChatFloat />
</template>

<style scoped>
</style>
