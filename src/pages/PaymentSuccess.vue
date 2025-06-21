<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

// 初始化路由
const router = useRouter()

// 订单信息
const orderInfo = ref({
  orderId: '',
  totalAmount: 0,
  paymentMethod: '',
  tradeNo: '',  // 新增交易号字段
  paymentTime: ''  // 新增支付时间字段
})

// 是否正在加载
const loading = ref(true)
// 是否有错误
const hasError = ref(false)
// 错误消息
const errorMessage = ref('')

// 倒计时设置
const countdown = ref(10) // 10秒倒计时
const countdownInterval = ref<number | null>(null)

// 获取订单信息
const fetchOrderInfo = () => {
  try {
    console.log('开始获取订单信息...')
    
    // 从 URL 参数中获取数据
    const urlParams = new URLSearchParams(window.location.search)
    const orderIdFromUrl = urlParams.get('orderId')
    const tradeNoFromUrl = urlParams.get('tradeNo')
    const paymentTimeFromUrl = urlParams.get('paymentTime')
    
    console.log('从URL获取的参数:', { 
      orderId: orderIdFromUrl, 
      tradeNo: tradeNoFromUrl, 
      paymentTime: paymentTimeFromUrl
    })
    
    // 更新订单信息
    if (orderIdFromUrl) {
      orderInfo.value.orderId = orderIdFromUrl
    }
    
    if (tradeNoFromUrl) {
      orderInfo.value.tradeNo = tradeNoFromUrl
    }
    
    if (paymentTimeFromUrl) {
      orderInfo.value.paymentTime = paymentTimeFromUrl
    }
    
    console.log('更新后的订单信息:', orderInfo.value)
    
    // 如果没有订单ID，则认为有错误
    if (!orderInfo.value.orderId) {
      console.warn('未找到订单ID')
      hasError.value = true
      errorMessage.value = '未找到订单信息'
    }
    
    loading.value = false
  } catch (error) {
    console.error('获取订单信息出错:', error)
    loading.value = false
    hasError.value = true
    errorMessage.value = '获取订单信息失败'
  }
}

// 开始倒计时
const startCountdown = () => {
  console.log('开始倒计时...')
  countdownInterval.value = window.setInterval(() => {
    countdown.value -= 1
    console.log('倒计时:', countdown.value)
    
    if (countdown.value <= 0) {
      // 清除计时器
      if (countdownInterval.value !== null) {
        clearInterval(countdownInterval.value)
        countdownInterval.value = null
      }
      // 跳转到主页
      console.log('倒计时结束，准备跳转到首页')
      router.push('/homepage')
    }
  }, 1000)
}

// 立即跳转到主页
const goToHome = () => {
  // 清除计时器
  if (countdownInterval.value !== null) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
  router.push('/homepage')
}

// 组件挂载时获取订单信息并开始倒计时
onMounted(() => {
  console.log('PaymentSuccess组件已挂载')
  fetchOrderInfo()
  startCountdown()
})

// 组件卸载前清除计时器
onBeforeUnmount(() => {
  console.log('PaymentSuccess组件即将卸载')
  if (countdownInterval.value !== null) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
})
</script>

<template>
  <div class="payment-success-container">
    <Header class="fixed-header" />
    <div class="payment-success-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载支付结果...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="hasError" class="error-state">
        <div class="error-icon">!</div>
        <h3>出现问题</h3>
        <p>{{ errorMessage || '无法获取支付结果，请稍后查看订单状态' }}</p>
        <div class="action-buttons">
          <button class="home-btn" @click="goToHome">返回主页</button>
          <button class="order-btn" @click="router.push('/order')">查看订单</button>
        </div>
      </div>
      
      <!-- 成功状态 -->
      <div v-else class="success-state">
        <div class="success-icon">✓</div>
        <h3>支付成功！</h3>
        <div class="order-details" v-if="orderInfo.orderId">
          <p class="detail-item">订单号: <span class="detail-value">{{ orderInfo.orderId }}</span></p>
          <p class="detail-item" v-if="orderInfo.tradeNo">
            交易号: <span class="detail-value">{{ orderInfo.tradeNo }}</span>
          </p>
          <p class="detail-item" v-if="orderInfo.totalAmount">
            支付金额: <span class="detail-value price">¥{{ orderInfo.totalAmount.toFixed(2) }}</span>
          </p>
          <p class="detail-item" v-if="orderInfo.paymentMethod">
            支付方式: <span class="detail-value">{{ orderInfo.paymentMethod === 'ALIPAY' ? '支付宝' : orderInfo.paymentMethod }}</span>
          </p>
          <p class="detail-item" v-if="orderInfo.paymentTime">
            支付时间: <span class="detail-value">{{ orderInfo.paymentTime }}</span>
          </p>
        </div>
        
        <div v-else class="no-info-warning">
          未找到订单详情，但支付已完成
        </div>
        
        <div class="countdown-info">
          <p>{{ countdown }}秒后自动返回主页</p>
        </div>
        
        <div class="action-buttons">
          <button class="home-btn" @click="goToHome">立即返回主页</button>
          <button class="order-btn" @click="router.push('/myorders')">查看我的订单</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-success-container {
  min-height: 100vh;
  background-color: #f9f9f9;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
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

.payment-success-content {
  margin: 120px auto 0;
  padding: 20px;
  width: 100%;
  max-width: 600px;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(255, 107, 107, 0.2);
  border-top-color: #ff6b6b;
  animation: spin 1s infinite linear;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 60px 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.08);
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff5252, #ff8a80);
  color: white;
  font-size: 40px;
  border-radius: 50%;
  margin: 0 auto 20px;
  box-shadow: 0 8px 20px rgba(255, 82, 82, 0.3);
}

.error-state h3 {
  font-size: 28px;
  color: #ff5252;
  margin-bottom: 20px;
}

.error-state p {
  color: #666;
  margin-bottom: 30px;
}

/* 成功状态 */
.success-state {
  text-align: center;
  padding: 60px 40px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.5s ease;
}

.no-info-warning {
  color: #ff9800;
  background-color: #fff8e1;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  color: white;
  font-size: 40px;
  border-radius: 50%;
  margin: 0 auto 20px;
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

.success-state h3 {
  font-size: 28px;
  color: #ff6b6b;
  margin-bottom: 20px;
}

/* 订单详情样式 */
.order-details {
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 8px;
  display: inline-block;
  text-align: left;
  min-width: 300px;
}

.detail-item {
  margin: 10px 0;
  color: #666;
  font-size: 16px;
}

.detail-value {
  color: #333;
  font-weight: 500;
  margin-left: 5px;
}

.detail-value.price {
  color: #ff6b6b;
  font-weight: 600;
}

/* 倒计时样式 */
.countdown-info {
  margin: 25px 0;
  font-size: 18px;
  color: #666;
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.8; }
  to { opacity: 1; }
}

/* 按钮样式 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.home-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e9e);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.25);
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

.order-btn {
  background: white;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.order-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-success-content {
    padding: 15px;
  }
  
  .success-state, .error-state, .loading-state {
    padding: 40px 20px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 15px;
  }
  
  .home-btn, .order-btn {
    width: 100%;
  }
}
</style>
``` 