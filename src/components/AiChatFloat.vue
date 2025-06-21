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
        <div class="header-actions">
          <button class="conversations-btn" @click="toggleConversations" title="会话列表">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
            </svg>
          </button>
          <button class="close-btn" @click="toggleChat">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 会话列表 -->
      <div v-if="showConversations" class="conversations-panel">
        <div class="conversations-header">
          <h4>历史会话</h4>
          <button class="new-chat-btn" @click="startNewConversation">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
            </svg>
            新对话
          </button>
        </div>
        <div class="conversations-list">
          <div 
            v-for="conversation in conversations"
            :key="conversation.conversationId"
            :class="['conversation-item', { active: conversation.conversationId === conversationId }]"
            @click="selectConversation(conversation)"
          >
            <div class="conversation-content">
              <div class="conversation-title">{{ conversation.title || '未命名对话' }}</div>
              <div class="conversation-model">{{ conversation.model }}</div>
            </div>
            <div class="conversation-actions" @click.stop>
              <button 
                class="delete-btn"
                @click="slideToDelete(conversation.conversationId)"
                title="删除会话"
                v-if="slideDeleteId !== conversation.conversationId"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
                </svg>
              </button>
              <div v-if="slideDeleteId === conversation.conversationId" class="slide-confirm-actions">
                <button class="confirm-btn" @click="executeDelete(conversation.conversationId)">确认删除</button>
                <button class="cancel-btn" @click="slideDeleteId = null">取消</button>
              </div>
            </div>
          </div>
          <div v-if="conversations.length === 0" class="no-conversations">
            暂无历史会话
          </div>
        </div>
      </div>
      
      <div v-else class="chat-messages" ref="messagesContainer">
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
            <div v-if="msg.showTime !== false" class="message-time">
              {{ formatTime(msg.timestamp) }}
            </div>
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
    <Toast ref="toastRef" />
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
      conversationId: null,
      conversations: [],
      showConversations: false,
      deleteTargetId: null,
      slideDeleteId: null
    }
  },
  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen
      if (this.isOpen && this.messages.length === 0) {
        this.addMessage('您好！我是AI助手，有什么可以帮助您的吗？', 'ai')
      }
    },

    async toggleConversations() {
      this.showConversations = !this.showConversations
      if (this.showConversations && this.conversations.length === 0) {
        await this.loadConversations()
      }
    },

    async loadConversations() {
      try {
        const token = sessionStorage.getItem('token')
        if (!token) {
          console.error('用户未登录')
          return
        }

        const response = await fetch('/api/ai/conversations', {
          method: 'GET',
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('获取会话列表响应:', result)

        if (result.code === 200 || result.data) {
          this.conversations = result.data?.conversations || []
        } else {
          console.error('获取会话列表失败:', result.msg)
        }
      } catch (error) {
        console.error('获取会话列表错误:', error)
      }
    },

    async selectConversation(conversation) {
      this.conversationId = conversation.conversationId
      this.messages = [] // 清空当前消息
      this.showConversations = false
      
      // 加载该会话的所有消息
      await this.loadConversationMessages(conversation.conversationId)
    },

    startNewConversation() {
      this.conversationId = null
      this.messages = []
      this.showConversations = false
      this.addMessage('您好！我是AI助手，有什么可以帮助您的吗？', 'ai')
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
    
    async loadConversationMessages(conversationId) {
      try {
        const token = sessionStorage.getItem('token')
        if (!token) {
          console.error('用户未登录')
          this.addMessage('请先登录后再查看历史会话', 'ai')
          return
        }

        console.log('开始加载会话消息, conversationId:', conversationId)
        console.log('使用的token:', token ? token.substring(0, 20) + '...' : 'undefined')

        // 显示加载提示
        this.addMessage('正在加载历史消息...', 'ai')
        const loadingMessageIndex = this.messages.length - 1

        // 使用 axios POST 请求，参考 Header.vue 的token传递方式
        const response = await axios.post('/api/ai/messages', {
          conversationId: conversationId
        }, {
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          }
        })

        console.log('响应状态:', response.status, response.statusText)
        console.log('响应头:', response.headers)

        const result = response.data
        console.log('获取会话消息完整响应:', JSON.stringify(result, null, 2))

        await this.processConversationMessages(result, loadingMessageIndex)

      } catch (error) {
        console.error('获取会话消息错误详情:', error)
        console.error('错误堆栈:', error.stack)
        
        // 详细的错误信息
        if (error.response) {
          console.error('错误响应状态:', error.response.status)
          console.error('错误响应数据:', error.response.data)
          console.error('错误响应头:', error.response.headers)
        } else if (error.request) {
          console.error('请求发送但未收到响应:', error.request)
        } else {
          console.error('请求配置错误:', error.message)
        }
        
        // 移除可能存在的加载提示
        if (this.messages.length > 0 && this.messages[this.messages.length - 1].content === '正在加载历史消息...') {
          this.messages.pop()
        }
        
        if (error.response?.status === 401) {
          this.addMessage('登录已过期，请重新登录后再试', 'ai')
        } else if (error.response?.status === 400) {
          const errorMsg = error.response?.data?.msg || error.response?.data?.message || '请求参数错误'
          this.addMessage(`请求参数错误: ${errorMsg}`, 'ai')
        } else {
          this.addMessage('加载历史消息时发生错误，请稍后重试', 'ai')
        }
      }
    },

    async processConversationMessages(result, loadingMessageIndex) {
      console.log('开始处理会话消息响应')
      console.log('响应结构分析:')
      console.log('- code:', result.code)
      console.log('- msg:', result.msg)
      console.log('- data:', result.data)
      
      // 移除加载提示消息
      this.messages.splice(loadingMessageIndex, 1)
      console.log('已移除加载提示消息')

      // 检查是否是401未登录错误
      if (result.code === '401' || result.code === 401) {
        console.log('检测到401未登录错误')
        this.addMessage('登录已过期，请重新登录后再试', 'ai')
        return
      }

      if (result.code === '200' || result.code === 200 || result.data) {
        const messagesData = result.data?.messages || []
        console.log('提取到的消息数据:', messagesData)
        
        if (messagesData.length === 0) {
          console.log('该会话没有历史消息')
          this.addMessage('该会话暂无历史消息', 'ai')
          return
        }

        console.log('开始转换和添加消息:')
        // 将服务器返回的消息转换为前端格式
        messagesData.forEach((msg, index) => {
          console.log(`处理第${index + 1}条消息:`, msg)
          console.log(`- content: ${msg.content}`)
          console.log(`- role: ${msg.role}`)
          
          const messageType = msg.role === 'user' ? 'user' : 'ai'
          console.log(`- 转换后的type: ${messageType}`)
          
          this.addHistoryMessage(msg.content, messageType)
        })

        console.log(`成功添加${messagesData.length}条历史消息`)

        // 滚动到底部
        this.$nextTick(() => {
          console.log('滚动到底部')
          this.scrollToBottom()
        })

      } else {
        console.error('响应格式不正确或状态码错误')
        console.error('期望code为200，实际:', result.code)
        console.error('完整响应:', result)
        
        // 根据错误码显示不同消息
        if (result.code === '400' || result.code === 400) {
          this.addMessage('请求参数错误，请检查会话ID是否有效', 'ai')
        } else {
          this.addMessage(`获取历史消息失败：${result.msg || '未知错误'}`, 'ai')
        }
      }
    },
    
    addMessage(content, type) {
      this.messages.push({
        content,
        type,
        timestamp: new Date(),
        showTime: true
      })
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    addHistoryMessage(content, type) {
      this.messages.push({
        content,
        type,
        timestamp: new Date(),
        showTime: false
      })
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const time = new Date(timestamp)
      return time.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    showDeleteConfirm(conversationId) {
      this.deleteTargetId = conversationId
    },

    slideToDelete(conversationId) {
      this.slideDeleteId = conversationId
    },

    async executeDelete(conversationId) {
      try {
        const token = sessionStorage.getItem('token')
        if (!token) {
          this.$refs.toastRef.show('用户未登录', 'error')
          return
        }
        const response = await fetch('/api/ai/conversations', {
          method: 'DELETE',
          headers: {
            'token': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ conversationId })
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()
        if (result.code === 200 || result.code === '200') {
          this.conversations = this.conversations.filter(
            conv => conv.conversationId !== conversationId
          )
          if (this.conversationId === conversationId) {
            this.conversationId = null
            this.messages = []
            this.addMessage('您好！我是AI助手，有什么可以帮助您的吗？', 'ai')
          }
          this.$refs.toastRef.show('删除成功', 'success')
        } else {
          this.$refs.toastRef.show(result.msg || '删除失败', 'error')
        }
        this.slideDeleteId = null
      } catch (error) {
        this.$refs.toastRef.show('删除会话时发生错误', 'error')
        this.slideDeleteId = null
      }
    },
  }
}
</script>

<style scoped>
.ai-chat-float {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  filter: drop-shadow(0 8px 32px rgba(228, 57, 60, 0.18));
  /* 轻柔阴影 */
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
  box-shadow: 0 8px 25px rgba(228, 57, 60, 0.35), 0 2px 8px rgba(255,255,255,0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s;
  position: relative;
  overflow: hidden;
  border: 2.5px solid #fff6f6;
}

.chat-trigger::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%);
  border-radius: 50%;
  pointer-events: none;
}

.chat-trigger:hover {
  transform: translateY(-4px) scale(1.08);
  box-shadow: 0 16px 40px rgba(228, 57, 60, 0.38), 0 2px 12px rgba(255,255,255,0.18);
  filter: brightness(1.08) saturate(1.1);
}

.chat-icon-logo {
  width: 36px;
  height: 36px;
  z-index: 1;
  filter: drop-shadow(0 2px 8px rgba(255,107,107,0.18));
}

.chat-window {
  width: 400px;
  height: 560px;
  background: linear-gradient(135deg, #fff 80%, #ffeaea 100%);
  border-radius: 22px;
  box-shadow: 0 24px 80px 0 rgba(228, 57, 60, 0.13), 0 2px 12px rgba(255,255,255,0.10);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1.5px solid rgba(228, 57, 60, 0.10);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(2.5px);
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
  padding: 22px 24px 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  box-shadow: 0 2px 12px rgba(228, 57, 60, 0.10);
}

.chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0) 100%);
  pointer-events: none;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 1;
}

.ai-avatar {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.22);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px rgba(255,107,107,0.13);
  border: 1.5px solid #fff6f6;
}

.ai-avatar-logo {
  width: 26px;
  height: 26px;
  filter: drop-shadow(0 2px 8px rgba(255,107,107,0.18));
}

.header-text h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 4px rgba(255,255,255,0.18);
}

.status {
  font-size: 13px;
  opacity: 0.92;
  font-weight: 400;
  text-shadow: 0 1px 4px rgba(255,255,255,0.12);
}

.close-btn {
  background: rgba(255,255,255,0.18);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.22s;
  z-index: 1;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(255,107,107,0.10);
}

.close-btn:hover {
  background: rgba(255,255,255,0.32);
  transform: scale(1.13) rotate(8deg);
  box-shadow: 0 4px 16px rgba(255,107,107,0.18);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1;
}

.conversations-btn {
  background: rgba(255,255,255,0.18);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.22s;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(255,107,107,0.10);
}

.conversations-btn:hover {
  background: rgba(255,255,255,0.32);
  transform: scale(1.13) rotate(-8deg);
  box-shadow: 0 4px 16px rgba(255,107,107,0.18);
}

.conversations-btn svg {
  width: 20px;
  height: 20px;
}

.conversations-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #fef7f7 0%, #ffffff 100%);
  height: 100%;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(228, 57, 60, 0.06);
}

.conversations-header {
  padding: 18px 24px 12px 24px;
  border-bottom: 1.5px solid #ffe0e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(255,107,107,0.06);
}

.conversations-header h4 {
  margin: 0;
  font-size: 17px;
  color: #2c3e50;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.new-chat-btn {
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  color: white;
  border: none;
  padding: 9px 16px;
  border-radius: 22px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.22s;
  box-shadow: 0 2px 8px rgba(255,107,107,0.10);
}

.new-chat-btn:hover {
  transform: translateY(-2px) scale(1.08);
  box-shadow: 0 6px 18px rgba(228, 57, 60, 0.18);
  filter: brightness(1.08);
}

.new-chat-btn svg {
  width: 16px;
  height: 16px;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 6px 10px 6px;
  height: 0;
  min-height: 0;
  background: linear-gradient(135deg, #fff 80%, #ffeaea 100%);
  overflow-x: hidden;
}

.conversations-list::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
.conversations-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(228,57,60,0.10) transparent;
}

.conversation-item {
  padding: 14px 18px;
  margin-bottom: 8px;
  border-radius: 14px;
  cursor: pointer;
  transition: box-shadow 0.22s, background 0.22s, border 0.22s, transform 0.18s;
  border: 1.5px solid transparent;
  background: white;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: visible;
  box-shadow: 0 2px 8px rgba(255,107,107,0.06);
}

.conversation-item:hover {
  background: #fef7f7;
  border-color: #ffe0e1;
  transform: translateX(3px) scale(1.03);
  box-shadow: 0 4px 16px rgba(255,107,107,0.13);
}

.conversation-item.active {
  background: linear-gradient(135deg, rgba(228, 57, 60, 0.13) 0%, rgba(255, 107, 107, 0.13) 100%);
  border-color: #e4393c;
  box-shadow: 0 6px 18px rgba(228, 57, 60, 0.13);
}

.slide-confirm-actions {
  display: flex;
  gap: 8px;
  z-index: 3;
  align-items: center;
  margin-left: 8px;
}

.confirm-btn {
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  box-shadow: 0 2px 8px rgba(255,71,87,0.08);
}

.confirm-btn:hover {
  background: #ff3838;
}

.cancel-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
}

.cancel-btn:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-model {
  font-size: 10px;
  color: #e4393c;
  background: rgba(228, 57, 60, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  display: inline-block;
  font-weight: 500;
}

.no-conversations {
  text-align: center;
  color: #8b95a5;
  font-size: 14px;
  padding: 40px 20px;
}

.conversations-list::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
.conversations-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(228,57,60,0.10) transparent;
}

/* ...existing code... */

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px 20px 20px;
  background: linear-gradient(to bottom, #fef7f7 0%, #ffffff 100%);
  scroll-behavior: smooth;
  box-shadow: 0 2px 8px rgba(255,107,107,0.06);
  overflow-x: hidden;
}

.chat-messages::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
.chat-messages {
  scrollbar-width: thin;
  scrollbar-color: rgba(228,57,60,0.10) transparent;
}

.message {
  margin-bottom: 22px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  animation: messageSlide 0.3s ease-out;
  filter: drop-shadow(0 2px 8px rgba(255,107,107,0.08));
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
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(255,107,107,0.13);
  border: 1.5px solid #fff6f6;
}

.message-avatar-logo {
  width: 18px;
  height: 18px;
  filter: drop-shadow(0 2px 8px rgba(255,107,107,0.18));
}

.message-bubble {
  max-width: calc(100% - 60px);
  display: flex;
  flex-direction: column;
}

.message-content {
  padding: 14px 18px;
  border-radius: 20px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
  position: relative;
  box-shadow: 0 2px 8px rgba(255,107,107,0.08);
  border: 1.5px solid #ffe0e1;
  background: linear-gradient(135deg, #fff 80%, #ffeaea 100%);
  transition: background 0.18s, box-shadow 0.18s;
}

.message.user .message-content {
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  color: white;
  border-bottom-right-radius: 8px;
  border: 1.5px solid #ffb3b3;
  box-shadow: 0 2px 12px rgba(228, 57, 60, 0.13);
}

.message.ai .message-content {
  background: linear-gradient(135deg, #fff 80%, #ffeaea 100%);
  color: #2c3e50;
  border: 1.5px solid #ffe0e1;
  border-bottom-left-radius: 8px;
  box-shadow: 0 2px 12px rgba(255,107,107,0.10);
}

.message-time {
  font-size: 12px;
  color: #8b95a5;
  margin-top: 6px;
  padding: 0 4px;
  text-shadow: 0 1px 4px rgba(255,255,255,0.10);
}

.message.user .message-time {
  text-align: right;
}

.typing {
  background: white !important;
  border: 1.5px solid #ffe0e1 !important;
  display: flex;
  align-items: center;
  min-height: 20px;
  box-shadow: 0 2px 8px rgba(228, 57, 60, 0.08) !important;
}

.chat-input {
  padding: 22px 24px 22px 24px;
  background: white;
  border-top: 1.5px solid #ffe0e1;
  box-shadow: 0 -2px 8px rgba(255,107,107,0.06);
}

.input-container {
  display: flex;
  gap: 14px;
  align-items: center;
  background: #fef7f7;
  border-radius: 28px;
  padding: 6px 8px;
  border: 1.5px solid #ffe0e1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(255,107,107,0.06);
}

.input-container:focus-within {
  border-color: #e4393c;
  box-shadow: 0 0 0 4px rgba(228, 57, 60, 0.13);
  background: #fff6f6;
}

.message-input {
  flex: 1;
  padding: 14px 18px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  color: #2c3e50;
  border-radius: 18px;
  transition: background 0.18s;
}

.message-input::placeholder {
  color: #8b95a5;
  opacity: 0.85;
}

.send-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #e4393c 0%, #ff6b6b 100%);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.22s;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(255,107,107,0.10);
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.10) rotate(-8deg);
  box-shadow: 0 6px 18px rgba(228, 57, 60, 0.18);
  filter: brightness(1.08);
}

.send-btn:disabled {
  background: #d1d9e6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-btn svg {
  width: 20px;
  height: 20px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top: 2.5px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
.chat-messages {
  scrollbar-width: thin;
  scrollbar-color: rgba(228,57,60,0.10) transparent;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chat-window {
    width: calc(100vw - 24px);
    height: calc(100vh - 60px);
    right: 12px;
    bottom: 60px;
    border-radius: 16px;
  }
  .chat-trigger {
    width: 54px;
    height: 54px;
    bottom: 12px;
    right: 12px;
  }
  .chat-icon-logo {
    width: 22px;
    height: 22px;
  }
  .chat-header, .chat-input {
    padding-left: 12px;
    padding-right: 12px;
  }
}

/* 删除确认对话框样式 */
/* .delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.delete-confirm-dialog {
  background: white;
  border-radius: 16px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
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

.delete-confirm-header {
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.delete-confirm-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.delete-confirm-content {
  padding: 24px;
  text-align: center;
}

.delete-confirm-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(255, 71, 87, 0.1) 0%, rgba(255, 56, 56, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.delete-confirm-icon svg {
  width: 24px;
  height: 24px;
  color: #ff4757;
}

.delete-confirm-content p {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.5;
}

.delete-confirm-content strong {
  color: #ff4757;
}

.delete-warning {
  color: #8b95a5 !important;
  font-size: 12px !important;
}

.delete-confirm-actions {
  padding: 0 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.cancel-btn:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.confirm-delete-btn {
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
}

.confirm-delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
}

.confirm-delete-btn svg {
  width: 14px;
  height: 14px;
} */

.delete-btn {
  background: white;
  border: 1.5px solid #ff4757;
  color: #ff4757;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255,71,87,0.08);
  position: relative;
  margin-left: 8px;
  outline: none;
}
.delete-btn:hover, .delete-btn-active {
  background: #ff4757;
  color: #fff;
  border-color: #ff4757;
  box-shadow: 0 4px 16px rgba(255,71,87,0.18);
  transform: scale(1.08);
}
.delete-btn svg {
  width: 16px;
  height: 16px;
}
.delete-popover {
  position: absolute;
  top: 40px;
  right: 0;
  z-index: 10;
  background: #fff;
  border: 1px solid #ff4757;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(255,71,87,0.13);
  padding: 8px 16px;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.18s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.delete-popover-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.delete-popover-content span {
  color: #ff4757;
  font-size: 14px;
  font-weight: 500;
}
.popover-confirm {
  background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 16px;
  font-size: 13px;
  margin-bottom: 2px;
  cursor: pointer;
  transition: all 0.18s;
}
.popover-confirm:hover {
  background: #ff3838;
}
.popover-cancel {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 4px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.18s;
}
.popover-cancel:hover {
  background: #e9ecef;
  border-color: #ced4da;
}
</style>