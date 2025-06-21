<template>
  <div class="modal-overlay" v-if="show">
    <div class="modal-container" @click.self="close">
      <div class="modal-header">
        <h2>编辑优惠券</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitCoupon">
          <div class="form-grid">
            <div class="form-field">
              <input v-model="form.name" required maxlength="30" class="input-field" id="coupon-name" />
              <label for="coupon-name" :class="{ 'label-float': form.name }">名称</label>
            </div>
            <div class="form-field">
              <input v-model="form.description" maxlength="100" class="input-field" id="coupon-desc" />
              <label for="coupon-desc" :class="{ 'label-float': form.description }">描述</label>
            </div>
            <div class="form-field">
              <select v-model="form.discountType" required class="input-field" id="coupon-type">
                <option value="AMOUNT">满减</option>
                <option value="PERCENT">折扣</option>
              </select>
              <label for="coupon-type" class="label-float always">类型</label>
            </div>
            <div class="form-field">
              <input v-model.number="form.discountValue" type="number" min="0.01" step="0.01" required class="input-field" id="coupon-value" />
              <label for="coupon-value" :class="{ 'label-float': form.discountValue }">折扣值</label>
            </div>
            <div class="form-field">
              <input v-model.number="form.minOrderAmount" type="number" min="0" step="0.01" required class="input-field" id="coupon-min" />
              <label for="coupon-min" :class="{ 'label-float': form.minOrderAmount }">最低订单金额</label>
            </div>
            <div class="form-field">
              <input v-model.number="form.totalQuantity" type="number" min="1" step="1" required class="input-field" id="coupon-total" />
              <label for="coupon-total" :class="{ 'label-float': form.totalQuantity }">总数量</label>
            </div>
            <div class="form-field">
              <input v-model.number="form.perUserLimit" type="number" min="1" step="1" required class="input-field" id="coupon-limit" />
              <label for="coupon-limit" :class="{ 'label-float': form.perUserLimit }">每人限领</label>
            </div>
            <div class="form-field full-width">
              <div class="date-range">
                <input v-model="form.validFrom" type="datetime-local" required class="input-field" id="coupon-from" />
                <span style="margin:0 8px;">至</span>
                <input v-model="form.validTo" type="datetime-local" required class="input-field" id="coupon-to" />
              </div>
              <label class="label-float always">有效期</label>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" @click="close">取消</button>
            <button type="submit" :disabled="loading">{{ loading ? '保存中...' : '保存' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps<{ 
  couponId: string | null
}>()

const emit = defineEmits(['close', 'success'])

const show = computed(() => !!props.couponId)
const loading = ref(false)
const form = reactive({
  name: '',
  description: '',
  discountType: 'AMOUNT',
  discountValue: 0,
  minOrderAmount: 0,
  totalQuantity: 1,
  perUserLimit: 1,
  validFrom: '',
  validTo: ''
})

// 重置表单
const resetForm = () => {
  form.name = ''
  form.description = ''
  form.discountType = 'AMOUNT'
  form.discountValue = 0
  form.minOrderAmount = 0
  form.totalQuantity = 1
  form.perUserLimit = 1
  form.validFrom = ''
  form.validTo = ''
}

// 获取优惠券详情
const fetchCouponDetail = async () => {
  if (!props.couponId) return
  loading.value = true
  try {
    const token = sessionStorage.getItem('token')
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/coupons`, {
      headers: { token }
    })
    if (res.data && res.data.code === '200') {
      const couponList = res.data.data?.coupons || []
      const coupon = couponList.find((c: any) => c.couponId === props.couponId)
      if (coupon) {
        Object.assign(form, {
          name: coupon.name || '',
          description: coupon.description || '',
          discountType: coupon.discountType || 'AMOUNT',
          discountValue: coupon.discountValue || 0,
          minOrderAmount: coupon.minOrderAmount || 0,
          totalQuantity: coupon.totalQuantity || 1,
          perUserLimit: coupon.perUserLimit || 1,
          validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 16) : '',
          validTo: coupon.validTo ? coupon.validTo.slice(0, 16) : ''
        })
      }
    }
  } catch (e: any) {
    alert('获取优惠券详情失败: ' + (e.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.couponId) {
    resetForm()
    fetchCouponDetail()
  }
})

watch(() => props.couponId, (val) => {
  if (val) {
    resetForm()
    fetchCouponDetail()
  }
})

const close = () => emit('close')

const submitCoupon = async () => {
  loading.value = true
  try {
    const token = sessionStorage.getItem('token')
    if (!token) throw new Error('请先登录')
    // 构造接口需要的字段
    const data = {
      couponId: props.couponId,
      name: form.name,
      description: form.description,
      discountType: form.discountType,
      discountValue: form.discountValue,
      minOrderAmount: form.minOrderAmount,
      totalQuantity: form.totalQuantity,
      perUserLimit: form.perUserLimit,
      validFrom: form.validFrom ? (form.validFrom.length === 16 ? form.validFrom + ':00' : form.validFrom) : '',
      validTo: form.validTo ? (form.validTo.length === 16 ? form.validTo + ':00' : form.validTo) : ''
    }
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/coupons/${props.couponId}`
    console.log('PUT url:', url)
    console.log('PUT data:', data)
    const res = await axios.put(url, data, {
      headers: { 'token': token, 'Content-Type': 'application/json' }
    })
    if (res.data && res.data.code === '200') {
      emit('success')
      close()
    } else {
      alert(res.data?.msg || '保存失败')
    }
  } catch (e: any) {
    alert(e.message || '保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.3s ease;
}
.modal-container {
  background: white;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  animation: scaleIn 0.3s ease;
  padding: 0;
  position: relative;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #f0f0f0;
}
.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
  position: relative;
}
.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}
.close-btn:hover {
  color: #ff6b6b;
}
.modal-body {
  padding: 24px 28px 18px 28px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 20px;
}
.full-width {
  grid-column: span 2;
}
.form-field {
  position: relative;
  margin-bottom: 0;
  width: 100%;
  box-sizing: border-box;
}
.input-field {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
  transition: all 0.3s ease;
  color: #333;
  outline: none;
  box-sizing: border-box;
}
.input-field:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}
.form-field label {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  padding: 0 5px;
  color: #666;
  transition: all 0.2s;
  pointer-events: none;
  font-size: 15px;
}
.form-field .input-field:focus + label,
.form-field .label-float {
  top: 0;
  font-size: 12px;
  color: #ff6b6b;
  font-weight: 500;
}
.label-float.always {
  top: 0;
  font-size: 12px;
  color: #ff6b6b;
  font-weight: 500;
}
.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 28px;
}
.form-actions button {
  padding: 10px 28px;
  border-radius: 20px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.form-actions button[type="button"] {
  background: #f5f5f5;
  color: #888;
}
.form-actions button[type="button"]:hover {
  background: #eee;
}
.form-actions button[type="submit"] {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: #fff;
}
.form-actions button[type="submit"]:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@media (max-width: 600px) {
  .modal-container {
    max-width: 98vw;
    padding: 0;
  }
  .modal-body {
    padding: 18px 8px 10px 8px;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .full-width {
    grid-column: 1;
  }
}
</style>
