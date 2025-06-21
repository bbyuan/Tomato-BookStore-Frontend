<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AddCoupon from './AddCoupon.vue'
import EditCoupon from './EditCoupon.vue'
import axios from 'axios'

const loading = ref(false)
const error = ref('')
const showAddCoupon = ref(false)
const showEditCouponModal = ref(false)
const currentEditCouponId = ref<string | null>(null)
const coupons = ref<any[]>([])
const pageNum = ref(1)
const pageSize = ref(20)
const totalPage = ref(1)

const openAddCouponModal = () => { showAddCoupon.value = true }
const openEditCouponModal = (couponId: string) => {
  currentEditCouponId.value = couponId
  showEditCouponModal.value = true
}
const closeEditCouponModal = () => {
  showEditCouponModal.value = false
  currentEditCouponId.value = null
}

const fetchCoupons = async () => {
  loading.value = true
  error.value = ''
  try {
    const token = sessionStorage.getItem('token')
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/coupons`, {
      headers: { token },
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize.value
      }
    })
    if (res.data && res.data.code === '200') {
      coupons.value = res.data.data?.coupons || []
      totalPage.value = res.data.data?.pageInfo?.totalPage || 1
    } else {
      error.value = res.data?.msg || '获取优惠券失败'
    }
  } catch (e: any) {
    error.value = e.message || '获取优惠券失败'
  } finally {
    loading.value = false
  }
}

const handleDeleteCoupon = (couponId: string) => {
  // TODO: 实现删除逻辑或弹窗确认
  alert('删除功能待实现，couponId: ' + couponId)
}

onMounted(fetchCoupons)

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
      <button @click="fetchCoupons" class="retry-btn">重试</button>
    </div>

    <!-- 优惠券列表展示，参考Order.vue样式 -->
    <div v-if="!loading && !error" class="coupon-section">
      <h3 style="margin: 30px 0 18px 0; font-size: 20px; font-weight: 600; color: #2d3436;">全部优惠券</h3>
      <div v-if="coupons.length > 0" class="coupon-list">
        <div 
          v-for="coupon in coupons" 
          :key="coupon.couponId" 
          class="coupon-item"
        >
          <div class="coupon-header">
            <div class="coupon-amount">
              <span class="currency">¥</span>
              <span class="value">{{ coupon.discountValue }}</span>
            </div>
            <span v-if="coupon.status" class="coupon-status-badge" :class="'status-' + coupon.status.toLowerCase()">
              {{ coupon.status === 'ACTIVE' ? '生效中' : coupon.status === 'PENDING' ? '待生效' : coupon.status === 'EXPIRED' ? '已过期' : coupon.status }}
            </span>
          </div>
          
          <div class="coupon-body">
            <div class="coupon-title">{{ coupon.name }}</div>
            <div class="coupon-condition">满 {{ coupon.minOrderAmount }} 元可用</div>
            <div class="coupon-expire">
              <i class="time-icon">⏰</i>
              {{ coupon.validFrom?.slice(0, 10) }} ~ {{ coupon.validTo?.slice(0, 10) }}
            </div>
          </div>
          
          <div class="coupon-footer">
            <div class="coupon-actions">
              <button @click="openEditCouponModal(coupon.couponId)" class="action-btn edit-btn">
                <i class="action-icon">✏️</i>
                <span>编辑</span>
              </button>
              <button @click="handleDeleteCoupon(coupon.couponId)" class="action-btn delete-btn">
                <i class="action-icon">🗑️</i>
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-coupons">
        <p>暂无优惠券</p>
      </div>
    </div>

    <AddCoupon :show="showAddCoupon" @close="showAddCoupon = false" @success="fetchCoupons" />
    <!-- 编辑优惠券的弹窗组件，假设组件名为EditCoupon -->
    <EditCoupon 
      v-if="showEditCouponModal" 
      :couponId="currentEditCouponId" 
      @close="closeEditCouponModal" 
      @success="fetchCoupons" 
    />
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 16px;
  color: #666;
}

.loading-spinner {
  border: 4px solid rgba(255, 107, 107, 0.3);
  border-top: 4px solid #ff6b6b;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 50px 0;
  color: #ff6b6b;
}

.retry-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #e65c5c;
}

.coupon-section {
  margin-top: 20px;
}

.coupon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.coupon-item {
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 0;
  cursor: default;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.coupon-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.15);
  border-color: #ff6b6b;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 0 20px;
  position: relative;
}

.coupon-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

.coupon-amount {
  display: flex;
  align-items: baseline;
  color: #ff6b6b;
  font-weight: 800;
  position: relative;
}

.currency {
  font-size: 18px;
  margin-right: 2px;
}

.value {
  font-size: 32px;
  line-height: 1;
}

.coupon-body {
  padding: 16px 20px;
  flex: 1;
}

.coupon-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 8px;
  line-height: 1.3;
}

.coupon-condition {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: rgba(255, 107, 107, 0.08);
  border-radius: 6px;
  display: inline-block;
}

.coupon-expire {
  color: #999;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.time-icon {
  font-size: 14px;
}

.coupon-footer {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
  padding-top: 16px;
}

.coupon-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.action-btn {
  border: none;
  outline: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.edit-btn {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #ff6b6b, #ff8a65);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #fff5f5, #ffe0e6);
  color: #e74c3c;
  border: 1px solid #f5c6cb;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.action-icon {
  font-size: 14px;
}

.coupon-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 2px solid transparent;
}

.status-active {
  background: linear-gradient(135deg, #d4edda, #a3d9a4);
  color: #155724;
  border-color: #c3e6cb;
}

.status-pending {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
  border-color: #ffeaa7;
}

.status-expired {
  background: linear-gradient(135deg, #f8d7da, #f5b7b1);
  color: #721c24;
  border-color: #f1b0b7;
}

.no-coupons {
  text-align: center;
  padding: 50px 0;
  color: #999;
}
</style>