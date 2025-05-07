<template>
  <div class="not-found-container">
    <div class="content">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="番茄书城Logo" class="logo-image" />
      </div>
      <h1 class="error-code">404</h1>
      <h2 class="error-message">哎呀，页面不见了！</h2>
      <p class="error-description">
        您访问的页面可能已被移除、名称已更改或暂时不可用。
      </p>
      <router-link to="/homepage" class="home-button">
        <span>返回主页</span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFound"
};
</script>

<style scoped>
.not-found-container {
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
  animation: bounce 2s infinite;
  filter: drop-shadow(0 6px 12px rgba(255, 99, 71, 0.2));
}

.error-code {
  font-size: 10rem;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 10px 20px rgba(255, 107, 107, 0.1);
  line-height: 1;
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

.home-button {
  display: inline-block;
  background: linear-gradient(45deg, #ff6b6b, #ff8e53);
  color: white;
  padding: 1.2rem 3rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.home-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
}

.home-button:active {
  transform: translateY(1px);
}

/* 动画效果 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
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
  .error-code {
    font-size: 8rem;
  }
  
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
}

@media (max-width: 480px) {
  .error-code {
    font-size: 6rem;
  }
  
  .error-message {
    font-size: 1.5rem;
  }

  .logo-image {
    width: 100px;
    height: 100px;
  }

  .home-button {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
  }
}
</style>