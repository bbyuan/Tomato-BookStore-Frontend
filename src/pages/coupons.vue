<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 标签页状态
const activeTab = ref<'AVAILABLE' | 'CLAIMED'>('CLAIMED')

// 分页参数
const availablePage = ref({ pageNum: 1, pageSize: 10 })
const claimedPage = ref({ pageNum: 1, pageSize: 10 })

// 优惠券数据
const availableCoupons = ref([])
const myCoupons = ref([])

// 加载状态
const loadingAvailable = ref(false)
const loadingClaimed = ref(false)

// 获取可领取优惠券（平台所有可领取的）
const getAvailableCoupons = async () => {
  loadingAvailable.value = true
  try {
    const token = sessionStorage.getItem('token')
    const res = await axios.get('/api/coupons', {
      params: {
        status: 'ACTIVE',
        pageNum: availablePage.value.pageNum,
        pageSize: availablePage.value.pageSize
      },
      headers: { token }
    })
    if (res.data.code === '200' && res.data.data) {
      availableCoupons.value = res.data.data.coupons || []
    }
  } finally {
    loadingAvailable.value = false
  }
}

// 获取已领取优惠券
const getClaimedCoupons = async () => {
  loadingClaimed.value = true
  try {
    const token = sessionStorage.getItem('token')
    const res = await axios.get('/api/users/coupons', {
      params: {
        status: '', // 查询所有已领取
        pageNum: claimedPage.value.pageNum,
        pageSize: claimedPage.value.pageSize
      },
      headers: { token }
    })
    if (res.data.code === '200' && res.data.data) {
      myCoupons.value = res.data.data.coupons || []
    }
  } finally {
    loadingClaimed.value = false
  }
}

// 领取优惠券
const claimCoupon = async (coupon: any) => {
  const token = sessionStorage.getItem('token')
  if (!token) {
    ElMessage.error('请先登录')
    return
  }
  try {
    const res = await axios.post(`/api/users/coupons/${coupon.couponId}/claim`, {}, {
      headers: { token }
    })
    if (res.data.code === '200') {
      ElMessage.success('领取成功！')
      await getAvailableCoupons()
      await getClaimedCoupons()
    } else {
      ElMessage.error(res.data.msg || '领取失败')
    }
  } catch (e) {
    ElMessage.error('领取失败')
  }
}

// 获取标签数量
const getTabCount = (tab: 'AVAILABLE' | 'CLAIMED') => {
  return tab === 'AVAILABLE' ? availableCoupons.value.length : myCoupons.value.length
}

// 标签切换时加载对应数据
const switchTab = (tab: 'AVAILABLE' | 'CLAIMED') => {
  activeTab.value = tab
  if (tab === 'AVAILABLE') getAvailableCoupons()
  else getClaimedCoupons()
}

// 页面加载时默认加载已领取
onMounted(() => {
  getClaimedCoupons()
})

// 优惠券金额格式化
const formatCouponAmount = (coupon: any) => {
  if (coupon.discountType === 'AMOUNT') {
    return `¥${coupon.discountValue}`
  } else if (coupon.discountType === 'PERCENT') {
    return `${(coupon.discountValue).toFixed(1).replace(/\.0$/, '')}折`
  }
  return ''
}
</script>

<template>
  <div class="coupons-container">
    <Header class="fixed-header" />
    <div class="coupons-content">
      <div class="page-header">
        <h2>我的优惠券</h2>
      </div>
      <div class="coupon-tabs">
        <div 
          class="tab" 
          :class="{ active: activeTab === 'CLAIMED' }" 
          @click="switchTab('CLAIMED')"
        >
          已领取
          <span class="count">{{ getTabCount('CLAIMED') }}</span>
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'AVAILABLE' }" 
          @click="switchTab('AVAILABLE')"
        >
          可领取
          <span class="count">{{ getTabCount('AVAILABLE') }}</span>
        </div>
      </div>
      <div class="coupon-list-section">
        <div v-if="activeTab === 'CLAIMED'">
          <div v-if="myCoupons.length > 0" class="coupon-list">
            <div v-for="coupon in myCoupons" :key="coupon.userCouponId" class="coupon-card">
              <div class="coupon-header">
                <span class="coupon-status-tag" :class="{
                  'status-active': coupon.status === 'UNUSED',
                  'status-expired': coupon.status === 'EXPIRED',
                  'status-used': coupon.status === 'USED'
                }">
                  {{ coupon.status === 'UNUSED' ? '可用' : coupon.status === 'USED' ? '已使用' : '已过期' }}
                </span>
                <div class="coupon-amount">{{ formatCouponAmount(coupon) }}</div>
              </div>
              <div class="coupon-info">
                <div class="coupon-desc">{{ coupon.name }}</div>
                <div class="coupon-condition">满{{ coupon.minOrderAmount || 0 }}元可用</div>
                <div class="coupon-expire">
                  有效期：{{ coupon.claimedAt ? coupon.claimedAt.slice(0,10) : '--' }} ~ {{ coupon.expiresAt ? coupon.expiresAt.slice(0,10) : '--' }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">🎫</div>
            <p>暂无已领取优惠券</p>
          </div>
        </div>
        <div v-else>
          <div v-if="availableCoupons.length > 0" class="coupon-list">
            <div v-for="coupon in availableCoupons" :key="coupon.userCouponId || coupon.couponId" class="coupon-card">
              <div class="coupon-header">
                <span class="coupon-status-tag status-active">可领取</span>
                <div class="coupon-amount">{{ formatCouponAmount(coupon) }}</div>
              </div>
              <div class="coupon-info">
                <div class="coupon-desc">{{ coupon.name }}</div>
                <div class="coupon-condition">满{{ coupon.minOrderAmount || 0 }}元可用</div>
                <div class="coupon-expire">
                  有效期：{{ coupon.validFrom ? coupon.validFrom.slice(0,10) : '--' }} ~ {{ coupon.validTo ? coupon.validTo.slice(0,10) : '--' }}
                </div>
                <button class="claim-btn" :disabled="coupon.claimed" @click="claimCoupon(coupon)">
                  {{ coupon.claimed ? '已领取' : '领取' }}
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">🎫</div>
            <p>暂无可领取优惠券</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coupons-container {
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
.coupons-content {
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
.coupon-tabs {
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
.coupon-list-section {
  background: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  min-width: 0;
  max-width: 100%;
}
.coupon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.coupon-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border-left: 3px solid #ff6b6b;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 110px;
  position: relative;
  transition: box-shadow 0.2s, border-color 0.2s;
  width: calc(50% - 10px);
  margin-bottom: 0;
}
.coupon-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #ffbdbd;
}
.coupon-header {
  min-width: 110px;
  min-height: 110px;
  background: #fff5f5;
  color: #ff6b6b;
  font-size: 32px;
  font-weight: 700;
  border-radius: 0 16px 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 18px 0 0;
  position: relative;
}
.coupon-amount {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b6b;
  margin-top: 10px;
}
.coupon-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 18px 18px 12px 0;
  position: relative;
}
.coupon-desc {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  line-height: 1.3;
}
.coupon-condition {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.coupon-expire {
  font-size: 13px;
  color: #999;
  margin-bottom: 10px;
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
.claim-btn {
  position: absolute;
  right: 18px;
  bottom: 16px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: #fff;
  border: none;
  padding: 7px 22px;
  border-radius: 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.10);
  transition: all 0.2s;
}
.claim-btn:disabled {
  background: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}
.empty-state {
  text-align: center;
  color: #aaa;
  padding: 60px 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  margin-top: 30px;
}
.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #ddd;
}
@media (max-width: 900px) {
  .coupons-content {
    padding: 0 8px;
    max-width: 100%;
  }
  .coupon-list {
    gap: 12px;
  }
  .coupon-card {
    width: 100%;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }
  .coupon-header {
    min-width: 0;
    min-height: 0;
    flex-direction: row;
    justify-content: flex-start;
    margin: 0;
    padding: 10px 0 0 10px;
  }
}
</style>
