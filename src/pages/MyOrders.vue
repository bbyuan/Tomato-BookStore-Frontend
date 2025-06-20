<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 路由
const router = useRouter()

// 订单状态定义
type OrderStatus = 'ALL' | 'UNPAID' | 'PAID' | 'FAILED'

// 订单项类型
interface OrderItem {
  productId: string
  title: string
  image: string
  price: number
  quantity: number
}

// 订单类型
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
}

// 当前选中的标签
const activeTab = ref<OrderStatus>('ALL')

// 加载状态
const loading = ref(false)

// 错误信息
const error = ref('')

// 模拟订单数据
const allOrders = ref<Order[]>([
  {
    id: 'ORD202305150001',
    orderTime: '2023-05-15 14:30:25',
    status: 'PAID',
    statusText: '已付款',
    totalAmount: 158.00,
    paymentMethod: '支付宝',
    tradeNo: '2023051522001475151234567890',
    paymentTime: '2023-05-15 14:32:45',
    items: [
      {
        productId: '101',
        title: '深入理解计算机系统（原书第3版）',
        image: 'https://img1.doubanio.com/view/subject/s/public/s29195878.jpg',
        price: 139.00,
        quantity: 1
      }
    ]
  },
  {
    id: 'ORD202305180002',
    orderTime: '2023-05-18 09:15:10',
    status: 'UNPAID',
    statusText: '待付款',
    totalAmount: 256.80,
    paymentMethod: '',
    items: [
      {
        productId: '102',
        title: 'JavaScript高级程序设计（第4版）',
        image: 'https://img1.doubanio.com/view/subject/s/public/s33561071.jpg',
        price: 99.00,
        quantity: 1
      },
      {
        productId: '103',
        title: '算法（第4版）',
        image: 'https://img9.doubanio.com/view/subject/s/public/s29107491.jpg',
        price: 78.90,
        quantity: 2
      }
    ]
  },
  {
    id: 'ORD202305200003',
    orderTime: '2023-05-20 16:42:33',
    status: 'FAILED',
    statusText: '支付失败',
    totalAmount: 108.00,
    paymentMethod: '支付宝',
    items: [
      {
        productId: '104',
        title: '代码整洁之道',
        image: 'https://img2.doubanio.com/view/subject/s/public/s29376034.jpg',
        price: 59.00,
        quantity: 1
      },
      {
        productId: '105',
        title: 'SQL必知必会（第5版）',
        image: 'https://img2.doubanio.com/view/subject/s/public/s33640192.jpg',
        price: 49.00,
        quantity: 1
      }
    ]
  },
  {
    id: 'ORD202305250004',
    orderTime: '2023-05-25 10:05:18',
    status: 'PAID',
    statusText: '已付款',
    totalAmount: 328.50,
    paymentMethod: '支付宝',
    tradeNo: '2023052522001475151234567891',
    paymentTime: '2023-05-25 10:07:22',
    items: [
      {
        productId: '106',
        title: 'Docker实战',
        image: 'https://img2.doubanio.com/view/subject/s/public/s29749203.jpg',
        price: 89.50,
        quantity: 1
      },
      {
        productId: '107',
        title: '深入浅出React',
        image: 'https://img9.doubanio.com/view/subject/s/public/s33654034.jpg',
        price: 119.00,
        quantity: 2
      }
    ]
  },
  {
    id: 'ORD202306010005',
    orderTime: '2023-06-01 18:28:45',
    status: 'UNPAID',
    statusText: '待付款',
    totalAmount: 179.80,
    paymentMethod: '',
    items: [
      {
        productId: '108',
        title: 'Vue.js设计与实现',
        image: 'https://img1.doubanio.com/view/subject/s/public/s34181306.jpg',
        price: 89.90,
        quantity: 2
      }
    ]
  }
])

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
}

// 查看订单详情
const viewOrderDetail = (orderId: string) => {
  // 这里可以跳转到订单详情页面
  alert(`查看订单详情: ${orderId}`)
}

// 继续支付
const continuePayment = (orderId: string) => {
  // 这里可以跳转到支付页面
  alert(`继续支付订单: ${orderId}`)
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
  // 在实际应用中，这里会调用API获取订单数据
  loading.value = true
  
  // 模拟API请求延迟
  setTimeout(() => {
    loading.value = false
    // 实际应用中，这里会处理API响应，更新订单数据或设置错误信息
  }, 500)
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
        <button class="retry-btn">重试</button>
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
                <button class="action-btn primary-btn" @click.stop="continuePayment(order.id)">继续支付</button>
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
