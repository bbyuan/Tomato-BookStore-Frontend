<template>
    <div class="login-container">
      <div class="login-card">
        <!-- Logo部分 -->
        <div class="logo">
          <img src="@/assets/logo.png" alt="Logo" />
          <span class="logo-text">MATERIO</span>
        </div>
  
        <!-- 欢迎文本 -->
        <h1 class="welcome">Welcome to Materio! 👋</h1>
        <p class="subtitle">Please sign-in to your account and start the adventure</p>
  
        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <input 
              type="email" 
              v-model="email" 
              placeholder="Email" 
              class="form-input"
            />
          </div>
  
          <div class="form-group">
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                placeholder="Password" 
                class="form-input"
              />
              <button 
                type="button" 
                @click="togglePassword" 
                class="eye-button"
              >
                <i :class="showPassword ? 'eye-open' : 'eye-close'"></i>
              </button>
            </div>
          </div>
  
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" />
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-password">Forgot Password?</a>
          </div>
  
          <button type="submit" class="login-button">Login</button>
        </form>
  
        <!-- 注册提示 -->
        <div class="register-hint">
          <span>New on our platform?</span>
          <a href="#" class="create-account">Create an account</a>
        </div>
  
        <!-- 分割线 -->
        <div class="divider">
          <span>or</span>
        </div>
  
        <!-- 社交登录 -->
        <div class="social-login">
          <button class="social-button facebook">
            <i class="facebook-icon"></i>
          </button>
          <button class="social-button twitter">
            <i class="twitter-icon"></i>
          </button>
          <button class="social-button github">
            <i class="github-icon"></i>
          </button>
          <button class="social-button google">
            <i class="google-icon"></i>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const email = ref('')
  const password = ref('')
  const rememberMe = ref(false)
  const showPassword = ref(false)
  
  const togglePassword = () => {
    showPassword.value = !showPassword.value
  }
  
  const handleLogin = () => {
    // 处理登录逻辑
    console.log('Login attempt:', {
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value
    })
  }
  </script>
  
  <style scoped>
  .login-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f4f5fa;
    padding: 20px;
  }
  
  .login-card {
    background: white;
    padding: 2rem;
    border-radius: 6px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }
  
  .logo {
    display: flex;
    align-items: center;
    height: 100px;
    width: 100px;
    gap: 10px;
    margin-bottom: 2rem;
  }
  
  .logo-text {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }
  
  .welcome {
    font-size: 1.5rem;
    color: #32325d;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: #6e6b7b;
    margin-bottom: 2rem;
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
    border-color: #7367f0;
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
    color: #6e6b7b;
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
    color: #7367f0;
    text-decoration: none;
  }
  
  .login-button {
    width: 100%;
    padding: 0.75rem;
    background: #7367f0;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  
  .login-button:hover {
    background: #635ce6;
  }
  
  .register-hint {
    text-align: center;
    margin: 1.5rem 0;
    color: #6e6b7b;
  }
  
  .create-account {
    color: #7367f0;
    text-decoration: none;
    margin-left: 0.5rem;
  }
  
  .divider {
    text-align: center;
    position: relative;
    margin: 1.5rem 0;
  }
  
  .divider::before,
  .divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background: #d8d6de;
  }
  
  .divider::before {
    left: 0;
  }
  
  .divider::after {
    right: 0;
  }
  
  .divider span {
    background: white;
    padding: 0 1rem;
    color: #6e6b7b;
  }
  
  .social-login {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .social-button {
    width: 40px;
    height: 40px;
    border: 1px solid #d8d6de;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    transition: background 0.15s ease;
  }
  
  .social-button:hover {
    background: #f8f8f8;
  }
  </style>