<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Logo部分 -->
        <div class="logo">
          <img src="@/assets/logo.png" alt="Logo"  class="logo-img"/>
          <h1 class="logo-text">番茄书城</h1>
        </div>
  
        <!-- 欢迎文本 -->
        <h1 class="welcome">阅读图书 阅历人生 </h1>
        <p class="subtitle">请登录账号 开启阅读之旅</p>
  
        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <input 
              type="username" 
              v-model="username" 
              placeholder="请输入用户名" 
              class="form-input"
            />
          </div>
  
          <div class="form-group">
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="请输入密码" 
                class="form-input"
              />
              <button 
                type="button" 
                @click="togglePassword" 
                class="eye-button"
              >
                <img 
                  :src="showPassword ? '/src/assets/images/眼睛_显示.svg' : '/src/assets/images/眼睛_隐藏.svg'"
                  alt="toggle password visibility"
                  class="eye-icon"
                />
              </button>
            </div>
          </div>
  
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" />
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-password">忘记密码</a>
          </div>
  
          <!-- 添加错误提示区域 -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
  
          <button type="submit" class="login-button">登录</button>
        </form>
  
        <!-- 注册提示 -->
        <div class="register-hint">
          <span>还没有账号？</span>
          <a @click="handleRegister" class="create-account">创建账号</a>
        </div>
      </div>
    </div>
  </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const username = ref('')
  const password = ref('')
  const rememberMe = ref(false)
  const showPassword = ref(false)
  const errorMessage = ref('')

  // 添加清除错误信息和表单的函数
  const clearErrorAndForm = () => {
    setTimeout(() => {
      errorMessage.value = ''
      username.value = ''
      password.value = ''
    }, 3000) // 3秒后清除
  }

  const togglePassword = () => {
    showPassword.value = !showPassword.value
  }
  
  const handleLogin = async () => {
    // 重置错误信息
    errorMessage.value = ''
    
    // 表单验证
    if (!username.value || !password.value) {
      errorMessage.value = '请输入用户名和密码'
      clearErrorAndForm()
      return
    }

    try {
      const response = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username.value,
          password: password.value
        })
      })

      const data = await response.json()

      if (data.code === '200') {
        if (rememberMe.value) {
          localStorage.setItem('token', data.data.token)
        } else {
          sessionStorage.setItem('token', data.data.token)
        }
        router.push('/register')
      } else {
        errorMessage.value = data.msg || '登录失败，请重试'
        clearErrorAndForm()
      }
    } catch (error) {
      console.error('登录出错:', error)
      errorMessage.value = '网络错误，请检查网络连接'
      clearErrorAndForm()
    }
  }

  const handleRegister = () => {
    router.push('/register')
  }
  </script>
  
  <style scoped>
  .login-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  background-image: url('@/assets/images/login_background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
}
  
  .login-card {
    background: rgba(255, 255, 255, 0.95);
    padding: 2.5rem;
    border-radius: 15px;
    width: 100%;
    max-width: 450px;
    height: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .logo {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 10px;
    margin-bottom: 1rem;
    justify-content: center;
  }
  
  .logo-img {
    height: 50px;
    width: auto;
  }

  .logo-text {
    font-size: 3rem;
    font-weight: 600;
    color: #2c3e50;
    text-align: center;
  }
  
  .welcome {
    font-size: 1.8rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.8rem;
    margin-top: 1rem;
    text-align: center;
  }
  
  .subtitle {
    color: #5d6778;
    margin-bottom: 1.5rem;
    text-align: center;
    font-size: 1rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d8d6de;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.15s ease;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #d44c4c;
  }
  
  .password-input {
    position: relative;
  }
  
  .eye-button {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .eye-icon {
    width: 20px;
    height: 20px;
    opacity: 0.6;
  }
  
  .eye-button:hover .eye-icon {
    opacity: 1;
  }
  
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6e6b7b;
  }
  
  .forgot-password {
    color: rgb(36, 114, 36);
    text-decoration: none;
  }
  
  .login-button {
    width: 100%;
    padding: 0.75rem;
    background: #d44c4c;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.15s ease;
    margin-top: 8px;
  }
  
  .login-button:hover {
    background: #c13e3e;
  }
  
  .register-hint {
    text-align: center;
    margin: 1.5rem 0;
    color: #6e6b7b;
  }
  
  .create-account {
    color: rgb(36, 114, 36);
    text-decoration: none;
    margin-left: 0.5rem;
    cursor: pointer;
  }

  .error-message {
    color: #d44c4c;;
    padding: 8px 12px;
    font-size: 14px;
    margin-bottom: 16px;
    text-align: center;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>