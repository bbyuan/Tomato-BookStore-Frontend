<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const availableCoupons = ref([
  {
    couponId: '1',
    name: '满100减20',
    discountType: 'AMOUNT',
    discountValue: 20,
    minOrderAmount: 100,
    validFrom: '2024-06-01',
    validTo: '2024-07-01',
    status: 'ACTIVE',
    claimed: false
  },
  {
    couponId: '2',
    name: '全场9折',
    discountType: 'PERCENT',
    discountValue: 9.0,
    minOrderAmount: 0,
    validFrom: '2024-06-01',
    validTo: '2024-07-01',
    status: 'ACTIVE',
    claimed: false
  }
])

const myCoupons = ref([
  {
    couponId: '3',
    name: '新用户专享',
    discountType: 'AMOUNT',
    discountValue: 10,
    minOrderAmount: 50,
    validFrom: '2024-05-01',
    validTo: '2024-07-01',
    status: 'ACTIVE',
    used: false
  },
  {
    couponId: '4',
    name: '满200减50',
    discountType: 'AMOUNT',
    discountValue: 50,
    minOrderAmount: 200,
    validFrom: '2024-05-01',
    validTo: '2024-06-15',
    status: 'EXPIRED',
    used: false
  }
])

const claimCoupon = (coupon: any) => {
  coupon.claimed = true
  myCoupons.value.push({ ...coupon, used: false })
  ElMessage.success('领取成功！')
}
</script>

<template>
  <div class="user-coupons-container">
    <Header class="fixed-header" />
    <div class="user-coupons-content">
      <div class="user-coupons-section">
        <h2>我的优惠券</h2>
        <div v-if="myCoupons.length > 0" class="coupon-list">
          <div v-for="coupon in myCoupons" :key="coupon.couponId" class="coupon-item">
            <span class="coupon-status-tag" :class="{
              'status-active': coupon.status === 'ACTIVE',
              'status-expired': coupon.status === 'EXPIRED'
            }">
              {{ coupon.status === 'ACTIVE' ? (coupon.used ? '已使用' : '可用') : '已过期' }}
            </span>
            <div class="coupon-amount">
              <template v-if="coupon.discountType === 'AMOUNT'">
                ¥{{ coupon.discountValue }}
              </template>
              <template v-else-if="coupon.discountType === 'PERCENT'">
                {{ (coupon.discountValue).toFixed(1).replace(/\.0$/, '') }}折
              </template>
            </div>
            <div class="coupon-info">
              <div class="coupon-desc">{{ coupon.name }}</div>
              <div class="coupon-condition">满{{ coupon.minOrderAmount }}元可用</div>
              <div class="coupon-expire">
                有效期：{{ coupon.validFrom }} ~ {{ coupon.validTo }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-coupons">暂无优惠券</div>
      </div>
      <div class="user-coupons-section">
        <h2>可领取优惠券</h2>
        <div v-if="availableCoupons.length > 0" class="coupon-list">
          <div v-for="coupon in availableCoupons" :key="coupon.couponId" class="coupon-item">
            <span class="coupon-status-tag status-active">可领取</span>
            <div class="coupon-amount">
              <template v-if="coupon.discountType === 'AMOUNT'">
                ¥{{ coupon.discountValue }}
              </template>
              <template v-else-if="coupon.discountType === 'PERCENT'">
                {{ (coupon.discountValue).toFixed(1).replace(/\.0$/, '') }}折
              </template>
            </div>
            <div class="coupon-info">
              <div class="coupon-desc">{{ coupon.name }}</div>
              <div class="coupon-condition">满{{ coupon.minOrderAmount }}元可用</div>
              <div class="coupon-expire">
                有效期：{{ coupon.validFrom }} ~ {{ coupon.validTo }}
              </div>
              <button class="claim-btn" :disabled="coupon.claimed" @click="claimCoupon(coupon)">
                {{ coupon.claimed ? '已领取' : '领取' }}
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-coupons">暂无可领取优惠券</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-coupons-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  width: 100vw;
}
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.user-coupons-content {
  display: flex;
  gap: 40px;
  margin-top: 100px;
  width: 100%;
  padding: 0 40px 40px 40px;
  box-sizing: border-box;
  justify-content: center;
  align-items: flex-start;
}
.user-coupons-section {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.08);
  padding: 32px 28px 28px 28px;
  min-width: 340px;
  max-width: 480px;
  flex: 1 1 400px;
  display: flex;
  flex-direction: column;
}
.user-coupons-section h2 {
  font-size: 22px;
  font-weight: 700;
  color: #e4393c;
  margin-bottom: 22px;
  border-left: 5px solid #e4393c;
  padding-left: 12px;
}
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.coupon-item {
  display: flex;
  align-items: stretch;
  background: #fff0f0;
  border: 1.5px solid #f3eaea;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(255, 107, 107, 0.06);
  position: relative;
  overflow: hidden;
  min-height: 110px;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.coupon-item:hover {
  box-shadow: 0 6px 24px rgba(255, 107, 107, 0.13);
  border-color: #ffbdbd;
}
.coupon-amount {
  min-width: 110px;
  min-height: 110px;
  background: #fff5f5;
  color: #ff6b6b;
  font-size: 32px;
  font-weight: 700;
  border-radius: 0 16px 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 18px 0 0;
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
  color: #222;
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
.no-coupons {
  text-align: center;
  color: #aaa;
  padding: 40px 0;
}
@media (max-width: 1100px) {
  .user-coupons-content {
    flex-direction: column;
    gap: 24px;
    padding: 90px 8px 16px 8px;
  }
  .user-coupons-section {
    max-width: 100%;
    min-width: 0;
  }
}
</style>
