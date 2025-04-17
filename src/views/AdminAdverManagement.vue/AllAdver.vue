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

    if (response.data && response.data.code === '200') {
      // 处理API返回的数据格式
      advertisements.value = response.data.data.map((item: any) => {
        return {
          id: item.id,
          title: item.title,
          image: item.imageUrl || '/src/assets/logo.png',
          link: item.link || '#',
          position: item.position || '未指定',
          startTime: item.startTime ? new Date(item.startTime).toLocaleDateString() : '未指定',
          endTime: item.endTime ? new Date(item.endTime).toLocaleDateString() : '未指定',
          status: item.status || 'inactive',
          description: item.description || '暂无描述'
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
  currentEditAdver.value = adver.id; // 只存储广告ID
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

    if (response.data && response.data.code === '200') {
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
        <div class="ribbon" v-if="adver.status === 'active'">正在展示</div>
        <div class="adver-image">
          <img :src="adver.image" :alt="adver.title">
          <div class="hover-info">
            <span>查看详情</span>
          </div>
        </div>
        <div class="adver-details">
          <h3 class="adver-title">{{ adver.title }}</h3>
          
          <!-- 广告信息 -->
          <div class="adver-info">
            <div class="adver-badge">
              位置: {{ adver.position }}
            </div>
            <div class="adver-badge">
              状态: {{ adver.status === 'active' ? '活跃' : '未激活' }}
            </div>
          </div>
          
          <!-- 展示时间 -->
          <div class="adver-time">
            <div class="time-badge">
              开始: {{ adver.startTime }}
            </div>
            <div class="time-badge">
              结束: {{ adver.endTime }}
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
        <p>您确定要删除广告《{{ adverToDelete?.title }}》吗？</p>
        <p class="warning-text">此操作不可撤销。</p>
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
          :adverId="currentEditAdver"
          @save="fetchAdverts" 
          @close="closeEditAdverModal"
        />
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
}

.all-advers-header h2::after {
  content: "";
  position: absolute;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  bottom: 0;
  left: 0;
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

.plus-icon {
  font-size: 18px;
  font-style: normal;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.all-advers-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  padding: 30px 0;
  position: relative;
  z-index: 1;
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
}

.adver-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.ribbon {
  position: absolute;
  top: 20px;
  right: -30px;
  transform: rotate(45deg);
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  padding: 5px 30px;
  font-size: 12px;
  font-weight: 500;
  z-index: 5;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.adver-image {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
  padding: 25px 15px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.adver-image img {
  height: 180px;
  max-width: 130px;
  transition: transform 0.5s ease;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.15));
  z-index: 2;
}

.hover-info {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,107,107,0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 500;
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
  transform: scale(1.05);
}

.adver-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
}

.adver-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  height: 45px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #333;
  transition: color 0.3s;
}

.adver-card:hover .adver-title {
  color: #ff6b6b;
}

/* 广告信息样式 */
.adver-info {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  width: 100%;
}

.adver-badge {
  flex: 1;
  padding: 8px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background-color: #e0f2e9;
  color: #2e8b57;
}

/* 展示时间样式 */
.adver-time {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
}

.time-badge {
  flex: 1;
  padding: 8px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  background-color: #e6f0ff;
  color: #4a6fa5;
}

/* 修改管理员操作按钮样式 */
.admin-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  width: 100%;
}

.edit-btn, .delete-btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
  color: #333;
}

.edit-btn:hover {
  background: #e6e6e6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.delete-btn {
  background: #f2f2f2;
  color: #333;
}

.delete-btn:hover {
  background: #e6e6e6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
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
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.3s ease;
  text-align: center;
}

.delete-modal-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.delete-modal h3 {
  margin: 0 0 15px;
  color: #ff6b6b;
  font-size: 24px;
  font-weight: 600;
}

.delete-modal p {
  color: #555;
  line-height: 1.5;
  font-size: 16px;
  margin-bottom: 10px;
}

.warning-text {
  color: #ff6b6b;
  font-size: 14px;
  font-weight: 500;
}

.delete-modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
}

.cancel-btn, .confirm-delete-btn {
  padding: 12px 25px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.cancel-btn {
  background: #f2f2f2;
  color: #555;
}

.cancel-btn:hover {
  background: #e6e6e6;
  transform: translateY(-2px);
}

.confirm-delete-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
}

.confirm-delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.4);
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
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
  margin-bottom: 20px;
  font-size: 18px;
}

.retry-btn {
  background: linear-gradient(90deg, #ff6b6b, #ff9e7d);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.2);
}

.retry-btn:hover {
  background: linear-gradient(90deg, #ff5252, #ff8a65);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.3);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  background-color: #ff6b6b;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination button:disabled {
  background-color: #f0f0f0;
  color: #ccc;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background-color: #ff5252;
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
</style>
