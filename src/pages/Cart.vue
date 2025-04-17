<script setup lang="ts">
import Header from '@/views/HomePage/Header.vue'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router' // 引入 router

// 初始化 router
const router = useRouter()

// 购物车项类型定义，根据后端返回调整
interface CartItem {
  id: number | string;  // cartItemId
  productId: string;    // 产品ID
  image: string;        // 从productInfo中获取封面
  title: string;        // 从productInfo中获取标题
  price: number;        // 现价
  originalPrice: number;// 原价
  quantity: number;     // 数量
  selected: boolean;    // 选中状态（前端维护）
}

// 使用ref创建响应式数据
const cartItems = ref<CartItem[]>([]);
const loading = ref(false);
const error = ref('');
const updatingItems = ref<Set<number | string>>(new Set()); // 跟踪正在更新的商品
const showDeleteModal = ref(false); // 控制删除确认弹窗显示
const itemToDelete = ref<CartItem | null>(null); // 要删除的购物车项

// 获取购物车数据
const fetchCartItems = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      return;
    }
    
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/cart`,
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.code === '200') {
      // 处理API返回的数据
      const cartData = response.data.data.items || [];
      
      cartItems.value = cartData.map((item: any) => {
        // 确保有productInfo，若无则提供默认值
        const productInfo = item.productInfo || {};
        
        return {
          id: item.cartItemId || item.id, // 使用cartItemId作为购物车项ID
          productId: item.productId || '',
          image: productInfo.cover || '/src/assets/logo.png', // 使用第一张图片作为封面
          title: productInfo.title || '未知商品',
          price: parseFloat(productInfo.price) || 0,
          originalPrice: parseFloat(productInfo.originalPrice) || 0,
          quantity: item.quantity || 1,
          selected: false // 默认不选中
        };
      });
      
      console.log('购物车数据:', cartItems.value);
    } else {
      error.value = response.data?.msg || '获取购物车数据失败';
    }
  } catch (err: any) {
    console.error('获取购物车出错:', err);
    error.value = err.message || '网络请求失败';
  } finally {
    loading.value = false;
  }
};

// 更新购物车项数量
const updateCartItemQuantity = async (itemId: number | string, newQuantity: number) => {
  if (updatingItems.value.has(itemId)) return; // 如果正在更新，则跳过

  updatingItems.value.add(itemId);
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      return;
    }
    
    const response = await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL}/api/cart/${itemId}`,
      { quantity: newQuantity },
      {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.code === '200') {
      console.log(`商品 ${itemId} 数量更新成功: ${newQuantity}`);
    } else {
      console.error('更新购物车数量失败:', response.data?.msg);
      // 恢复之前的数量，在UI上反馈更新失败
      const item = cartItems.value.find(item => item.id === itemId);
      if (item) {
        item.quantity = item.quantity; // 保持原来的值
      }
    }
  } catch (err: any) {
    console.error('更新购物车数量出错:', err);
    // 恢复之前的数量
    const item = cartItems.value.find(item => item.id === itemId);
    if (item) {
      item.quantity = item.quantity; // 保持原来的值
    }
  } finally {
    updatingItems.value.delete(itemId);
  }
};

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
    updateCartItemQuantity(item.id, item.quantity);
  }
};

// 增加数量方法
const increaseQuantity = (item: CartItem) => {
  if (item.quantity < 99) {
    item.quantity++;
    updateCartItemQuantity(item.id, item.quantity);
  }
};

// 显示删除确认框
const showDeleteConfirm = (event: Event, item: CartItem) => {
  event.stopPropagation(); // 阻止事件冒泡
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

// 取消删除
const cancelDelete = () => {
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

// 删除购物车项
const removeItem = async () => {
  if (!itemToDelete.value) return;

  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      return;
    }

    const cartItemId = itemToDelete.value.id;
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/cart/${cartItemId}`;

    const response = await axios.delete(apiUrl, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.code === '200') {
      // 删除成功，从列表中移除
      cartItems.value = cartItems.value.filter(item => item.id !== cartItemId);
      console.log(`成功删除购物车商品 ${cartItemId}`);
    } else {
      console.error('删除购物车商品失败:', response.data?.msg);
      error.value = response.data?.msg || '删除失败';
    }
  } catch (err: any) {
    console.error('删除购物车商品出错:', err);
    error.value = `删除失败: ${err.message || '未知错误'}`;
  } finally {
    // 无论成功或失败都关闭弹窗
    showDeleteModal.value = false;
    itemToDelete.value = null;
  }
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
    .filter(item => item.selected && item.originalPrice > item.price)
    .reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0)
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

// 计算折扣百分比
const calculateDiscountPercentage = (price: number, originalPrice: number) => {
  if (originalPrice <= 0 || price >= originalPrice) return null;
  
  // 计算折扣比例
  const ratio = price / originalPrice;
  
  // 如果折扣比例大于0.95（即大于9.5折），则不显示折扣
  if (ratio > 0.95) return null;
  
  // 返回折扣，四舍五入到整数
  return Math.round(ratio * 10);
};

// 跳转到商品详情页
const goToDetail = (event: Event, productId: string) => {
  // 防止触发其他点击事件（如复选框）
  event.stopPropagation()
  
  if (productId) {
    router.push({
      name: 'Detail',
      params: { id: productId.toString() }
    })
  }
};

// 组件挂载时获取购物车数据
onMounted(() => {
  fetchCartItems();
});
</script>

<template>
  <div class="cart-container">
    <Header class="fixed-header" />
    <div class="cart-content">
      <div class="cart-title">
        <h2>我的购物车</h2>
        <span class="cart-count">{{ cartItems.length }} 件商品</span>
      </div>
      
      <!-- 添加加载状态显示 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载购物车数据...</p>
      </div>
      
      <!-- 添加错误状态显示 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchCartItems" class="retry-btn">重试</button>
      </div>
      
      <div v-else class="cart-main">
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
            <button class="shop-now-btn" @click="$router.push('/homepage')">去逛逛</button>
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
            
            <!-- 添加点击事件，但只应用于商品信息区域 -->
            <div class="product-cell" @click="goToDetail($event, item.productId)">
              <img :src="item.image" alt="商品图片" class="item-image" />
              <div class="item-details">
                <div class="item-title">{{ item.title }}</div>
              </div>
            </div>
            
            <div class="price-cell">
              <span class="item-price">¥{{ item.originalPrice.toFixed(2) }}</span>
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
              <!-- 修改显示逻辑：只要原价和现价不同就显示原价，但折扣标签只在明显折扣时显示 -->
              <template v-if="item.originalPrice > item.price">
                <!-- 折扣标签只在折扣明显时显示 -->
                <div class="discount-tag" v-if="calculateDiscountPercentage(item.price, item.originalPrice)">
                  限时{{ calculateDiscountPercentage(item.price, item.originalPrice) }}折
                </div>
                <!-- 原价总是在不相等时显示 -->
                <div class="original-price">原价: ¥{{ (item.originalPrice * item.quantity).toFixed(2) }}</div>
              </template>
            </div>
            
            <div class="action-cell">
              <button class="delete-btn" @click.stop.prevent="showDeleteConfirm($event, item)">
                <img src="/src/assets/icons/delete-bin-6-fill.svg" alt="删除" class="delete-icon" />
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
              合计: <span>
                ¥{{ selectedCount === 0 ? '0.00' : calculateFinalTotal() }}
              </span>
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

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="delete-modal-overlay" @click="cancelDelete">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-icon">🗑️</div>
        <h3>确认删除</h3>
        <p>您确定要将《{{ itemToDelete?.title }}》从购物车中移除吗？</p>
        <div class="delete-modal-actions">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="confirm-delete-btn" @click="removeItem">确认删除</button>
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
  gap: 30px; 
  cursor: pointer; /* 添加手型光标 */
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
  width: 16px;
  height: 16px;
  color: currentColor; /* 确保图标颜色跟随按钮文字颜色 */
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
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 0;
  width: auto; /* 让宽度自适应内容 */
}

.total-price span {
  color: #ff6b6b;
  font-size: 22px;
  font-weight: bold;
  margin-left: 5px;
  white-space: nowrap; /* 防止文本换行 */
  display: inline; /* 改为内联显示 */
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

/* 添加加载和错误状态的样式 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  text-align: center;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 107, 107, 0.1);
  border-left-color: #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state p {
  color: #ff6b6b;
  margin-bottom: 15px;
  font-size: 16px;
}

.retry-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.retry-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
  transform: translateY(-2px);
}

/* 删除确认弹窗样式 */
.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(3px);
}

.delete-modal {
  background: linear-gradient(135deg, #fff 0%, #f9f9f9 100%);
  border-radius: 20px;
  padding: 35px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: scaleIn 0.4s ease;
  text-align: center;
  border: 1px solid rgba(255, 107, 107, 0.1);
}

.delete-modal-icon {
  font-size: 50px;
  margin-bottom: 20px;
  animation: wobble 1s;
  display: inline-block;
}

@keyframes wobble {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-15px) rotate(-5deg); }
  30% { transform: translateX(10px) rotate(3deg); }
  45% { transform: translateX(-10px) rotate(-3deg); }
  60% { transform: translateX(5px) rotate(2deg); }
  75% { transform: translateX(-5px) rotate(-1deg); }
}

.delete-modal h3 {
  margin: 0 0 15px;
  color: #ff6b6b;
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.delete-modal p {
  color: #555;
  line-height: 1.6;
  font-size: 16px;
  margin-bottom: 10px;
}

.delete-modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.cancel-btn, .confirm-delete-btn {
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.cancel-btn {
  background: #f2f2f2;
  color: #555;
  border: 1px solid rgba(0,0,0,0.05);
}

.cancel-btn:hover {
  background: #e8e8e8;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.confirm-delete-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.confirm-delete-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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