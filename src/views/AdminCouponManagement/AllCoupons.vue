<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AddCoupon from './AddCoupon.vue'
import EditCoupon from './EditCoupon.vue'
import axios from 'axios'

const loading = ref(false)
const error = ref('')
const showAddCoupon = ref(false)
const currentEditCouponId = ref<string | null>(null)
const coupons = ref<any[]>([])
const pageNum = ref(1)
const pageSize = ref(20)
const totalPage = ref(1)
const showDeleteModal = ref(false)
const couponToDelete = ref<any>(null)

const openAddCouponModal = () => { showAddCoupon.value = true }
const openEditCouponModal = (couponId: string) => {
  currentEditCouponId.value = couponId
}
const closeEditCouponModal = () => {
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
  const coupon = coupons.value.find(c => c.couponId === couponId)
  couponToDelete.value = coupon
  showDeleteModal.value = true
}

const confirmDeleteCoupon = async () => {
  if (!couponToDelete.value) return
  try {
    const token = sessionStorage.getItem('token')
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/coupons/${couponToDelete.value.couponId}`
    const res = await axios.delete(apiUrl, {
      headers: { token, 'Content-Type': 'application/json' }
    })
    if (res.data && res.data.code === '200') {
      coupons.value = coupons.value.filter(item => item.couponId !== couponToDelete.value.couponId)
      showDeleteModal.value = false
      couponToDelete.value = null
    } else {
      error.value = res.data.msg || '删除失败'
    }
  } catch (err: any) {
    error.value = `删除失败: ${err.message || '未知错误'}`
  } finally {
    showDeleteModal.value = false
    couponToDelete.value = null
    fetchCoupons()
  }
}

const cancelDeleteCoupon = () => {
  showDeleteModal.value = false
  couponToDelete.value = null
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
      <p>正在加载优惠券数据...</p>
    </div>
    <!-- 添加错误状态显示 -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchCoupons" class="retry-btn">重试</button>
    </div>
    <!-- 优惠券列表展示 -->
    <div v-if="!loading && !error" class="coupon-section">
      <h3 style="margin: 30px 0 18px 0; font-size: 20px; font-weight: 600; color: #2d3436;">全部优惠券</h3>
      <div v-if="coupons.length > 0" class="coupon-list admin-coupon-list">
        <div v-for="coupon in coupons" :key="coupon.couponId" class="coupon-item admin-coupon-item" style="position:relative;">
          <!-- 状态tag -->
          <span class="coupon-status-tag" :class="{
            'status-pending': coupon.status === 'PENDING',
            'status-active': coupon.status === 'ACTIVE',
            'status-expired': coupon.status === 'EXPIRED'
          }">
            {{ coupon.status === 'PENDING' ? '待开始' : coupon.status === 'ACTIVE' ? '进行中' : '已失效' }}
          </span>
          <!-- 金额/折扣 -->
          <div class="coupon-amount admin-coupon-amount">
            <template v-if="coupon.discountType === 'AMOUNT'">
              ¥{{ coupon.discountValue }}
            </template>
            <template v-else-if="coupon.discountType === 'PERCENT'">
              {{ (coupon.discountValue).toFixed(1).replace(/\.0$/, '') }}折
            </template>
          </div>
          <div class="coupon-info admin-coupon-info">
            <div class="coupon-desc admin-coupon-desc">{{ coupon.name }}</div>
            <div class="coupon-condition admin-coupon-condition">满{{ coupon.minOrderAmount }}元可用</div>
            <div class="coupon-expire admin-coupon-expire">
              有效期：{{ coupon.validFrom ? coupon.validFrom.slice(0, 10) : '' }} ~ {{ coupon.validTo ? coupon.validTo.slice(0, 10) : '' }}
            </div>
            <div class="admin-coupon-actions">
              <button @click="openEditCouponModal(coupon.couponId)" class="edit-btn action-btn">
                <i class="action-icon">✏️</i> 编辑
              </button>
              <button @click="handleDeleteCoupon(coupon.couponId)" class="delete-btn action-btn">
                <i class="action-icon">🗑️</i> 删除
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
    <EditCoupon v-if="currentEditCouponId" :couponId="currentEditCouponId" @close="closeEditCouponModal" @success="fetchCoupons" />
    <div v-if="showDeleteModal" class="delete-modal-overlay" @click="cancelDeleteCoupon">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-icon">🗑️</div>
        <h3>确认删除</h3>
        <p>您确定要删除"{{ couponToDelete?.name }}"吗？</p>
        <p class="warning-text">此操作不可撤销</p>
        <div class="delete-modal-actions">
          <button class="cancel-btn" @click="cancelDeleteCoupon">取消</button>
          <button class="confirm-delete-btn" @click="confirmDeleteCoupon">确认删除</button>
        </div>
      </div>
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
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 10px;
}

.admin-coupon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.coupon-item {
  display: flex;
  gap: 20px;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px 24px;
  background: #fff;
  align-items: center;
  position: relative;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.admin-coupon-item {
  width: 400px;
  min-width: 0;
  background: #fff;
  border: 1.5px solid #f3eaea;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(255, 107, 107, 0.06);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding: 0;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
  position: relative;
}

.admin-coupon-item:hover {
  box-shadow: 0 6px 24px rgba(255, 107, 107, 0.13);
  border-color: #ffbdbd;
}

.coupon-amount {
  min-width: 100px;
  min-height: 90px;
  background: #fff5f5;
  color: #ff6b6b;
  font-size: 32px;
  font-weight: 700;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 18px;
}

.currency {
  font-size: 18px;
  margin-right: 2px;
}

.value {
  font-size: 32px;
  line-height: 1;
}

.admin-coupon-amount {
  background: #fff0f0;
  color: #ff6b6b;
  font-size: 32px;
  font-weight: 700;
  min-width: 110px;
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 16px 16px 0;
  margin: 0;
}

.coupon-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.admin-coupon-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 18px 18px 12px 18px;
}

.coupon-desc {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
}

.admin-coupon-desc {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
  line-height: 1.3;
}

.coupon-condition {
  color: #666;
  font-size: 15px;
  margin-bottom: 8px;
}

.admin-coupon-condition {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.coupon-expire {
  color: #aaa;
  font-size: 14px;
  margin-bottom: 0;
}

.time-icon {
  font-size: 14px;
}

.admin-coupon-expire {
  font-size: 13px;
  color: #999;
  margin-bottom: 10px;
}

.coupon-footer {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
  padding-top: 16px;
}

.coupon-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.admin-coupon-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.action-btn {
  border: none;
  outline: none;
  padding: 7px 20px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.edit-btn {
  background: #fff;
  color: #ff6b6b;
  border: 1px solid #ffe0e0;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(255,107,107,0.07);
}

.edit-btn:hover {
  background: #fff6f6;
  color: #ff3b3b;
}

.delete-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: #fff;
  border: 1px solid #ffbdbd;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
  color: #fff;
}

.action-icon {
  font-size: 15px;
  display: inline-flex;
  align-items: center;
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

.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
  backdrop-filter: blur(2px);
}

.delete-modal {
  background: linear-gradient(135deg, #fff 60%, #ffeaea 100%);
  border-radius: 20px;
  padding: 38px 32px 28px 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(255, 107, 107, 0.18), 0 2px 8px rgba(0,0,0,0.08);
  position: relative;
  text-align: center;
  animation: scaleIn 0.35s;
}

.delete-modal-icon {
  font-size: 54px;
  color: #ff6b6b;
  margin-bottom: 10px;
  animation: wobble 1s;
  display: inline-block;
  position: static;
}

@keyframes wobble {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-10px) rotate(-5deg); }
  30% { transform: translateX(8px) rotate(3deg); }
  45% { transform: translateX(-6px) rotate(-3deg); }
  60% { transform: translateX(4px) rotate(2deg); }
  75% { transform: translateX(-3px) rotate(-1deg); }
}

.delete-modal h3 {
  margin: 0 0 14px 0;
  font-size: 24px;
  font-weight: 700;
  color: #ff6b6b;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.delete-modal p {
  margin: 0 0 18px 0;
  font-size: 15px;
  color: #555;
}

.warning-text {
  font-weight: 600;
  font-size: 15px;
  margin: 12px 0 18px 0;
  padding: 8px 18px;
  border-radius: 16px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.10);
}

.delete-modal-actions {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 18px;
}

.cancel-btn, .confirm-delete-btn {
  border: none;
  padding: 12px 32px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s, color 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.cancel-btn {
  background: #f5f5f5;
  color: #888;
}

.cancel-btn:hover {
  background: #e0e0e0;
  color: #ff6b6b;
}

.confirm-delete-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: #fff;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.18);
}

.confirm-delete-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
  transform: translateY(-2px) scale(1.04);
}

@keyframes scaleIn {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.coupon-status-tag {
  position: absolute;
  top: 18px;
  right: 22px;
  padding: 4px 18px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  letter-spacing: 1px;
  user-select: none;
  background: #e0e0e0;
  opacity: 0.92;
}
.status-pending {
  background: linear-gradient(90deg, #fffbe6 60%, #ffe9b3 100%);
  color: #bfa13a;
  opacity: 0.85;
}
.status-active {
  background: linear-gradient(90deg, #e6f9f0 60%, #c2f0e2 100%);
  color: #2e8b57;
  opacity: 0.85;
}
.status-expired {
  background: linear-gradient(90deg, #f2f2f2 60%, #e0e0e0 100%);
  color: #aaa;
  opacity: 0.85;
}
</style>