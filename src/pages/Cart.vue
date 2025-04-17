<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import { ref, computed } from 'vue'

// 购物车项类型定义
interface CartItem {
  id: number;
  image: string;
  title: string;
  price: number;
  quantity: number;
  selected: boolean; // 添加选中状态
  discount?: string; // 增加折扣信息
  originalPrice?: number; // 原价
}

// 使用ref创建响应式数据
const cartItems = ref<CartItem[]>([
  {
    id: 1,
    image: '/src/assets/images/BookTemplate.avif',
    title: '智慧的疆界',
    price: 69,
    originalPrice: 79, // 添加原价
    quantity: 1,
    selected: false, // 默认不选中
    discount: '限时8.8折', // 添加折扣信息
  },
  {
    id: 2,
    image: '/src/assets/logo.png',
    title: '小王子',
    price: 49,
    originalPrice: 59, // 添加原价
    quantity: 1,
    selected: false, // 默认不选中
    discount: '双11特惠', // 添加折扣信息
  },
]);

// 全选状态 - 简化计算和设置逻辑
const allSelected = computed(() => {
  return cartItems.value.length > 0 && cartItems.value.every(item => item.selected);
});

// 计算选中的商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length;
});

// 减少数量方法
const decreaseQuantity = (item: CartItem) => {
  if (item.quantity > 1) {
    item.quantity--;
  }
};

// 增加数量方法
const increaseQuantity = (item: CartItem) => {
  item.quantity++;
};

// 删除购物车项
const removeItem = (itemId: number) => {
  cartItems.value = cartItems.value.filter(item => item.id !== itemId);
};

// 切换商品选中状态 - 简化逻辑，不使用外部函数，由v-model自动处理
const toggleItemSelection = (item: CartItem) => {
  // 函数保留但为空，因为我们将依赖v-model自动处理
  console.log(`商品 ${item.id} 状态变更为: ${item.selected}`);
};

// 全选/取消全选 - 修复切换逻辑
const toggleAllSelection = () => {
  // 获取当前全选状态的反向值
  const newState = !allSelected.value;
  // 将所有商品设置为相同的选中状态
  cartItems.value.forEach(item => {
    item.selected = newState;
  });
};

// 批量删除选中商品
const batchDeleteSelected = () => {
  cartItems.value = cartItems.value.filter(item => !item.selected);
};

// 计算选中商品的总价
const calculateTotal = () => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);
};

// 计算总优惠金额
const calculateDiscount = () => {
  return cartItems.value
    .filter(item => item.selected && item.originalPrice)
    .reduce((sum, item) => sum + (item.originalPrice! - item.price) * item.quantity, 0)
    .toFixed(2);
};

// 是否符合包邮条件
const isFreeShipping = computed(() => {
  const total = parseFloat(calculateTotal());
  return total >= 99; // 满99包邮
});

// 计算运费
const calculateShipping = () => {
  if (isFreeShipping.value) {
    return '0.00';
  }
  return '12.00'; // 默认运费
};

// 计算最终支付金额
const calculateFinalTotal = () => {
  const total = parseFloat(calculateTotal());
  const shipping = isFreeShipping.value ? 0 : 12;
  return (total + shipping).toFixed(2);
};
</script>

<template>
  <div class="cart-container">
    <Header class="fixed-header" />
    <div class="cart-content">
      <div class="cart-title">
        <h2>我的购物车</h2>
        <span class="cart-count">{{ cartItems.length }} 件商品</span>
      </div>
      
      <div class="cart-main">
        <div class="cart-header">
          <div class="checkbox-cell">
            <input type="checkbox" id="select-all" v-model="allSelected" @change="toggleAllSelection" />
            <label for="select-all">全选</label>
          </div>
          <span class="product-cell">商品信息</span>
          <span class="price-cell">单价</span>
          <span class="quantity-cell">数量</span>
          <span class="subtotal-cell">小计</span>
          <span class="action-cell">操作</span>
        </div>
        
        <div class="cart-items">
          <div v-if="cartItems.length === 0" class="empty-cart">
            <div class="empty-cart-icon">🛒</div>
            <p>购物车空空如也，去添加一些商品吧！</p>
            <button class="shop-now-btn">去逛逛</button>
          </div>
          
          <div v-else class="cart-item" v-for="item in cartItems" :key="item.id" :class="{ 'selected': item.selected }">
            <div class="checkbox-cell">
              <!-- 移除@change事件监听器，让v-model单独工作 -->
              <input 
                type="checkbox" 
                :id="`item-${item.id}`" 
                v-model="item.selected" 
              />
              <label :for="`item-${item.id}`"></label>
            </div>
            
            <div class="product-cell">
              <img :src="item.image" alt="商品图片" class="item-image" />
              <div class="item-details">
                <div class="item-title">{{ item.title }}</div>
              </div>
            </div>
            
            <div class="price-cell">
              <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
            </div>
            
            <div class="quantity-cell">
              <div class="item-quantity">
                <button type="button" class="quantity-btn" @click.stop.prevent="decreaseQuantity(item)">-</button>
                <input type="number" v-model="item.quantity" min="1" readonly />
                <button type="button" class="quantity-btn" @click.stop.prevent="increaseQuantity(item)">+</button>
              </div>
            </div>
            
            <div class="subtotal-cell">
              <span class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              <div v-if="item.discount" class="discount-tag">{{ item.discount }}</div>
              <div v-if="item.originalPrice" class="original-price">原价: ¥{{ (item.originalPrice * item.quantity).toFixed(2) }}</div>
            </div>
            
            <div class="action-cell">
              <button class="delete-btn" @click.stop.prevent="removeItem(item.id)">
                <span class="delete-icon">×</span>
                <span class="delete-text">删除</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="cart-footer">
        <div class="footer-right">
          <div class="total-info">
            <div class="selected-count">已选择 <span>{{ selectedCount }}</span> 件商品</div>
            <div class="discount-info" v-if="parseFloat(calculateDiscount()) > 0">
              优惠: <span class="discount-value">-¥{{ calculateDiscount() }}</span>
            </div>
            <div class="shipping-info">
              运费: <span :class="{'free-shipping': isFreeShipping}">
                {{ isFreeShipping ? '包邮' : '¥' + calculateShipping() }}
              </span>
              <span class="shipping-tip" v-if="!isFreeShipping">
                (满99元包邮，还差¥{{ (99 - parseFloat(calculateTotal())).toFixed(2) }})
              </span>
            </div>
            <div class="total-price">
              合计: <span>¥{{ calculateFinalTotal() }}</span>
            </div>
          </div>
          <button class="checkout-btn" :disabled="selectedCount === 0" :class="{'pulse': selectedCount > 0}">
            <div class="btn-content">
              <span>去结算</span>
              <span class="checkout-arrow">→</span>
            </div>
            <div class="btn-background"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  min-height: 100vh;
  background-color: #f9f9f9;
  width: 100%;
  padding-bottom: 30px;
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

.cart-content {
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  margin: 80px auto 0;
  padding: 0 20px;
}

.cart-title {
  display: flex;
  align-items: baseline;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.cart-title h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
  position: relative;
  padding-left: 15px;
}

.cart-title h2::before {
  content: "";
  position: absolute;
  left: 0;
  top: 5px;
  bottom: 5px;
  width: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  border-radius: 2px;
}

.cart-count {
  color: #999;
  font-size: 14px;
  margin-left: 10px;
}

.cart-main {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
  padding: 0 0 10px 0;
}

.cart-header {
  display: grid;
  grid-template-columns: 60px 3fr 1fr 1.5fr 1fr 0.8fr;
  gap: 10px;
  padding: 15px;
  background-color: #f9f9f9;
  font-weight: 500;
  color: #666;
  border-bottom: 1px solid #eee;
}

.cart-items {
  display: flex;
  flex-direction: column;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-cart-icon {
  font-size: 50px;
  margin-bottom: 15px;
  color: #ddd;
}

.empty-cart p {
  color: #999;
  margin-bottom: 20px;
}

.shop-now-btn {
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

.shop-now-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

.cart-item {
  display: grid;
  grid-template-columns: 60px 3fr 1fr 1.5fr 1fr 0.8fr;
  gap: 10px;
  align-items: center;
  padding: 20px 15px;
  border-bottom: none;
  transition: all 0.3s ease;
  margin: 10px 15px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 107, 107, 0.1);
  position: relative;
  overflow: hidden;
}

.cart-item::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(to bottom, #ff6b6b, #ff9e7d);
  border-radius: 2px 0 0 2px;
}

.cart-item:hover {
  background-color: #fffaf9;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.1);
  transform: translateY(-2px);
}

.cart-item.selected {
  background-color: #fff9f9;
  border-color: rgba(255, 107, 107, 0.3);
  box-shadow: 0 3px 10px rgba(255, 107, 107, 0.15);
}

.checkbox-cell {
  display: flex;
  align-items: center;
}

.checkbox-cell input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  /* 自定义复选框样式 */
  appearance: none;
  -webkit-appearance: none;
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  margin: 0;
  padding: 0;
  transition: all 0.2s ease;
  position: relative;
  z-index: 10;
  pointer-events: all; /* 确保指针事件 */
}

.checkbox-cell input[type="checkbox"]:checked {
  background-color: #ff6b6b;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
}

.checkbox-cell input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 6px;
  width: 3px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-cell input[type="checkbox"]:hover {
  border-color: #ff9e7d;
  box-shadow: 0 0 0 2px rgba(255, 158, 125, 0.2);
}

.checkbox-cell label {
  margin-left: 5px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-image {
  width: 80px;
  height: 110px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  background-color: #fff;
}

.cart-item:hover .item-image {
  transform: translateY(-3px) rotate(1deg);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.3s ease;
}

.cart-item:hover .item-title {
  color: #ff6b6b;
}

.price-cell, .subtotal-cell {
  font-weight: 500;
}

.item-price {
  color: #666;
}

.item-subtotal {
  color: #ff6b6b;
  font-size: 16px;
  display: block;
}

.discount-tag {
  display: inline-block;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 5px;
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 5px rgba(255, 107, 107, 0.2);
  animation: pulse 2s infinite;
}

.original-price {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
  margin-top: 3px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.quantity-cell {
  display: flex;
  justify-content: center;
}

.item-quantity {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  width: 120px;
  height: 36px;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  background-color: #f5f5f5;
  border: none;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  user-select: none;
  position: relative;
  z-index: 2;
}

.quantity-btn:hover {
  background-color: #ff6b6b;
  color: white;
  transform: translateY(-1px);  /* 轻微上浮效果 */
  box-shadow: 0 3px 8px rgba(255, 107, 107, 0.3);  /* 添加阴影增强反馈感 */
}

.quantity-btn:active {
  background-color: #ff5252;
  transform: scale(0.95);
  box-shadow: 0 1px 3px rgba(255, 107, 107, 0.2);  /* 按下时减小阴影 */
}

.item-quantity input {
  width: 48px;
  height: 36px;
  text-align: center;
  border: none;
  outline: none;
  font-size: 15px;
  background: white;
}

.action-cell {
  text-align: center;
}

.delete-btn {
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  padding: 7px 15px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
}

.delete-icon {
  font-size: 16px;
}

.delete-btn:hover {
  color: #fff;
  background-color: #ff6b6b;
  border-color: #ff6b6b;
  box-shadow: 0 3px 8px rgba(255, 107, 107, 0.3);
}

.cart-footer {
  display: flex;
  justify-content: flex-end; /* 改为右对齐 */
  align-items: center;
  padding: 18px 25px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  position: sticky;  /* 使结算栏固定 */
  bottom: 20px;  /* 距离底部距离 */
  z-index: 100;  /* 确保在其他元素上方 */
  margin-top: 15px;  /* 与上方内容保持一定距离 */
  animation: slideUp 0.3s ease;  /* 添加出现动画 */
  transition: all 0.3s ease;
}

.cart-footer:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-info {
  text-align: right;
  min-width: 220px;
}

.selected-count {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.selected-count span {
  color: #ff6b6b;
  font-weight: 500;
}

.discount-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.discount-value {
  color: #ff6b6b;
  font-weight: 500;
}

.shipping-info {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.free-shipping {
  color: #67C23A;
  font-weight: 500;
  background-color: rgba(103, 194, 58, 0.1);
  padding: 1px 6px;
  border-radius: 10px;
}

.shipping-tip {
  font-size: 12px;
  color: #ff9e7d;
  margin-left: 5px;
}

.total-price {
  font-size: 16px;
  color: #333;
  margin-top: 8px;
  font-weight: 500;
}

.total-price span {
  color: #ff6b6b;
  font-size: 22px;
  font-weight: bold;
}

.checkout-btn {
  position: relative;
  overflow: hidden;
  background: transparent;
  color: white;
  border: none;
  padding: 0;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.25);
  min-width: 160px;
  height: 52px;
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 0 20px;
  z-index: 2;
}

.btn-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #ff6b6b, #ff9e7d);
  z-index: 1;
  transition: all 0.4s ease;
}

.checkout-btn:hover .btn-background {
  background: linear-gradient(45deg, #ff5252, #ff8a65);
}

.checkout-btn:hover {
  box-shadow: 0 7px 25px rgba(255, 107, 107, 0.4);
  transform: translateY(-3px);
}

.checkout-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.checkout-btn:disabled {
  background: none;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.checkout-btn:disabled .btn-background {
  background: linear-gradient(45deg, #cccccc, #dddddd);
}

.checkout-arrow {
  font-size: 18px;
  transition: transform 0.3s ease;
  display: inline-block;
}

.checkout-btn:hover .checkout-arrow {
  transform: translateX(5px);
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
}

.checkout-btn.pulse {
  animation: pulse 2s infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-header {
    grid-template-columns: 40px 3fr 1fr 1fr 0.5fr;
  }
  
  .cart-item {
    grid-template-columns: 40px 3fr 1fr 1fr 0.5fr;
    padding: 15px 10px;
    margin: 8px 10px;
  }
  
  .price-cell {
    display: none;
  }
  
  .item-image {
    width: 60px;
  }

  .cart-footer {
    border-radius: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    padding: 10px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .total-info {
    min-width: 180px;
  }
  
  .shipping-tip {
    display: block;
    margin-left: 0;
    margin-top: 2px;
  }

  .checkout-btn {
    min-width: 140px;
    height: 48px;
    font-size: 15px;
  }
}
</style>