<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import { ref } from 'vue'

// 购物车项类型定义
interface CartItem {
  id: number;
  image: string;
  title: string;
  price: number;
  quantity: number;
}

// 使用ref创建响应式数据
const cartItems = ref<CartItem[]>([
  {
    id: 1,
    image: '/src/assets/images/BookTemplate.avif',
    title: '智慧的疆界',
    price: 69,
    quantity: 1,
  },
  {
    id: 2,
    image: '/src/assets/logo.png',
    title: '小王子',
    price: 49,
    quantity: 1,
  },
]);

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

// 计算总金额
const calculateTotal = () => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
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
            <input type="checkbox" id="select-all" />
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
          
          <div v-else class="cart-item" v-for="item in cartItems" :key="item.id">
            <div class="checkbox-cell">
              <input type="checkbox" :id="`item-${item.id}`" />
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
        <div class="footer-left">
          <input type="checkbox" id="footer-select-all" />
          <label for="footer-select-all">全选</label>
          <button class="batch-delete-btn">批量删除</button>
        </div>
        
        <div class="footer-right">
          <div class="total-info">
            <div class="selected-count">已选择 <span>{{ cartItems.length }}</span> 件商品</div>
            <div class="total-price">
              合计: <span>¥{{ calculateTotal() }}</span>
            </div>
          </div>
          <button class="checkout-btn">
            <span>去结算</span>
            <span class="checkout-arrow">→</span>
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
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.cart-item:hover {
  background-color: #f9f9f9;
}

.checkbox-cell {
  display: flex;
  align-items: center;
}

.checkbox-cell input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #ff6b6b;
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
  border-radius: 6px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  background-color: #fff;
}

.cart-item:hover .item-image {
  transform: translateY(-3px);
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
}

.quantity-cell {
  display: flex;
  justify-content: center;
}

.item-quantity {
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 4px;
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
  transition: all 0.2s;
  color: #666;
  user-select: none;
  position: relative;
  z-index: 2;
}

.quantity-btn:hover {
  background-color: #eee;
  color: #ff6b6b;
}

.quantity-btn:active {
  background-color: #e0e0e0;
  transform: scale(0.95);
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
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
  padding: 5px 10px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.delete-icon {
  font-size: 16px;
}

.delete-btn:hover {
  color: #ff6b6b;
  background-color: #fff0f0;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.batch-delete-btn {
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 14px;
}

.batch-delete-btn:hover {
  color: #ff6b6b;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-info {
  text-align: right;
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

.total-price {
  font-size: 16px;
  color: #333;
}

.total-price span {
  color: #ff6b6b;
  font-size: 22px;
  font-weight: bold;
}

.checkout-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

.checkout-arrow {
  font-size: 18px;
  transition: transform 0.2s;
}

.checkout-btn:hover .checkout-arrow {
  transform: translateX(3px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-header {
    grid-template-columns: 40px 3fr 1fr 1fr 0.5fr;
  }
  
  .cart-item {
    grid-template-columns: 40px 3fr 1fr 1fr 0.5fr;
    padding: 15px 10px;
  }
  
  .price-cell {
    display: none;
  }
  
  .item-image {
    width: 60px;
    height: 80px;
  }
  
  .cart-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .footer-left, .footer-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .total-info {
    text-align: left;
  }
}

@media (max-width: 576px) {
  .cart-header {
    grid-template-columns: 30px 2fr 1fr 0.5fr;
  }
  
  .cart-item {
    grid-template-columns: 30px 2fr 1fr 0.5fr;
  }
  
  .quantity-cell {
    display: none;
  }
  
  .delete-text {
    display: none;
  }
  
  .item-image {
    width: 50px;
    height: 70px;
  }
}
</style>