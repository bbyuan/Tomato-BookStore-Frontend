<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

// 初始化路由
const router = useRouter()
const route = useRoute()

// 订单项类型定义
interface OrderItem {
  id: number | string;
  productId: string;
  image: string;
  title: string;
  price: number;
  originalPrice: number;
  quantity: number;
}

// 优惠券类型定义
interface Coupon {
  id: string;
  code: string;
  discount: number;
  minPurchase: number;
  expireDate: string;
  description: string;
}

// 收货地址类型定义
interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault: boolean;
}

// 用户信息类型定义
interface UserInfo {
  username: string;
  password?: string;
  name?: string;
  avatar?: string;
  avatar_name?: string;
  role?: string;
  telephone?: string;
  email?: string;
  location?: string;
}

// 响应式状态
const loading = ref(false)
const error = ref('')
const orderItems = ref<OrderItem[]>([])
const availableCoupons = ref<Coupon[]>([])
const selectedCoupon = ref<Coupon | null>(null)
const userAddresses = ref<Address[]>([])
const userInfo = ref<UserInfo | null>(null)
const submitting = ref(false)
const submitSuccess = ref(false)
const orderId = ref('')

// 收货信息表单
const addressForm = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
})

// 表单验证状态
const formErrors = reactive({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
})

// 支付方式（目前只支持支付宝）
const paymentMethod = ref('alipay')

// 地址选择状态
const selectedAddressId = ref<string | null>(null)

// 使用地址
const useAddress = (address: Address) => {
  // 如果当前地址已经被选中，则取消选择
  if (selectedAddressId.value === address.id) {
    selectedAddressId.value = null;
    // 清空表单数据
    addressForm.name = '';
    addressForm.phone = '';
    addressForm.province = '';
    addressForm.city = '';
    addressForm.district = '';
    addressForm.detailAddress = '';
  } else {
    // 否则选中该地址
    selectedAddressId.value = address.id;
    
    // 填充表单
    addressForm.name = address.name;
    addressForm.phone = address.phone;
    addressForm.province = address.province;
    addressForm.city = address.city;
    addressForm.district = address.district;
    addressForm.detailAddress = address.detailAddress;
  }
}

// 清除选择的地址
const clearSelectedAddress = () => {
  selectedAddressId.value = null
  // 清空表单数据
  addressForm.name = ''
  addressForm.phone = ''
  addressForm.province = ''
  addressForm.city = ''
  addressForm.district = ''
  addressForm.detailAddress = ''
}

// 从购物车获取已选中的商品数据
const fetchSelectedItems = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 获取 token
    const token = sessionStorage.getItem('token')
    if (!token) {
      console.error('用户未登录，无法获取购物车商品')
      error.value = '用户未登录，请先登录'
      return
    }
    
    const selectedItemJson = sessionStorage.getItem('selectedItems')
    if(selectedItemJson){
        const selectedItems = JSON.parse(selectedItemJson)

        orderItems.value = selectedItems.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          image: item.image,
          title: item.title,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity || 1
        }))
        console.log('获取到的已选商品:', orderItems.value)
    }
   
  } catch (err: any) {
    console.error('获取已选商品出错:', err)
    error.value = err.message || '网络请求失败'
    orderItems.value = []
  } finally {
    loading.value = false
  }
}

// 获取当前登录的用户信息
const fetchUserInfo = async () => {
  try {
    // 从 sessionStorage 获取当前用户名和 token
    const token = sessionStorage.getItem('token')
    const currentUser = sessionStorage.getItem('username')
    
    if (!currentUser || !token) {
      console.error('用户未登录或 token 不存在')
      return null
    }
    
    // 从后端API获取用户信息，添加 token 认证
    const response = await axios(`${import.meta.env.VITE_API_BASE_URL}/api/accounts/${currentUser}`, {
      method: 'GET',
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.data.code === '200') {
      userInfo.value = response.data.data
      console.log('获取到用户信息:', userInfo.value)
      return userInfo.value
    } else {
      console.error('获取用户信息失败:', response.data.msg)
      return null
    }
  } catch (err: any) {
    console.error('获取用户信息出错:', err)
    error.value = '获取用户信息失败'
    return null
  }
}

// 从用户信息中构建地址对象
const buildAddressFromUserInfo = (info: UserInfo): Address | null => {
  if (!info || !info.telephone || !info.location) {
    return null
  }
  
  // 解析地址信息，格式如：江苏省南京市栖霞区仙林大道163号南京大学仙林校区4栋4B317
  try {
    // 提取省份（假设格式为"XX省"）
    const provinceMatch = info.location.match(/^(.+?省)/);
    const province = provinceMatch ? provinceMatch[1] : '';

    // 提取城市（假设格式为"XX市"）
    const cityMatch = info.location.match(/省(.+?市)/);
    const city = cityMatch ? cityMatch[1] : '';

    // 提取区县（假设格式为"XX区"或"XX县"）
    const districtMatch = info.location.match(/市(.+?(区|县))/);
    const district = districtMatch ? districtMatch[1] : '';

    // 剩余部分作为详细地址
    const detailStart = info.location.indexOf(district) + district.length;
    const detailAddress = info.location.substring(detailStart).trim();
    
    return {
      id: '1', // 默认ID
      name: info.name || '',
      phone: info.telephone,
      province,
      city,
      district,
      detailAddress,
      isDefault: true
    }
  } catch (err) {
    console.error('解析地址信息出错:', err);
    return null;
  }
}

// 获取用户的收货地址
const fetchUserAddresses = async () => {
  try {
    // 获取用户信息
    const info = await fetchUserInfo()
    
    if (!info) {
      // 如果获取失败，使用空数组
      userAddresses.value = []
      return
    }
    
    // 从用户信息中构建地址
    const address = buildAddressFromUserInfo(info)
    
    // 如果可以构建有效地址，则添加到地址列表
    if (address) {
      userAddresses.value = [address]
      
      // 自动选择该地址
      useAddress(address)
    } else {
      userAddresses.value = []
      console.log('用户没有有效的收货地址信息')
    }
  } catch (err) {
    console.error('获取收货地址出错:', err)
    userAddresses.value = []
  }
}

// 获取可用优惠券 - 修改为使用真实 API 并添加 token 验证（临时保持原有的假数据）
const fetchAvailableCoupons = async () => {
  try {
    // 获取 token
    const token = sessionStorage.getItem('token')
    if (!token) {
      console.error('用户未登录，无法获取优惠券')
      return
    }
    
  
    // 保持原有的假数据
    availableCoupons.value = [
      {
        id: '001',
        code: 'BOOK10',
        discount: 10,
        minPurchase: 100,
        expireDate: '2025-06-30',
        description: '图书类满100减10元'
      },
      {
        id: '002',
        code: 'NEW30',
        discount: 30,
        minPurchase: 200,
        expireDate: '2025-05-15',
        description: '新用户专享满200减30元'
      },
      {
        id: '003',
        code: 'MEMBER20',
        discount: 20,
        minPurchase: 150,
        expireDate: '2025-05-31',
        description: '会员专享满150减20元'
      }
    ]
  } catch (err) {
    console.error('获取优惠券出错:', err)
  }
}

// 验证表单
const validateForm = () => {
  let isValid = true
  
  // 重置错误信息
  Object.keys(formErrors).forEach(key => {
    formErrors[key as keyof typeof formErrors] = ''
  })
  
  // 验证姓名
  if (!addressForm.name.trim()) {
    formErrors.name = '收件人姓名不能为空'
    isValid = false
  }
  
  // 验证手机号
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(addressForm.phone)) {
    formErrors.phone = '请输入有效的11位手机号码'
    isValid = false
  }
  
  // 验证省份
  if (!addressForm.province.trim()) {
    formErrors.province = '省份不能为空'
    isValid = false
  }
  
  // 验证城市
  if (!addressForm.city.trim()) {
    formErrors.city = '城市不能为空'
    isValid = false
  }
  
  // 验证区/县
  if (!addressForm.district.trim()) {
    formErrors.district = '区/县不能为空'
    isValid = false
  }
  
  // 验证详细地址
  if (!addressForm.detailAddress.trim()) {
    formErrors.detailAddress = '详细地址不能为空'
    isValid = false
  }
  
  return isValid
}

// 计算商品小计
const calculateSubtotal = () => {
  return orderItems.value.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)
}

// 计算总优惠金额（商品折扣）
const calculateItemDiscount = () => {
  return orderItems.value.reduce((sum, item) => {
    if (item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity)
    }
    return sum
  }, 0)
}

// 计算优惠券折扣
const calculateCouponDiscount = () => {
  if (!selectedCoupon.value) return 0
  return selectedCoupon.value.discount
}

// 包邮条件判断
const isFreeShipping = computed(() => {
  const subtotal = calculateSubtotal()
  return subtotal >= 99
})

// 计算运费
const calculateShipping = () => {
  if (isFreeShipping.value) {
    return 0
  }
  return 12 // 默认运费12元
}

// 计算总金额
const calculateTotal = () => {
  const subtotal = calculateSubtotal()
  const couponDiscount = calculateCouponDiscount()
  const shipping = calculateShipping()
  
  return subtotal - couponDiscount + shipping
}

// 选择优惠券
const selectCoupon = (coupon: Coupon | null) => {
  selectedCoupon.value = coupon
}

// 提交订单 - 修改为使用真实 API 并添加 token 验证
const submitOrder = async () => {
  // 验证表单
  if (!validateForm()) {
    // 滚动到第一个错误表单项位置
    const firstError = document.querySelector('.error-message')
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    return
  }
  
  submitting.value = true
  
  try {
    // 获取 token
    const token = sessionStorage.getItem('token')
    if (!token) {
      error.value = '用户未登录，请先登录'
      router.push('/')
      return
    }
    
     // 构建完整地址
    const fullAddress = `${addressForm.province}${addressForm.city}${addressForm.district}${addressForm.detailAddress}`

    // 构建订单数据
    const checkoutData = {
        cartItemIds: orderItems.value.map(item => item.id),
        paymentMethod: "ALIPAY",
        address: {
            name: addressForm.name,
            phone: addressForm.phone,
            fullAddress: fullAddress
        },
    }
    console.log(checkoutData.cartItemIds)
    console.log('提交的订单数据:', checkoutData)
    
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/cart/checkout`, 
      checkoutData,
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }
    )
    
    // 处理响应
    if (response.data && response.data.code === '200') {
      // 获取订单数据
      const orderData = response.data.data;
        orderId.value = orderData.orderId; // 假设订单号在返回数据中
       // 可以选择将其他订单信息保存到本地，如订单金额、创建时间等
      sessionStorage.setItem('lastOrderInfo', JSON.stringify({
    orderId: orderData.orderId,
    username: orderData.username,
    totalAmount: orderData.totalAmount,
    paymentMethod: orderData.paymentMethod,
    createTime: orderData.createTime,
    status: orderData.status
  }));

      submitSuccess.value = true;

      console.log('订单创建成功，订单号:', orderId.value);
      console.log('订单总金额:', orderData.totalAmount);
      console.log('订单创建时间:', orderData.createTime);
      console.log('订单状态:', orderData.status);

      // 清除购物车中的已选商品数据
      sessionStorage.removeItem('selectedItems');
  
      // 显示成功状态一段时间后，跳转到支付页面
      setTimeout(async () => {
  try {
    // 获取token
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('用户未登录，无法完成支付');
    }
    
    const response = await axios(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId.value}/pay`, {
      method: 'GET',
      headers: {
        'token': token
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
    error.value = '获取支付表单失败，请稍后再试或联系客服';
    
    // 显示错误后，提供跳转到订单页面的选项
    setTimeout(() => {
      router.push('/user/orders');
    }, 3000);
  }
}, 1500);
    } else {
      throw new Error(response.data.msg || '订单创建失败')
    }
  } catch (err: any) {
    console.error('提交订单出错:', err)
    error.value = err.message || '网络请求失败'
  } finally {
    submitting.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchSelectedItems()
  fetchUserAddresses()
  fetchAvailableCoupons()
})
</script>

<template>
  <div class="order-container">
    <Header class="fixed-header" />
    <div class="order-content">
      <h2 class="page-title">订单结算</h2>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载数据...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="router.push('/cart')" class="back-btn">返回购物车</button>
      </div>
      
      <!-- 订单提交成功 -->
      <div v-else-if="submitSuccess" class="success-state">
        <div class="success-icon">✓</div>
        <h3>订单提交成功！</h3>
        <p>订单号: {{ orderId }}</p>
        <p>即将跳转到支付页面...</p>
      </div>
      
      <!-- 订单内容 -->
      <div v-else class="order-main">
        <!-- 收货信息 -->
        <div class="order-section shipping-info">
          <h3>收货信息</h3>
          
          <!-- 已保存的地址列表 -->
          <div v-if="userAddresses.length > 0" class="saved-addresses">
            <h4>选择已保存的地址</h4>
            <div class="address-list">
              <div 
                v-for="address in userAddresses" 
                :key="address.id" 
                class="address-card"
                :class="{ 'selected-address': selectedAddressId === address.id }"
                @click="useAddress(address)"
              >
                <div class="address-header">
                  <span class="address-name">{{ address.name }}</span>
                  <span class="address-phone">{{ address.phone }}</span>
                  <span v-if="address.isDefault" class="default-badge">默认</span>
                </div>
                <div class="address-content">
                  {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detailAddress }}
                </div>
                <!-- 添加地址选中标记 -->
                <div class="address-select-mark" v-if="selectedAddressId === address.id">
                  <div class="checkmark">✓</div>
                </div>
              </div>
            </div>
            
            <!-- 更美观的使用其他地址按钮 -->
            <div v-if="selectedAddressId" class="address-actions">
              <button class="use-other-address-btn" @click="clearSelectedAddress">
                <span class="btn-icon">+</span>
                使用其他地址
              </button>
            </div>
          </div>
          
          <!-- 收货信息表单 - 简化版 -->
          <div class="address-form" v-if="!selectedAddressId">
            <h4>填写收货信息</h4>
            <div class="form-row">
              <div class="form-group">
                <label for="name">收货人姓名</label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="addressForm.name" 
                  placeholder="请输入收货人姓名" 
                  :class="{ 'error-input': formErrors.name }"
                />
                <div v-if="formErrors.name" class="error-message">{{ formErrors.name }}</div>
              </div>
              
              <div class="form-group">
                <label for="phone">联系电话</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="addressForm.phone" 
                  placeholder="请输入11位手机号码" 
                  :class="{ 'error-input': formErrors.phone }"
                />
                <div v-if="formErrors.phone" class="error-message">{{ formErrors.phone }}</div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="province">省份</label>
                <input 
                  type="text" 
                  id="province" 
                  v-model="addressForm.province" 
                  placeholder="请输入省份" 
                  :class="{ 'error-input': formErrors.province }"
                />
                <div v-if="formErrors.province" class="error-message">{{ formErrors.province }}</div>
              </div>
              
              <div class="form-group">
                <label for="city">城市</label>
                <input 
                  type="text" 
                  id="city" 
                  v-model="addressForm.city" 
                  placeholder="请输入城市" 
                  :class="{ 'error-input': formErrors.city }"
                />
                <div v-if="formErrors.city" class="error-message">{{ formErrors.city }}</div>
              </div>
              
              <div class="form-group">
                <label for="district">区/县</label>
                <input 
                  type="text" 
                  id="district" 
                  v-model="addressForm.district" 
                  placeholder="请输入区/县" 
                  :class="{ 'error-input': formErrors.district }"
                />
                <div v-if="formErrors.district" class="error-message">{{ formErrors.district }}</div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="detailAddress">详细地址</label>
              <input 
                type="text" 
                id="detailAddress" 
                v-model="addressForm.detailAddress" 
                placeholder="请输入详细地址（街道、门牌号等）" 
                :class="{ 'error-input': formErrors.detailAddress }"
              />
              <div v-if="formErrors.detailAddress" class="error-message">{{ formErrors.detailAddress }}</div>
            </div>
          </div>
        </div>
        
        <!-- 支付方式 -->
        <div class="order-section payment-method">
          <h3>支付方式</h3>
          <div class="payment-options">
            <label class="payment-option" :class="{ 'selected': paymentMethod === 'alipay' }">
              <div class="payment-icon">
                <!-- 使用文字图标代替图片，避免路径问题 -->
                <span class="payment-text-icon">支</span>
              </div>
              <div class="payment-label">支付宝</div>
              <!-- 添加支付方式选中标记 -->
              <div class="coupon-select-mark" v-if="paymentMethod === 'alipay'">
                <div class="checkmark">✓</div>
              </div>
            </label>
          </div>
        </div>
        
        <!-- 订单商品 -->
        <div class="order-section order-items">
          <h3>订单商品</h3>
          <div class="items-list">
            <div class="item-row" v-for="item in orderItems" :key="item.id">
              <div class="item-image">
                <img :src="item.image" :alt="item.title" />
              </div>
              <div class="item-info">
                <h4 class="item-title">{{ item.title }}</h4>
                <div class="item-price">
                  <span class="price">¥{{ item.price.toFixed(2) }}</span>
                  <span class="quantity">× {{ item.quantity }}</span>
                </div>
              </div>
              <div class="item-subtotal">
                <div class="current-price">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
                <div v-if="item.originalPrice > item.price" class="original-price">
                  ¥{{ (item.originalPrice * item.quantity).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 优惠券 -->
        <div class="order-section coupon-section">
          <h3>优惠券</h3>
          <div class="coupon-selection">
            <div v-if="availableCoupons.length > 0" class="coupon-list">
              <div 
                v-for="coupon in availableCoupons" 
                :key="coupon.id" 
                class="coupon-item"
                :class="{ 'selected': selectedCoupon?.id === coupon.id }"
                @click="selectCoupon(coupon)"
              >
                <div class="coupon-amount">¥{{ coupon.discount }}</div>
                <div class="coupon-info">
                  <div class="coupon-desc">{{ coupon.description }}</div>
                  <div class="coupon-condition">满{{ coupon.minPurchase }}元可用</div>
                  <div class="coupon-expire">有效期至: {{ coupon.expireDate }}</div>
                </div>
                <div class="coupon-select-mark" v-if="selectedCoupon?.id === coupon.id">
                  <div class="checkmark">✓</div>
                </div>
              </div>
            </div>
            
            <div v-else class="no-coupons">
              <p>暂无可用优惠券</p>
            </div>
            
            <div class="coupon-clear" v-if="selectedCoupon" @click="selectCoupon(null)">
              不使用优惠券
            </div>
          </div>
        </div>
        
        <!-- 订单汇总 -->
        <div class="order-section order-summary">
          <h3>订单汇总</h3>
          <div class="summary-list">
            <div class="summary-item">
              <span class="summary-label">商品金额</span>
              <span class="summary-value">¥{{ calculateSubtotal().toFixed(2) }}</span>
            </div>
            
            <div class="summary-item" v-if="calculateItemDiscount() > 0">
              <span class="summary-label">商品优惠</span>
              <span class="summary-value discount">-¥{{ calculateItemDiscount().toFixed(2) }}</span>
            </div>
            
            <div class="summary-item" v-if="selectedCoupon">
              <span class="summary-label">优惠券</span>
              <span class="summary-value discount">-¥{{ calculateCouponDiscount().toFixed(2) }}</span>
            </div>
            
            <div class="summary-item">
              <span class="summary-label">运费</span>
              <span v-if="isFreeShipping" class="summary-value free-shipping">免运费</span>
              <span v-else class="summary-value">¥{{ calculateShipping().toFixed(2) }}</span>
            </div>
            
            <div class="summary-total">
              <span class="total-label">实付金额</span>
              <span class="total-value">¥{{ calculateTotal().toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 提交订单 -->
        <div class="order-submit">
          <button 
            class="submit-btn" 
            @click="submitOrder"
            :disabled="submitting || orderItems.length === 0"
          >
            <div class="btn-content">
              <span v-if="submitting">
                <span class="submit-spinner"></span>
                正在提交...
              </span>
              <span v-else>立即下单</span>
            </div>
          </button>
          
          <div class="submit-tips">
            点击"立即下单"，表示您同意
            <a href="#" @click.prevent>《用户购买协议》</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-container {
  min-height: 100vh;
  background-color: #f9f9f9;
  width: 100%;  /* 确保容器占据整个视口宽度 */
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

.order-content {
  margin: 80px auto 0;
  padding: 20px;
  width: 100%;
}

/* 为地址卡片专门设计的选中标记样式 */
.address-select-mark {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 25px 0;
  position: relative;
  padding-left: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.page-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 5px;
  bottom: 15px;
  width: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  border-radius: 2px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
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
}

.error-state p {
  color: #ff6b6b;
  font-size: 18px;
  margin-bottom: 20px;
}

.back-btn {
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

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

/* 成功状态 */
.success-state {
  text-align: center;
  padding: 60px 0;
  animation: fadeIn 0.5s ease;
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
  font-size: 24px;
  color: #4CAF50;
  margin-bottom: 10px;
}

.success-state p {
  color: #666;
  margin-bottom: 10px;
}

/* 订单内容 */
.order-main {
  animation: fadeIn 0.5s ease;
  width: 100%; /* 确保订单主内容区域占满容器宽度 */
}

.order-section {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
  padding: 20px;
  width: 100%; /* 确保各节占满容器宽度 */
}

.order-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  position: relative;
  padding-left: 12px;
}

.order-section h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 5px;
  bottom: 5px;
  width: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  border-radius: 2px;
}

.order-section h4 {
  font-size: 16px;
  font-weight: 500;
  color: #555;
  margin: 15px 0 10px;
}

/* 收货地址区域 */
.saved-addresses {
  margin-bottom: 20px;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.address-card {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 15px 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
}

/* 移除默认地址的背景色样式 */
.default-address {
  border-color: #ff6b6b;
}

/* 只为选中的地址应用高亮样式 */
.selected-address {
  border-color: #ff6b6b;
  background-color: #fff9f9;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.15);
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.address-name {
  font-weight: 600;
  margin-right: 10px;
}

.address-phone {
  color: #666;
}

.default-badge {
  background-color: #ff6b6b;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-left: auto;
}

.address-content {
  color: #444;
  line-height: 1.5;
  word-break: break-all;
  overflow-wrap: break-word;
}

/* 确保复选标记在两处的样式一致 */
.checkmark {
  font-weight: bold;
  font-size: 14px;
}

/* 改进"使用其他地址"按钮样式 */
.address-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.use-other-address-btn {
  background-color: white;
  color: #ff6b6b;
  border: 1px dashed #ff6b6b;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.use-other-address-btn:hover {
  background-color: #fff0f0;
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(255, 107, 107, 0.15);
}

.btn-icon {
  font-size: 16px;
  font-weight: bold;
}

/* 表单样式 */
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  min-width: 250px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  background-color: #fff;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.form-group select {
  padding-right: 30px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

.form-group select:disabled {
  background-color: #f9f9f9;
  color: #999;
  cursor: not-allowed;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
  outline: none;
}

.error-input {
  border-color: #ff5252 !important;
  background-color: #fff8f8;
}

.error-message {
  color: #ff5252;
  font-size: 13px;
  margin-top: 5px;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 支付方式 */
.payment-options {
  display: flex;
  gap: 20px;
}

.payment-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 15px;
  transition: all 0.3s;
  min-width: 120px;
  position: relative; /* 添加相对定位 */
}

.payment-option:hover {
  border-color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

/* 添加选中样式 */
.payment-option.selected {
  border-color: #ff6b6b;
  background-color: #fff9f9;
}

.payment-icon {
  margin-bottom: 10px;
}

.payment-icon img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.payment-label {
  font-weight: 500;
}

/* 在原有的payment-icon样式后添加文字图标样式 */
.payment-text-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #1677ff;
  color: white;
  border-radius: 8px;
  font-size: 22px;
  font-weight: bold;
}

/* 订单商品列表 */
.items-list {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 15px;
  gap: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.item-row:last-child {
  border-bottom: none;
}

.item-image {
  width: 70px;
  height: 95px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.item-info {
  flex: 1;
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price {
  color: #ff6b6b;
  font-weight: 500;
}

.quantity {
  color: #666;
}

.item-subtotal {
  text-align: right;
  min-width: 100px;
}

.current-price {
  color: #ff6b6b;
  font-weight: 600;
  font-size: 16px;
}

.original-price {
  color: #999;
  font-size: 14px;
  text-decoration: line-through;
  margin-top: 4px;
}

/* 优惠券区域 */
.coupon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.coupon-item {
  display: flex;
  gap: 15px;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.coupon-item:hover {
  border-color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.coupon-item.selected {
  border-color: #ff6b6b;
  background-color: #fff9f9;
}

.coupon-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6b6b;
  font-size: 24px;
  font-weight: 700;
  min-width: 80px;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  padding: 10px;
}

.coupon-info {
  flex: 1;
}

.coupon-desc {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.coupon-condition {
  color: #666;
  font-size: 14px;
}

.coupon-expire {
  color: #999;
  font-size: 13px;
  margin-top: 5px;
}

.coupon-select-mark {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-coupons {
  text-align: center;
  padding: 20px;
  color: #999;
}

.coupon-clear {
  margin-top: 15px;
  text-align: right;
  color: #666;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
}

.coupon-clear:hover {
  color: #ff6b6b;
}

/* 订单汇总区域 */
.summary-list {
  font-size: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.summary-label {
  color: #666;
}

.summary-value {
  font-weight: 500;
  color: #333;
}

.summary-value.discount {
  color: #ff6b6b;
}

.summary-value.free-shipping {
  color: #4CAF50;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  margin-top: 15px;
  border-top: 1px dashed #eee;
}

.total-label {
  font-weight: 600;
  font-size: 18px;
  color: #333;
}

.total-value {
  font-weight: 700;
  font-size: 24px;
  color: #ff6b6b;
}

/* 提交订单区域 */
.order-submit {
  text-align: center;
  margin-top: 30px;
}

.submit-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 0;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.25);
  width: 100%;
  max-width: 300px;
  height: 54px;
  position: relative;
  overflow: hidden;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 25px rgba(255, 107, 107, 0.4);
}

.submit-btn:disabled {
  background: linear-gradient(90deg, #cccccc, #dddddd);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  animation: spin 1s infinite linear;
  margin-right: 10px;
}

.submit-tips {
  margin-top: 15px;
  color: #999;
  font-size: 14px;
}

.submit-tips a {
  color: #ff6b6b;
  text-decoration: none;
}

.submit-tips a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-content {
    padding: 15px;
    width: 100%;
  }
  
  .form-group {
    min-width: 100%;
  }
  
  .address-list, .coupon-list {
    grid-template-columns: 1fr;
  }
  
  .payment-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .payment-option {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    min-width: auto;
  }
  
  .payment-icon {
    margin-bottom: 0;
  }
}

@media (min-width: 1201px) {
  .order-content {
    width: 1200px; /* 在大屏幕上保持合适的宽度 */
  }
}
</style>