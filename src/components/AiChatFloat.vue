<template>
  <div class="ai-chat-float">
    <!-- 聊天按钮 -->
    <div 
      v-if="!isOpen" 
      class="chat-trigger" 
      @click="toggleChat"
    >
      <img src="@/assets/logo.png" alt="AI助手" class="chat-icon-logo" />
    </div>

    <!-- 聊天窗口 -->
    <div v-if="isOpen" class="chat-window">
      <div class="chat-header">
        <div class="header-info">
          <div class="ai-avatar">
            <img src="@/assets/logo.png" alt="AI助手" class="ai-avatar-logo" />
          </div>
          <div class="header-text">
            <h3>番茄AI助手</h3>
            <span class="status">在线为您服务</span>
          </div>
        </div>
        <button class="close-btn" @click="toggleChat">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          :class="['message', msg.type]"
        >
          <div v-if="msg.type === 'ai'" class="message-avatar">
            <img src="@/assets/logo.png" alt="AI助手" class="message-avatar-logo" />
          </div>
          <div class="message-bubble">
            <div class="message-content">{{ msg.content }}</div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <div class="input-container">
          <input 
            v-model="inputMessage"
            @keypress.enter="sendMessage"
            placeholder="询问图书推荐、搜索建议..."
            :disabled="isLoading"
            class="message-input"
          />
          <button 
            @click="sendMessage" 
            :disabled="isLoading || !inputMessage.trim()"
            class="send-btn"
          >
            <svg v-if="!isLoading" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
            <div v-else class="loading-spinner"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AiChatFloat',
  data() {
    return {
      isOpen: false,
      inputMessage: '',
      messages: [],
      isLoading: false,
      conversationId: null
    }
  },
  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen
      if (this.isOpen && this.messages.length === 0) {
        this.addMessage('您好！我是AI助手，有什么可以帮助您的吗？', 'ai')
      }
    },
    
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isLoading) return
      
      const userMessage = this.inputMessage.trim()
      this.addMessage(userMessage, 'user')
      this.inputMessage = ''
      this.isLoading = true
      
      // 为流式响应添加一个占位消息
      const aiMessageIndex = this.messages.length
      this.addMessage('', 'ai')
      
      try {
        const token = sessionStorage.getItem('token')
        const username = sessionStorage.getItem('username')
        
        if (!token) {
          this.messages[aiMessageIndex].content = '请先登录后再使用AI助手功能'
          this.isLoading = false
          return
        }

        console.log('使用的token:', token ? token.substring(0, 20) + '...' : 'undefined')

        const response = await fetch('/api/ai/chat/stream', {
          method: 'POST',
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: username,
            conversationId: this.conversationId,
            message: userMessage,
            model: 'deepseek-v3'
          })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // 处理流式响应
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullMessage = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // 将字节解码为文本
            buffer += decoder.decode(value, { stream: true })
            
            // 处理可能的多个数据块
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // 保留可能不完整的最后一行

            for (const line of lines) {
              if (line.trim().startsWith('data:')) {
                try {
                  // 移除 "data:" 前缀并解析 JSON
                  const jsonStr = line.trim().substring(5)
                  const data = JSON.parse(jsonStr)
                  
                  console.log('流式数据:', data)
                  
                  if (data.conversationId) {
                    this.conversationId = data.conversationId
                  }
                  
                  if (data.message) {
                    fullMessage += data.message
                    // 实时更新AI消息内容
                    this.messages[aiMessageIndex].content = fullMessage
                    this.$nextTick(() => {
                      this.scrollToBottom()
                    })
                  }
                } catch (parseError) {
                  console.error('解析流式数据出错:', parseError, '原始数据:', line)
                }
              }
            }
          }
        }

        // 如果最终没有收到任何消息内容
        if (!fullMessage.trim()) {
          this.messages[aiMessageIndex].content = '抱歉，没有收到有效回复，请重试。'
        }

      } catch (error) {
        console.error('AI聊天错误:', error)
        this.messages[aiMessageIndex].content = '抱歉，发生了一些错误，请稍后再试。'
        
        if (error.message.includes('HTTP error! status: 401')) {
          this.messages[aiMessageIndex].content = '登录已过期，请重新登录后再试'
        }
      } finally {
        this.isLoading = false
      }
    },
    
    addMessage(content, type) {
      this.messages.push({
        content,
        type,
        timestamp: new Date()
      })
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    formatTime(timestamp) {
      return timestamp.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }
}
</script>

<style scoped>
.ai-chat-float {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.chat-trigger {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(228, 57, 60, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.chat-trigger::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
  border-radius: 50%;
}

.chat-trigger:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 35px rgba(228, 57, 60, 0.45);
}

.chat-icon-logo {
  width: 32px;
  height: 32px;
  z-index: 1;
  /* 移除白色滤镜，显示原始彩色logo */
}

.chat-window {
  width: 380px;
  height: 520px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.chat-header {
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  color: white;
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.ai-avatar-logo {
  width: 20px;
  height: 20px;
  /* 移除白色滤镜，显示原始彩色logo */
}

.header-text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

.status {
  font-size: 12px;
  opacity: 0.9;
  font-weight: 400;
}

.close-btn {
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(255,255,255,0.25);
  transform: scale(1.1);
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(to bottom, #fef7f7 0%, #ffffff 100%);
  scroll-behavior: smooth;
}

.message {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: messageSlide 0.3s ease-out;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message.ai {
  flex-direction: row;
}

.message-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar-logo {
  width: 16px;
  height: 16px;
  /* 移除白色滤镜，显示原始彩色logo */
}

.message-bubble {
  max-width: calc(100% - 50px);
  display: flex;
  flex-direction: column;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  position: relative;
}

.message.user .message-content {
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  color: white;
  border-bottom-right-radius: 6px;
}

.message.ai .message-content {
  background: white;
  color: #2c3e50;
  border: 1px solid #ffe0e1;
  border-bottom-left-radius: 6px;
  box-shadow: 0 2px 8px rgba(228, 57, 60, 0.08);
}

.message-time {
  font-size: 11px;
  color: #8b95a5;
  margin-top: 4px;
  padding: 0 4px;
}

.message.user .message-time {
  text-align: right;
}

.typing {
  background: white !important;
  border: 1px solid #ffe0e1 !important;
  display: flex;
  align-items: center;
  min-height: 20px;
  box-shadow: 0 2px 8px rgba(228, 57, 60, 0.08) !important;
}

.chat-input {
  padding: 20px;
  background: white;
  border-top: 1px solid #ffe0e1;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: center;
  background: #fef7f7;
  border-radius: 25px;
  padding: 4px;
  border: 1px solid #ffe0e1;
  transition: all 0.3s ease;
}

.input-container:focus-within {
  border-color: #e4393c;
  box-shadow: 0 0 0 3px rgba(228, 57, 60, 0.1);
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #2c3e50;
}

.message-input::placeholder {
  color: #8b95a5;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(228, 57, 60, 0.3);
}

.send-btn:disabled {
  background: #d1d9e6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-btn svg {
  width: 18px;
  height: 18px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(228, 57, 60, 0.3);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(228, 57, 60, 0.5);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chat-window {
    width: calc(100vw - 40px);
    height: calc(100vh - 100px);
    right: 20px;
    bottom: 90px;
  }
  
  .chat-trigger {
    width: 56px;
    height: 56px;
    bottom: 20px;
    right: 20px;
  }
  
  .chat-icon-logo {
    width: 24px;
    height: 24px;
  }
}
</style>