<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// 路由
const router = useRouter()

// 订单状态定义 - 前端使用的状态
type OrderStatus = 'ALL' | 'UNPAID' | 'PAID' | 'FAILED'

// 后端订单状态映射
const backendStatusMap = {
  ALL: 'ALL',
  UNPAID: 'PENDING',
  PAID: 'SUCCESS',
  FAILED: 'FAILED'  
}

// 前端订单状态映射
const frontendStatusMap = {
  'PENDING': 'UNPAID',
  'SUCCESS': 'PAID',
  'FAILED': 'FAILED',
  'TIMEOUT': 'FAILED'  // TIMEOUT也归类为失败订单
} as const

// 订单状态文本映射
const statusTextMap = {
  'UNPAID': '待付款',
  'PAID': '已付款',
  'FAILED': '支付失败'
}

// 订单项类型
interface OrderItem {
  productId: string
  title: string
  image: string
  price: number
  quantity: number
}

// 后端返回的订单类型
interface OrderVO {
  orderId: string
  userId: string
  totalAmount: number
  paymentMethod: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT'
  createTime: string
  cartItemIds: string[]
  shippingAddress?: string
  userCouponId?: string
  discountAmount?: number
  originalAmount?: number
  items?: OrderItem[] // 这可能需要额外处理，取决于后端返回的实际数据结构
}

// 后端API响应类型
interface ApiResponse {
  code: string
  msg: string
  data: OrderVO[]
}

// 前端使用的订单类型
interface Order {
  id: string
  orderTime: string
  status: 'UNPAID' | 'PAID' | 'FAILED'
  statusText: string
  totalAmount: number
  paymentMethod: string
  items: OrderItem[]
  tradeNo?: string
  paymentTime?: string
  isExpired?: boolean
}

// 当前选中的标签
const activeTab = ref<OrderStatus>('ALL')

// 加载状态
const loading = ref(false)

// 错误信息
const error = ref('')

// 订单数据
const allOrders = ref<Order[]>([])

// 获取订单数据
const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 检查用户是否已登录 - 参考您的token获取方式
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (!token || !username) {
      console.error('未找到token或用户名')
      error.value = '请先登录后查看订单'
      loading.value = false
      // 直接跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 1500)
      return
    }

    // 始终获取所有订单数据
    const response = await axios.get<ApiResponse>('/api/orders/getByStatus', {
      params: { status: 'ALL' },
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })
    
    // 输出完整的响应数据用于调试
    console.log('订单API响应:', response.data)
    console.log('订单数据条数:', response.data.data?.length || 0)
    
    if (response.data.code === '200') {
      // 输出原始订单数据
      console.log('原始订单数据:', response.data.data)
      
      // 转换后端数据格式为前端使用的格式
      allOrders.value = response.data.data.map(convertOrderVOtoOrder)
      
      // 输出转换后的订单数据
      console.log('转换后订单数据:', allOrders.value)
      
      // 输出各状态订单数量统计
      console.log('订单数量统计:', {
        ALL: allOrders.value.length,
        UNPAID: allOrders.value.filter(o => o.status === 'UNPAID').length,
        PAID: allOrders.value.filter(o => o.status === 'PAID').length,
        FAILED: allOrders.value.filter(o => o.status === 'FAILED').length
      })
      
      // 初始化检查订单过期状态
      updateOrdersStatus()
    } else if (response.data.code === '401') {
      // 处理未授权访问
      error.value = '登录已过期，请重新登录'
      // 清除过期token
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
      // 可以跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = response.data.msg || '获取订单数据失败'
    }
  } catch (err: any) {
    console.error('获取订单失败:', err)
    if (err.response?.status === 401) {
      error.value = '登录已过期，请重新登录'
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = '网络错误，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

// 将后端订单数据转换为前端格式
const convertOrderVOtoOrder = (orderVO: OrderVO): Order => {
  // 前端状态转换
  const frontendStatus = frontendStatusMap[orderVO.status] || 'FAILED'
  
  // 输出单个订单的转换过程用于调试
  console.log('转换订单:', orderVO.orderId, '状态:', orderVO.status, '->', frontendStatus)
  
  return {
    id: orderVO.orderId,
    orderTime: orderVO.createTime,
    status: frontendStatus as 'UNPAID' | 'PAID' | 'FAILED',
    statusText: statusTextMap[frontendStatus],
    totalAmount: orderVO.totalAmount,
    paymentMethod: orderVO.paymentMethod || '暂未支付',
    // 如果后端没有返回items，创建一个占位数据，或者根据cartItemIds获取
    items: orderVO.items || [
      {
        productId: 'placeholder',
        title: '商品信息加载中...',
        image: '/placeholder-book.jpg',
        price: orderVO.totalAmount,
        quantity: 1
      }
    ],
    // 检查是否已过期 (对于TIMEOUT状态的订单)
    isExpired: orderVO.status === 'TIMEOUT'
  }
}

// 计算订单剩余支付时间
const calculateRemainingTime = (orderTime: string): { minutes: number, seconds: number, expired: boolean } => {
  const orderDate = new Date(orderTime).getTime()
  const deadline = orderDate + 20 * 60 * 1000 // 20分钟支付期限
  const now = new Date().getTime()
  const timeLeft = deadline - now
  
  if (timeLeft <= 0) {
    return { minutes: 0, seconds: 0, expired: true }
  }
  
  const minutes = Math.floor(timeLeft / (60 * 1000))
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000)
  
  return { minutes, seconds, expired: false }
}

// 格式化剩余时间显示
const formatRemainingTime = (orderTime: string): string => {
  const { minutes, seconds, expired } = calculateRemainingTime(orderTime)
  
  if (expired) {
    return '订单超时'
  }
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 倒计时定时器
let countdownTimer: number | null = null

// 更新待付款订单状态
const updateOrdersStatus = () => {
  allOrders.value.forEach(order => {
    if (order.status === 'UNPAID') {
      const { expired } = calculateRemainingTime(order.orderTime)
      if (expired) {
        order.isExpired = true
      }
    }
  })
}

// 启动倒计时
const startCountdown = () => {
  countdownTimer = window.setInterval(() => {
    updateOrdersStatus()
  }, 1000)
}

// 根据当前选中标签筛选订单
const filteredOrders = computed(() => {
  if (activeTab.value === 'ALL') {
    return allOrders.value
  }
  return allOrders.value.filter(order => {
    if (activeTab.value === 'UNPAID') return order.status === 'UNPAID'
    if (activeTab.value === 'PAID') return order.status === 'PAID'
    if (activeTab.value === 'FAILED') return order.status === 'FAILED'
    return true
  })
})

// 切换标签
const switchTab = (tab: OrderStatus) => {
  activeTab.value = tab
  // 只切换显示，不重新加载数据
}

// 查看订单详情
const viewOrderDetail = (orderId: string) => {
  // 这里可以跳转到订单详情页面
  alert(`查看订单详情: ${orderId}`)
}

// 继续支付处理
const continuePayment = async (orderId: string) => {
  // 找到对应的订单
  const order = filteredOrders.value.find(o => o.id === orderId);
  if (!order) {
    alert('订单不存在');
    return;
  }

  // 检查订单是否为待付款状态且未超时
  if (order.status === 'UNPAID') {
    const timeRemaining = calculateRemainingTime(order.orderTime);
    if (timeRemaining.expired) {
      alert('订单已超时，无法继续支付');
      return;
    }
  }

  try {
    // 参考您的token获取方式
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')

    if (!token || !username) {
      console.error('未找到token或用户名')
      alert('用户未登录，请先登录')
      return
    }

    const response = await axios(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/pay`, {
      method: 'GET',
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })
    
    // 处理响应数据
    if (response.data && response.data.code === '200' && response.data.data) {
      const paymentData = response.data.data;
      
      // 保存订单支付信息到本地，方便用户查询
      sessionStorage.setItem('currentPayment', JSON.stringify({
        orderId: paymentData.orderId,
        totalAmount: paymentData.totalAmount,
        paymentMethod: paymentData.paymentMethod
      }));
      
      // 获取返回的支付表单HTML
      const paymentFormHTML = paymentData.paymentForm;
      
      // 创建一个新的HTML文档来展示支付表单
      const paymentContainer = document.createElement('div');
      paymentContainer.style.display = 'none'; 
      paymentContainer.innerHTML = paymentFormHTML;
      document.body.appendChild(paymentContainer);
      
      // 找到表单并自动提交
      const form = paymentContainer.querySelector('form');
      if (form) {
        console.log('找到支付表单，准备提交');
        form.submit(); // 自动提交表单
      } else {
        console.error('支付表单解析失败');
        throw new Error('无法识别支付表单');
      }
    } else {
      console.error('支付接口返回错误:', response.data);
      throw new Error(response.data.msg || '获取支付表单失败');
    }
  } catch (err) {
    console.error('支付请求失败:', err);
    alert('获取支付表单失败，请稍后再试或联系客服');
  }
}

// 取消订单
const cancelOrder = (orderId: string) => {
  // 这里可以弹出确认框，然后发送取消订单请求
  if (confirm(`确定要取消订单 ${orderId} 吗？`)) {
    // 模拟取消订单，实际应该调用API
    alert(`订单 ${orderId} 已取消`)
    // 在实际实现中，应该刷新订单列表
  }
}

// 删除订单
const deleteOrder = (orderId: string) => {
  // 这里可以弹出确认框，然后发送删除订单请求
  if (confirm(`确定要删除订单 ${orderId} 吗？此操作不可恢复。`)) {
    // 模拟删除订单，实际应该调用API
    allOrders.value = allOrders.value.filter(order => order.id !== orderId)
    alert(`订单 ${orderId} 已删除`)
  }
}

// 跳转到商品详情
const goToProductDetail = (productId: string) => {
  router.push({
    name: 'Detail',
    params: { id: productId }
  })
}

onMounted(() => {
  // 加载订单数据
  fetchOrders()
  
  // 启动倒计时
  startCountdown()
})

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer)
  }
})

// 获取每个标签的订单数量
const getTabCount = (status: OrderStatus) => {
  if (status === 'ALL') {
    return allOrders.value.length
  }
  return allOrders.value.filter(order => {
    if (status === 'UNPAID') return order.status === 'UNPAID'
    if (status === 'PAID') return order.status === 'PAID'
    if (status === 'FAILED') return order.status === 'FAILED'
    return false
  }).length
}

// 格式化金额
const formatPrice = (price: number) => {
  return `¥${price.toFixed(2)}`
}
</script>

<template>
  <div class="orders-container">
    <Header class="fixed-header" />
    
    <div class="orders-content">
      <div class="page-header">
        <h2>我的订单</h2>
      </div>
      
      <!-- 订单状态标签 -->
      <div class="order-tabs">
        <div 
          class="tab" 
          :class="{ active: activeTab === 'ALL' }" 
          @click="switchTab('ALL')"
        >
          全部订单
          <span class="count">{{ getTabCount('ALL') }}</span>
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'UNPAID' }" 
          @click="switchTab('UNPAID')"
        >
          待付款
          <span class="count">{{ getTabCount('UNPAID') }}</span>
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'PAID' }" 
          @click="switchTab('PAID')"
        >
          已付款
          <span class="count">{{ getTabCount('PAID') }}</span>
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'FAILED' }" 
          @click="switchTab('FAILED')"
        >
          失败订单
          <span class="count">{{ getTabCount('FAILED') }}</span>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载订单数据...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchOrders()">重试</button>
      </div>
      
      <!-- 空订单状态 -->
      <div v-else-if="filteredOrders.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p>暂无{{ activeTab === 'ALL' ? '' : activeTab === 'UNPAID' ? '待付款' : activeTab === 'PAID' ? '已付款' : '失败' }}订单</p>
        <button class="shop-now-btn" @click="router.push('/homepage')">去购物</button>
      </div>
      
      <!-- 订单列表 -->
      <div v-else class="order-list">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">订单号: {{ order.id }}</span>
              <span class="order-time">下单时间: {{ order.orderTime }}</span>
            </div>
            <div class="order-status" :class="order.status.toLowerCase()">
              {{ order.statusText }}
              <!-- 添加倒计时显示 -->
              <span v-if="order.status === 'UNPAID'" class="countdown" :class="{ expired: order.isExpired }">
                {{ order.isExpired ? '订单超时' : formatRemainingTime(order.orderTime) }}
              </span>
            </div>
          </div>
          
          <div class="order-items">
            <div 
              v-for="(item, index) in order.items" 
              :key="`${order.id}-${index}`" 
              class="order-item"
              @click="goToProductDetail(item.productId)"
            >
              <img :src="item.image" :alt="item.title" class="item-image">
              <div class="item-details">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-price-qty">
                  <span class="item-price">{{ formatPrice(item.price) }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              共{{ order.items.reduce((sum, item) => sum + item.quantity, 0) }}件商品
              <span class="total-label">实付款：</span>
              <span class="total-amount">{{ formatPrice(order.totalAmount) }}</span>
            </div>
            
            <div class="order-actions">
              <!-- 待付款订单按钮 -->
              <template v-if="order.status === 'UNPAID'">
                <button class="action-btn delete-btn" @click.stop="cancelOrder(order.id)">取消订单</button>
                <button 
                  class="action-btn primary-btn" 
                  @click.stop="continuePayment(order.id)"
                  :disabled="order.isExpired"
                  :class="{ disabled: order.isExpired }"
                >
                  {{ order.isExpired ? '订单已超时' : '继续支付' }}
                </button>
              </template>
              
              <!-- 已付款订单按钮 -->
              <template v-else-if="order.status === 'PAID'">
                <button class="action-btn detail-btn" @click.stop="viewOrderDetail(order.id)">查看详情</button>
              </template>
              
              <!-- 失败订单按钮 -->
              <template v-else-if="order.status === 'FAILED'">
                <button class="action-btn delete-btn" @click.stop="deleteOrder(order.id)">删除订单</button>
                <button class="action-btn primary-btn" @click.stop="continuePayment(order.id)">重新支付</button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-container {
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

.orders-content {
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

/* 订单标签页 */
.order-tabs {
  display: flex;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tab {
  flex: 1;
  padding: 15px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: #ff6b6b;
  background-color: #fff9f9;
}

.tab.active {
  color: #ff6b6b;
  border-bottom-color: #ff6b6b;
  background-color: #fff9f9;
}

.tab .count {
  display: inline-block;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: #ff6b6b;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  margin-left: 5px;
  padding: 0 6px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(255, 107, 107, 0.2);
  border-top-color: #ff6b6b;
  animation: spin 1s infinite linear;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 60px 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.error-state p {
  color: #ff6b6b;
  font-size: 18px;
  margin-bottom: 20px;
}

.retry-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #ddd;
}

.empty-state p {
  color: #999;
  font-size: 18px;
  margin-bottom: 20px;
}

.shop-now-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
}

.shop-now-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

/* 订单列表 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
  border-left: 3px solid #ff6b6b;
}

.order-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.order-info {
  font-size: 14px;
  color: #666;
}

.order-id {
  margin-right: 20px;
  font-weight: 500;
}

.order-status {
  font-weight: 600;
  font-size: 16px;
}

.order-status.unpaid {
  color: #e6a23c;
}

.order-status.paid {
  color: #67c23a;
}

.order-status.failed {
  color: #f56c6c;
}

.order-items {
  padding: 15px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  max-width: 100%;
  overflow: hidden;
  flex: 1 1 300px;
}

.order-item:hover {
  background-color: #f9f9f9;
  border-color: #eaeaea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.item-image {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-price-qty {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  color: #ff6b6b;
  font-weight: 600;
}

.item-qty {
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fcfcfc;
  border-top: 1px solid #f0f0f0;
}

.order-total {
  color: #666;
  font-size: 14px;
}

.total-label {
  margin-left: 20px;
  font-weight: 500;
}

.total-amount {
  color: #ff6b6b;
  font-size: 18px;
  font-weight: 600;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.primary-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  box-shadow: 0 3px 8px rgba(255, 107, 107, 0.2);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(255, 107, 107, 0.3);
}

.detail-btn {
  background: #ecf5ff;
  color: #409eff;
  border: 1px solid #d9ecff;
}

.detail-btn:hover {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
  transform: translateY(-2px);
}

.delete-btn {
  background: #f8f8f8;
  color: #909399;
  border: 1px solid #ebeef5;
}

.delete-btn:hover {
  color: #f56c6c;
  background-color: #fef0f0;
  border-color: #fbc4c4;
}

/* 倒计时样式 */
.countdown {
  display: inline-block;
  margin-left: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  animation: pulse 1s infinite alternate;
}

.countdown.expired {
  background: rgba(245, 108, 108, 0.2);
  color: #f56c6c;
  animation: none;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}

.action-btn.disabled {
  background: #f0f0f0;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.action-btn.disabled:hover {
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .orders-content {
    padding: 0 10px;
  }
  
  .order-tabs {
    flex-wrap: wrap;
  }
  
  .tab {
    padding: 12px 10px;
    font-size: 14px;
  }
  
  .order-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .order-item {
    flex: 1 1 100%;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .order-total {
    width: 100%;
    text-align: right;
  }
  
  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
