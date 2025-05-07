<template>
  <div class="loading-fail-container">
    <div class="content">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="番茄书城Logo" class="logo-image" />
      </div>
      <div class="error-icon">
        <i class="exclamation">!</i>
      </div>
      <h2 class="error-message">加载失败</h2>
      <p class="error-description">
        很抱歉，页面加载过程中遇到了问题<br>
        这可能是由于网络连接不稳定或服务器暂时不可用
      </p>
      <div class="button-group">
        <button class="retry-button" @click="retryLoading">
          <span>重新加载</span>
        </button>
        <router-link to="/homepage" class="home-button">
          <span>返回主页</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoadingFail",
  methods: {
    retryLoading() {
      window.location.reload();
    }
  }
};
</script>

<style scoped>
.loading-fail-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e6eef8 100%);
  font-family: "Microsoft YaHei", sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.content {
  text-align: center;
  width: 90%;
  max-width: 700px;
  animation: fadeIn 1s ease-in-out;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px 20px;
  margin: 20px;
  box-sizing: border-box;
}

.logo-container {
  margin-bottom: 2rem;
}

.logo-image {
  width: 150px;
  height: 150px;
  object-fit: contain;
  animation: shake 1.5s cubic-bezier(.36,.07,.19,.97) both;
  filter: drop-shadow(0 6px 12px rgba(255, 99, 71, 0.2));
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background-color: #ffecec;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

.exclamation {
  font-size: 50px;
  font-weight: bold;
  color: #ff6b6b;
}

.error-message {
  font-size: 2.5rem;
  margin: 1rem 0;
  color: #333;
}

.error-description {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 2.5rem;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.retry-button, .home-button {
  display: inline-block;
  padding: 1.2rem 3rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  cursor: pointer;
  border: none;
}

.retry-button {
  background: #ffffff;
  color: #ff6b6b;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 2px solid #ff6b6b;
}

.home-button {
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.retry-button:hover, .home-button:hover {
  transform: translateY(-3px);
}

.retry-button:hover {
  background: #fff5f5;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.2);
}

.home-button:hover {
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
}

.retry-button:active, .home-button:active {
  transform: translateY(1px);
}

/* 动画效果 */
@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }
  
  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
  }
  
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
  }
  
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .error-message {
    font-size: 2rem;
  }

  .error-description {
    font-size: 1.1rem;
    max-width: 95%;
  }
  
  .logo-image {
    width: 120px;
    height: 120px;
  }
  
  .button-group {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .error-message {
    font-size: 1.5rem;
  }

  .logo-image {
    width: 100px;
    height: 100px;
  }

  .retry-button, .home-button {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    width: 80%;
  }
  
  .error-icon {
    width: 60px;
    height: 60px;
  }
  
  .exclamation {
    font-size: 36px;
  }
}
</style>
