<template>
  <div class="loading-container">
    <div class="content">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="番茄书城Logo" class="logo-image" />
      </div>
      <h2 class="loading-message">页面加载中</h2>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="loading-description">
        请稍后，我们正在努力为您加载内容...
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Loading"
};
</script>

<style scoped>
.loading-container {
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
  animation: rotate 3s linear infinite;
  filter: drop-shadow(0 6px 12px rgba(255, 99, 71, 0.2));
}

.loading-message {
  font-size: 2.5rem;
  margin: 1rem 0;
  color: #333;
}

.loading-description {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 2.5rem;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.loading-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
}

.loading-dots span {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  animation: dots 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

/* 动画效果 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes dots {
  0%, 80%, 100% { 
    transform: scale(0);
  }
  40% { 
    transform: scale(1.0);
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
  .loading-message {
    font-size: 2rem;
  }

  .loading-description {
    font-size: 1.1rem;
    max-width: 95%;
  }
  
  .logo-image {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 480px) {
  .loading-message {
    font-size: 1.5rem;
  }

  .logo-image {
    width: 100px;
    height: 100px;
  }
}
</style>