<script setup lang="ts">


</script>

<template>
  <div class="all-coupons-container">
    <div class="all-coupons-header">
      <h2>优惠券管理</h2>
      <button class="add-coupon-btn" @click="openAddCouponModal">
        <i class="plus-icon">+</i> 新增优惠券
      </button>
    </div>

    <!-- 添加加载状态显示 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载广告数据...</p>
    </div>
    
    <!-- 添加错误状态显示 -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchAdverts" class="retry-btn">重试</button>
    </div>
  </div>
</template>

<style scoped>
.all-coupons-container {
  background: #ffffff;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
  margin: 30px 0;
  padding: 0 25px 25px;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.all-coupons-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

.all-coupons-header {
  padding: 25px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.all-coupons-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: #2d3436;
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInDown 0.8s;
}

.all-coupons-header h2::after {
  content: "";
  position: absolute;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  bottom: 0;
  left: 0;
  animation: widthExtend 1s ease-out;
}

@keyframes widthExtend {
  from { width: 0; }
  to { width: 50px; }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.add-coupon-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.25);
  transition: all 0.3s;
  letter-spacing: 0.5px;
}

.add-coupon-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.add-coupon-btn:active {
  transform: translateY(-1px);
}

.add-coupon-btn:hover .plus-icon {
  transform: translateX(2px);
}

.plus-icon {
  font-size: 18px;
  font-style: normal;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}


@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>