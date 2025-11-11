<template>
  <div class="chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <van-nav-bar
        :title="chatUser.username"
        left-text="返回"
        left-arrow
        @click-left="goBack"
      >
        <template #right>
          <van-icon name="ellipsis" size="18" />
        </template>
      </van-nav-bar>
    </div>

    <!-- 聊天内容区域 -->
    <div class="chat-content" ref="chatContentRef">
      <!-- 加载更多 -->
      <div v-if="hasMore" class="load-more">
        <van-button 
          size="small" 
          type="primary" 
          :loading="isLoading"
          @click="loadMoreMessages"
        >
          加载更多消息
        </van-button>
      </div>

      <!-- 消息列表 -->
      <div 
        v-for="(message, index) in messages" 
        :key="message.id"
        class="message-bubble"
        :class="{ 'own-message': message.isOwn, 'other-message': !message.isOwn }"
      >
        <!-- 时间分隔 -->
        <div 
          v-if="shouldShowTime(message, messages[index - 1])" 
          class="time-separator"
        >
          {{ formatMessageTime(message.timestamp) }}
        </div>

        <!-- 对方消息 -->
        <div v-if="!message.isOwn" class="other-message-wrapper">
          <van-image
            round
            :src="chatUser.avatar"
            :alt="chatUser.username"
            class="avatar"
          />
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ formatChatTime(message.timestamp) }}</div>
          </div>
        </div>

        <!-- 自己消息 -->
        <div v-else class="own-message-wrapper">
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <div class="message-status">
              <span class="message-time">{{ formatChatTime(message.timestamp) }}</span>
              <van-icon v-if="message.isRead" name="success" size="12" color="#07c160" />
              <van-icon v-else name="clock-o" size="12" color="#999" />
            </div>
          </div>
          <van-image
            round
            :src="currentUser.avatar"
            :alt="currentUser.username"
            class="avatar"
          />
        </div>
      </div>
    </div>

    <!-- 输入框区域 -->
    <div class="chat-input">
      <div class="input-wrapper">
        <van-field
          v-model="inputMessage"
          placeholder="输入消息..."
          rows="1"
          autosize
          type="textarea"
          @keyup.enter="handleSendMessage"
        />
        <van-button 
          type="primary" 
          size="small" 
          @click="handleSendMessage"
          :disabled="!inputMessage.trim() || isLoading"
        >
          发送
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import { useUserStore } from '@/stores/user'
import { formatMessageTime, formatChatTime, shouldShowTime } from '@/utils/messageUtils'
import { showFailToast } from 'vant'
import { chatService } from '@/services/chatService'

export default {
  name: 'Chat',
  
  setup() {
    const route = useRoute()
    const router = useRouter()
    const chatStore = useChatStore()
    const userStore = useUserStore()
    const chatContentRef = ref(null)
    
    // 响应式数据
    const inputMessage = ref('')
    const isLoading = ref(false)
    
    // 聊天用户信息
    const chatUser = computed(() => ({
      userId: route.query.userId || '',
      username: route.query.username || '未知用户',
      avatar: route.query.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/logo.png'
    }))
    
    // 当前用户信息（从用户store获取）
    const currentUser = computed(() => {
      // 从用户store获取真实用户信息，添加防御性检查
      // 注意：userStore.userInfo是一个ref对象，需要使用.value访问
      const userInfo = userStore.userInfo.value || {}
      
      // 检查用户是否已登录
      const isLoggedIn = userStore.isLoggedIn()
      
      if (!isLoggedIn) {
        return {
          userId: '', // 未登录时返回空字符串
          username: '未登录用户',
          avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
        }
      }
      
      // 调试日志：查看用户信息结构（仅在开发环境输出）
      if (import.meta.env.DEV) {
        console.log('🔍 用户信息结构:', userInfo)
      }
      
      // 尝试多种可能的用户ID字段名（优先使用后端返回的userId字段）
      const userId = userInfo.userId || userInfo.id || userInfo._id || userInfo.user_id || ''
      
      // 尝试多种可能的用户名字段名
      const username = userInfo.username || userInfo.name || userInfo.nickname || userInfo.userName || '我'
      
      // 尝试多种可能的头像字段名
      const avatar = userInfo.avatar || userInfo.avatarUrl || userInfo.image || userInfo.profileImage || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
      
      return {
        userId: userId,
        username: username,
        avatar: avatar
      }
    })
    
    // 计算属性
    const messages = computed(() => chatStore.messages)
    const hasMore = computed(() => chatStore.hasMoreMessages)
    
    // 设置当前聊天用户
    const setChatUser = () => {
      chatStore.setCurrentChatUser({
        id: chatUser.value.userId,
        username: chatUser.value.username,
        avatar: chatUser.value.avatar
      })
    }
    
    // 发送消息
    const handleSendMessage = async () => {
      if (!inputMessage.value.trim()) return
      
      // 正确访问userStore.userInfo（它是一个ref对象）
      const currentUserInfo = userStore.userInfo.value
      if (!currentUserInfo || !currentUserInfo.userId) {
        console.error('❌ 用户未登录或用户ID无效')
        showFailToast('请先登录后再发送消息')
        return
      }
      
      if (!chatUser.value.userId) {
        console.error('❌ 未选择聊天对象')
        showFailToast('未选择聊天对象')
        return
      }
      
      try {
        const messageData = {
          content: inputMessage.value.trim(),
          fromUserId: currentUserInfo.userId,
          toUserId: chatUser.value.userId,
          type: 'text'
        }
        
        console.log('📤 发送消息:', messageData)
        
        // 发送真实消息到服务器
        await chatStore.sendMessage(messageData)
        
        // 清空输入框
        inputMessage.value = ''
        
        // 显示发送成功提示
        console.log('📤 消息发送成功，等待服务器真实回复...')
        
        // 滚动到底部
        scrollToBottom()
      } catch (error) {
        console.error('❌ 发送消息失败:', error)
        
        // 显示错误提示
        ElMessage.error(`发送失败: ${error.message}`)
      }
    }
    
    // 加载更多消息
    const loadMoreMessages = async () => {
      if (isLoading.value) return
      
      isLoading.value = true
      try {
        await chatStore.loadMoreMessages()
      } catch (error) {
        console.error('加载更多消息失败:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    // 滚动到底部
    const scrollToBottom = () => {
      nextTick(() => {
        if (chatContentRef.value) {
          chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
        }
      })
    }
    
    // 返回上一页
    const goBack = () => {
      router.back()
    }
    
    // 初始化（微信式简化设计）
    onMounted(async () => {
      setChatUser()
      
      // 检查用户是否已登录
      if (!userStore.isLoggedIn()) {
        console.warn('⚠️ 用户未登录，跳过WebSocket连接')
        showFailToast('请先登录后再使用聊天功能')
        // 加载模拟消息
        chatStore.loadInitialMessages()
        scrollToBottom()
        return
      }
      
      // 检查当前用户ID是否有效
      if (!currentUser.value.userId) {
        console.warn('⚠️ 当前用户ID无效，跳过WebSocket连接')
        showFailToast('用户信息获取失败，请重新登录')
        // 加载模拟消息
        chatStore.loadInitialMessages()
        scrollToBottom()
        return
      }
      
      // 连接WebSocket（使用真实的用户ID）
      try {
        await chatStore.connectToChat(currentUser.value.userId)
        console.log('✅ WebSocket连接成功，聊天功能已就绪，用户ID:', currentUser.value.userId)
        
        // 在连接成功后立即生成房间ID并加入聊天室
        if (chatUser.value.userId) {
          const roomId = chatService.generateRoomId(currentUser.value.userId, chatUser.value.userId)
          console.log('🚪 生成聊天室ID:', roomId)
          
          try {
            await chatService.joinRoom(roomId)
            console.log('✅ 加入聊天室成功:', roomId)
          } catch (error) {
            console.warn('❌ 加入聊天室失败:', error)
            // 即使加入聊天室失败，也继续其他操作
          }
        }
      } catch (error) {
        console.error('❌ WebSocket连接失败:', error)
        // 即使连接失败，也继续加载消息（使用模拟模式）
      }
      
      // 加载初始消息
      chatStore.loadInitialMessages()
      scrollToBottom()
    })
    
    // 组件卸载时断开连接
    onUnmounted(() => {
      chatStore.disconnectFromChat()
      console.log('🔌 断开WebSocket连接')
    })
    
    return {
      chatUser,
      currentUser,
      messages,
      inputMessage,
      isLoading,
      hasMore,
      chatContentRef,
      formatMessageTime,
      formatChatTime,
      shouldShowTime,
      handleSendMessage,
      loadMoreMessages,
      goBack
    }
  }
}
</script>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.chat-header {
  flex-shrink: 0;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 80px;
}

/* 加载更多按钮 */
.load-more {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

/* 时间分隔 */
.time-separator {
  text-align: center;
  margin: 16px 0;
  font-size: 12px;
  color: #999;
  position: relative;
}

.time-separator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #eee;
  z-index: 1;
}

.time-separator span {
  background: #f5f5f5;
  padding: 0 8px;
  position: relative;
  z-index: 2;
}

.message-bubble {
  margin-bottom: 16px;
}

.other-message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.own-message-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 8px;
}

.avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.other-message .message-text {
  border-top-left-radius: 4px;
  background: #e8f4fd;
}

.own-message .message-text {
  border-top-right-radius: 4px;
  background: #95ec69;
  color: #000;
}

.message-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.chat-input {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #eee;
  padding: 8px 16px;
  padding-bottom: env(safe-area-inset-bottom, 8px);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.input-wrapper :deep(.van-field) {
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 16px;
}

.input-wrapper :deep(.van-field__control) {
  max-height: 120px;
  overflow-y: auto;
}

.input-wrapper :deep(.van-button) {
  height: 36px;
  border-radius: 18px;
  flex-shrink: 0;
}

.input-wrapper :deep(.van-button--disabled) {
  opacity: 0.5;
}

/* 滚动条样式 */
.chat-content::-webkit-scrollbar {
  width: 4px;
}

.chat-content::-webkit-scrollbar-track {
  background: transparent;
}

.chat-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.chat-content::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chat-content {
    padding: 12px;
  }
  
  .message-content {
    max-width: 80%;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
  }
}
</style>