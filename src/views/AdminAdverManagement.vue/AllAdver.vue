<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import AddAdverModal from './AddAdver.vue';
import EditAdverModal from './EditAdver.vue'; 

const router = useRouter();

const advertisements = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const showDeleteModal = ref(false);
const adverToDelete = ref<any>(null);
const showAddAdverModal = ref(false);
const showEditAdverModal = ref(false); 
const currentEditAdver = ref<any>(null); 

const currentPage = ref(1);
const itemsPerPage = 12;

// 成功提示相关
const successMessage = ref<string>('')
const successDescription = ref<string>('')

// 计算当前页显示的广告
const paginatedAdverts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return advertisements.value.slice(start, end);
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(advertisements.value.length / itemsPerPage);
});

// 切换到上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// 切换到下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// 获取广告列表数据
const fetchAdverts = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      console.error('未找到token，用户可能未登录');
      return;
    }
    
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/advertisements`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    // 兼容处理不同类型的状态码
    const isSuccess = response.data && response.data.code === '200';

    if (isSuccess) {
      // 处理API返回的广告数据
      console.log('Received advertisements:', response.data.data);
      advertisements.value = response.data.data.map((item: any) => {
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          image: item.imageUrl,
          imageName: item.imageName,
          productId: item.productId || ''
        };
      });
    } else {
      error.value = '获取数据失败: ' + (response.data ? response.data.msg || '未知错误' : '服务器响应格式错误');
    }
  } catch (err: any) {
    console.error('获取广告列表出错:', err);
    // 区分网络错误和认证错误
    if (err.response && err.response.status === 401) {
      error.value = '认证失败，请重新登录';
    } else {
      error.value = `网络请求错误: ${err.message || '未知错误'}`;
    }
  } finally {
    loading.value = false;
  }
};

// 跳转到广告详情
const goToDetail = (adverId: number) => {
  router.push({
    name: 'AdverDetail',
    params: { id: adverId.toString() }
  });
}

// 打开新增广告弹窗
const openAddAdverModal = () => {
  showAddAdverModal.value = true;
};

// 关闭新增广告弹窗
const closeAddAdverModal = () => {
  showAddAdverModal.value = false;
};

// 处理广告添加成功
const handleAdverAdded = (adverData: any) => {
  // 广告添加成功后重新获取广告列表
  fetchAdverts();
};

// 打开编辑广告弹窗
const openEditAdverModal = (event: Event, adver: any) => {
  event.stopPropagation(); // 阻止事件冒泡，避免触发卡片的点击事件
  console.log('Opening edit modal with data:', adver); // 添加日志
  currentEditAdver.value = adver; // 存储完整的广告数据
  showEditAdverModal.value = true;
}

// 关闭编辑广告弹窗
const closeEditAdverModal = () => {
  showEditAdverModal.value = false;
  currentEditAdver.value = null;
}

// 显示删除确认框
const showDeleteConfirm = (event: Event, adver: any) => {
  event.stopPropagation(); // 阻止事件冒泡
  adverToDelete.value = adver;
  showDeleteModal.value = true;
}

// 删除广告
const deleteAdver = async () => {
  if (!adverToDelete.value) return;

  console.log('准备删除广告:', adverToDelete.value);

  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      error.value = '您尚未登录或登录已过期，请重新登录';
      return;
    }

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/advertisements/${adverToDelete.value.id}`;

    const response = await axios.delete(apiUrl, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });

    // 兼容处理不同类型的状态码
    const isSuccess = response.data && 
                     (response.data.code === 200 || response.data.code === '200');

    if (isSuccess) {
      // 从列表中移除已删除的广告
      advertisements.value = advertisements.value.filter(item => item.id !== adverToDelete.value.id);
    } else {
      error.value = response.data.msg || '删除失败';
    }
  } catch (err: any) {
    console.error('删除广告出错:', err);
    error.value = `删除失败: ${err.message || '未知错误'}`;
  } finally {
    // 无论成功或失败都关闭弹窗
    showDeleteModal.value = false;
    adverToDelete.value = null;
  }
}

// 取消删除
const cancelDelete = () => {
  showDeleteModal.value = false;
  adverToDelete.value = null;
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAdverts();
});
</script>

<template>
  <div class="all-advers-container">
    <div class="all-advers-header">
      <h2>广告管理</h2>
      <button class="add-adver-btn" @click="openAddAdverModal">
        <i class="plus-icon">+</i> 新增广告
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
      <button @click="fetchAdverts" class="retry-btn">重试</button>
    </div>
    
    <!-- 广告列表 -->
    <div v-else class="all-advers-list">
      <div v-for="adver in paginatedAdverts" 
           :key="adver.id" 
           class="adver-card"
           @click="goToDetail(adver.id)">
        <div class="adver-image">
          <img :src="adver.image" :alt="adver.title">
          <div class="hover-info">
            <span>查看详情</span>
          </div>
        </div>
        <div class="adver-details">
          <h3 class="adver-title" :title="adver.title">{{ adver.title }}</h3>
          
          <!-- 广告描述 -->
          <div class="adver-description">
            <p :title="adver.content">{{ adver.content }}</p>
          </div>
          
          <!-- 产品信息 -->
          <div class="adver-info">
            <div class="adver-badge">
              <span class="adver-badge-text">产品ID: {{ adver.productId || '无' }}</span>
            </div>
          </div>
          
          <div class="adver-actions admin-actions">
            <div class="edit-btn" @click="openEditAdverModal($event, adver)">
              <img src="/src/assets/icons/edit-box-fill.svg" alt="编辑" class="action-icon">
              编辑
            </div>
            <div class="delete-btn" @click="showDeleteConfirm($event, adver)">
              <img src="/src/assets/icons/delete-bin-6-fill.svg" alt="删除" class="action-icon">
              删除
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页控件 -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="prevPage">上一页</button>
      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteModal" class="delete-modal-overlay" @click="cancelDelete">
      <div class="delete-modal" @click.stop>
        <div class="delete-modal-icon">🗑️</div>
        <h3>确认删除</h3>
        <p>您确定要删除广告"{{ adverToDelete?.title }}"?</p>
        <p class="warning-text">此操作不可撤销</p>
        <div class="delete-modal-actions">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="confirm-delete-btn" @click="deleteAdver">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 新增广告弹窗 -->
    <AddAdverModal 
      v-if="showAddAdverModal"
      @close="closeAddAdverModal"
      @adver-added="handleAdverAdded"
    />

    <!-- 编辑广告弹窗 -->
    <div v-if="showEditAdverModal" class="edit-modal-overlay" @click="closeEditAdverModal">
      <div class="edit-modal-container" @click.stop>
        <EditAdverModal
          v-if="currentEditAdver"
          :adverId="currentEditAdver.id"
          :adverData="currentEditAdver"
          @save="fetchAdverts" 
          @close="closeEditAdverModal"
        />
      </div>
    </div>

    <!-- 成功提示样式 -->
    <div v-if="successMessage" class="success-toast">
      <div class="success-icon">✅</div>
      <div class="success-content">
        <h3>{{ successMessage }}</h3>
        <p>{{ successDescription }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.all-advers-container {
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

.all-advers-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
}

.all-advers-header {
  padding: 25px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.all-advers-header h2 {
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

.all-advers-header h2::after {
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

.add-adver-btn {
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

.add-adver-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.add-adver-btn:active {
  transform: translateY(-1px);
}

.add-adver-btn:hover .plus-icon {
  transform: translateX(2px);
}

.plus-icon {
  font-size: 18px;
  font-style: normal;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.all-advers-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 30px 0;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.8s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.adver-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: white;
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  height: 100%;
  animation: cardFloat 0.6s ease-out backwards;
  min-height: 380px;
  display: flex;
  flex-direction: column;
}

@keyframes cardFloat {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 为卡片添加交错动画效果 */
.all-advers-list > div:nth-child(1) { animation-delay: 0.1s; }
.all-advers-list > div:nth-child(2) { animation-delay: 0.2s; }
.all-advers-list > div:nth-child(3) { animation-delay: 0.3s; }
.all-advers-list > div:nth-child(4) { animation-delay: 0.4s; }
.all-advers-list > div:nth-child(5) { animation-delay: 0.5s; }
.all-advers-list > div:nth-child(6) { animation-delay: 0.6s; }
.all-advers-list > div:nth-child(7) { animation-delay: 0.7s; }
.all-advers-list > div:nth-child(8) { animation-delay: 0.8s; }
.all-advers-list > div:nth-child(9) { animation-delay: 0.9s; }
.all-advers-list > div:nth-child(10) { animation-delay: 1.0s; }
.all-advers-list > div:nth-child(11) { animation-delay: 1.1s; }
.all-advers-list > div:nth-child(12) { animation-delay: 1.2s; }

.adver-image {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #fff6f6 0%, #ffefef 100%);
  padding: 15px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 160px;
}

.adver-image img {
  height: 140px;
  width: auto;
  max-width: 85%;
  object-fit: contain;
  transition: transform 0.5s ease;
  filter: drop-shadow(0 6px 12px rgba(255, 107, 107, 0.2));
  z-index: 2;
}

.hover-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,107,107,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateY(20px);
  z-index: 3;
}

.adver-card:hover .hover-info {
  opacity: 1;
  transform: translateY(0);
}

.adver-card:hover .adver-image img {
  transform: scale(1.08);
}

.adver-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: white;
  position: relative;
  justify-content: space-between;
}

.adver-details::before {
  content: "";
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,107,107,0), rgba(255,107,107,0.3), rgba(255,107,107,0));
}

.adver-title {
  position: relative;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #333;
  transition: color 0.3s;
  margin-bottom: 5px;
  margin-top: 3px;
}

.adver-title::before {
  display: none; /* 完全隐藏标题前的圆点 */
}

.adver-card:hover .adver-title {
  color: #ff6b6b;
}

/* 广告描述样式 */
.adver-description {
  position: relative;
  margin-bottom: 10px;
  line-height: 1.5;
  color: #555;
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 65px;
}

.adver-description::before {
  display: none; /* 完全隐藏内容前的圆点 */
}

.adver-description p {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  max-height: 4.5em;
  font-size: 14px;
  color: #666;
}

/* 广告信息样式 */
.adver-info {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  width: 100%;
  margin-top: auto;
  padding-top: 0;
}

.adver-badge {
  flex: 1;
  padding: 7px 10px;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  background-color: #fff0f0;
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  height: 35px;
}
.adver-badge-text{
    font-weight: bold;
}
.adver-badge::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%);
  z-index: 1;
}

.adver-badge span, .adver-badge i {
  position: relative;
  z-index: 2;
}

/* 删除product-icon样式，因为我们已经移除了该元素 */
.product-icon {
  display: none;
}

.adver-card:hover .adver-badge {
  background-color: #ffe8e8;
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.15);
  transform: translateY(-2px);
}

/* 修改管理员操作按钮样式 */
.admin-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  width: 100%;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 7px 8px;
  border-radius: 18px;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.action-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.edit-btn {
  background: #f2f2f2;
  color: #444;
  border: 1px solid rgba(0,0,0,0.05);
}

.edit-btn:hover {
  background: #ebebeb;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  color: #ff6b6b;
}

.delete-btn {
  background: #f2f2f2;
  color: #444;
  border: 1px solid rgba(0,0,0,0.05);
}

.delete-btn:hover {
  background: #ebebeb;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  color: #ff6b6b;
}

/* 删除确认弹窗 */
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

.warning-text {
  color: #ff6b6b;
  font-size: 15px;
  font-weight: 500;
  padding: 10px 20px;
  background-color: rgba(255, 107, 107, 0.08);
  border-radius: 15px;
  margin: 15px 0;
  display: inline-block;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
  animation: fadeIn 0.8s;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 107, 107, 0.1);
  border-left-color: #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.error-state p {
  color: #ff6b6b;
  margin-bottom: 25px;
  font-size: 18px;
  max-width: 600px;
}

.retry-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
}

.retry-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
  animation: fadeIn 1s 0.3s both;
}

.pagination button {
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
}

.pagination button:disabled {
  background: #f0f0f0;
  color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.pagination button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

.pagination span {
  font-size: 15px;
  color: #555;
  font-weight: 500;
}

@media (max-width: 768px) {
  .all-advers-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .add-adver-btn {
    width: 100%;
    justify-content: center;
  }
  
  .all-advers-list {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
  
  .adver-image {
    height: 160px;
  }
  
  .adver-image img {
    height: 140px;
  }
  
  .adver-title {
    font-size: 14px;
    height: 40px;
  }
  
  .adver-details {
    padding: 15px;
  }
}

/* 添加编辑弹窗样式 */
.edit-modal-overlay {
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

.edit-modal-container {
  width: 98%;
  max-width: 1400px;
  max-height: 95vh;
  overflow-y: auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.3s ease;
}

/* 删除不需要的标签样式 */
.adver-label {
  display: none;
}

.label-section {
  display: none;
}

.adver-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(255, 107, 107, 0.15);
  border-color: rgba(255, 107, 107, 0.2);
}

/* 成功提示样式 */
.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  animation: slideIn 0.3s ease;
  pointer-events: none;
}

.success-icon {
  width: 32px;
  height: 32px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.success-content h3 {
  margin: 0;
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 600;
}

.success-content p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #666;
}

.fade-out {
  animation: fadeOut 0.3s ease forwards;
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
</style>