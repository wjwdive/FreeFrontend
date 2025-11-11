import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatService } from '@/services/chatService'
import { useUserStore } from '@/stores/user'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const currentChatUser = ref(null)
  const messages = ref([])
  const isLoading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(1)
  const currentRoomId = ref(null)
  const pageSize = 20

  // 获取用户store实例
  const userStore = useUserStore()

  // 计算属性
  const unreadCount = computed(() => {
    return messages.value.filter(msg => !msg.isRead && !msg.isOwn).length
  })

  const lastMessage = computed(() => {
    return messages.value.length > 0 ? messages.value[messages.value.length - 1] : null
  })

  // Actions
  const setCurrentChatUser = (user) => {
    currentChatUser.value = user
    console.log('💬 设置当前聊天用户:', user)
  }

  const addMessage = (message) => {
    messages.value.push({
      ...message,
      id: message.id || Date.now() + Math.random()
    })
    
    // 按时间排序
    messages.value.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    
    console.log('💾 添加消息到存储:', message)
  }

  const addMessages = (newMessages) => {
    messages.value = [...messages.value, ...newMessages]
    messages.value.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }





  const clearMessages = () => {
    messages.value = []
    currentPage.value = 1
    hasMore.value = true
  }

  const loadMoreMessages = async () => {
    if (isLoading.value || !hasMore.value) return
    
    isLoading.value = true
    
    try {
      // 模拟API调用加载更多消息
      const mockMessages = generateMockMessages(pageSize)
      
      if (mockMessages.length < pageSize) {
        hasMore.value = false
      }
      
      addMessages(mockMessages)
      currentPage.value++
      
      console.log('📥 加载更多消息，当前页:', currentPage.value)
    } catch (error) {
      console.error('加载消息失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  const sendMessage = async (messageData) => {
    try {
      if (!messageData.content || !messageData.content.trim()) {
        throw new Error('消息内容不能为空')
      }
      
      if (!messageData.fromUserId) {
        throw new Error('发送者用户ID不能为空')
      }
      
      if (!messageData.toUserId) {
        throw new Error('接收者用户ID不能为空')
      }
      
      // 立即在本地显示发送的消息（乐观更新）
      const tempMessage = {
        id: `temp-${Date.now()}-${Math.random()}`,
        content: messageData.content.trim(),
        timestamp: new Date(),
        isOwn: true,
        isRead: false,
        type: 'text',
        fromUserId: messageData.fromUserId, // 使用真实的发送者用户ID
        toUserId: messageData.toUserId,
        sending: true, // 标记为发送中状态
        error: null
      }
      
      addMessage(tempMessage)
      console.log('📤 开始发送消息（乐观更新）:', tempMessage)
      
      try {
        const sentMessage = await chatService.sendMessage(messageData)
        
        // 更新消息状态为发送成功
        const messageIndex = messages.value.findIndex(msg => msg.id === tempMessage.id)
        if (messageIndex !== -1) {
          messages.value[messageIndex] = {
            ...messages.value[messageIndex],
            sending: false,
            id: sentMessage.id || tempMessage.id,
            timestamp: new Date(sentMessage.timestamp || tempMessage.timestamp)
          }
        }
        
        console.log('✅ 消息发送成功:', sentMessage)
        return messages.value[messageIndex]
      } catch (sendError) {
        // 更新消息状态为发送失败
        const messageIndex = messages.value.findIndex(msg => msg.id === tempMessage.id)
        if (messageIndex !== -1) {
          messages.value[messageIndex] = {
            ...messages.value[messageIndex],
            sending: false,
            error: sendError.message
          }
        }
        
        console.error('❌ 消息发送失败:', sendError)
        
        // 如果是连接问题，尝试重新连接
        if (sendError.message.includes('未连接') || sendError.message.includes('断开')) {
          console.log('🔄 检测到连接问题，尝试重新连接...')
          try {
            await connectToChat(messageData.fromUserId)
            console.log('✅ 重新连接成功，可以重试发送消息')
          } catch (reconnectError) {
            console.error('❌ 重新连接失败:', reconnectError)
          }
        }
        
        throw sendError
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  // 移除模拟回复函数
  // const generateReply = () => {
  //   const replyMessage = generateReplyMessage('')
  //   addMessage(replyMessage)
  //   console.log('🤖 生成回复消息:', replyMessage)
  // }

  const loadInitialMessages = () => {
    // 清空现有消息
    clearMessages()
    
    // 添加一些初始消息
    const initialMessages = [
      {
        id: '1',
        content: '你好！很高兴和你聊天',
        timestamp: new Date(Date.now() - 300000),
        isOwn: false,
        isRead: true,
        type: 'text'
      },
      {
        id: '2',
        content: '你好！我也很高兴认识你',
        timestamp: new Date(Date.now() - 240000),
        isOwn: true,
        isRead: true,
        type: 'text'
      },
      {
        id: '3',
        content: '最近在忙什么呢？',
        timestamp: new Date(Date.now() - 180000),
        isOwn: false,
        isRead: true,
        type: 'text'
      }
    ]
    
    addMessages(initialMessages)
    console.log('📥 加载初始消息')
  }

  const connectToChat = async (userId) => {
    try {
      await chatService.connect(userId)
      
      // 设置新消息监听（微信式设计）
      chatService.onMessage((message) => {
        console.log('📥 WebSocket收到消息:', message)
        
        // 获取当前登录用户的ID（从userStore）
        const currentUserId = userStore.userInfo?.userId || userStore.userInfo?.id || userId
        
        // 转换消息字段名，适配服务器返回的格式
        const normalizedMessage = {
          id: message.id,
          content: message.content,
          timestamp: message.timestamp,
          type: message.type,
          // 适配不同的字段名：senderId -> fromUserId, roomId -> 解析出toUserId
          fromUserId: message.senderId || message.fromUserId,
          toUserId: message.toUserId || parseToUserIdFromRoomId(message.roomId, currentUserId),
          roomId: message.roomId
        }
        
        console.log('🔄 转换后的消息:', normalizedMessage)
        
        // 检查消息是否属于当前聊天会话
        const isCurrentChat = normalizedMessage.fromUserId === currentChatUser.value?.id || 
                               normalizedMessage.toUserId === currentChatUser.value?.id ||
                               normalizedMessage.fromUserId === currentUserId ||
                               normalizedMessage.toUserId === currentUserId
        
        if (isCurrentChat) {
          console.log('✅ 消息属于当前会话，添加到聊天记录')
          addMessage({
            ...normalizedMessage,
            isOwn: normalizedMessage.fromUserId === currentUserId, // 使用当前登录用户ID判断
            isRead: false
          })
        } else {
          console.log('❌ 消息不属于当前会话，忽略:', normalizedMessage.fromUserId, normalizedMessage.toUserId)
        }
      })
      
      // 连接成功后获取离线消息
      try {
        const offlineMessages = await chatService.fetchOfflineMessages()
        if (offlineMessages && offlineMessages.length > 0) {
          console.log('📥 处理离线消息:', offlineMessages.length, '条')
          
          // 过滤出当前聊天对象的离线消息
          const currentChatMessages = offlineMessages.filter(msg => 
            msg.fromUserId === currentChatUser.value?.id || 
            msg.toUserId === currentChatUser.value?.id
          )
          
          if (currentChatMessages.length > 0) {
            addMessages(currentChatMessages.map(msg => ({
              ...msg,
              isOwn: msg.fromUserId === userId,
              isRead: false
            })))
          }
        }
      } catch (error) {
        console.warn('获取离线消息失败:', error)
      }
      
      console.log('✅ 聊天服务连接成功')
    } catch (error) {
      console.error('连接聊天服务失败:', error)
      throw error
    }
  }

  const disconnectFromChat = () => {
    // 发送已读回执（标记所有未读消息为已读）
    const unreadMessageIds = messages.value
      .filter(msg => !msg.isRead && !msg.isOwn)
      .map(msg => msg.id)
    
    if (unreadMessageIds.length > 0) {
      chatService.sendReadReceipt(unreadMessageIds).catch(error => {
        console.warn('发送已读回执失败:', error)
      })
    }
    
    chatService.disconnect()
    clearMessages()
    currentChatUser.value = null
  }

  // 标记消息为已读并发送已读回执
  const markMessageAsRead = (messageId) => {
    const message = messages.value.find(msg => msg.id === messageId)
    if (message && !message.isOwn && !message.isRead) {
      message.isRead = true
      
      // 发送已读回执给服务器
      chatService.sendReadReceipt([messageId]).catch(error => {
        console.warn('发送已读回执失败:', error)
      })
    }
  }

  // 标记所有消息为已读
  const markAllAsRead = () => {
    const unreadMessageIds = []
    
    messages.value.forEach(msg => {
      if (!msg.isOwn && !msg.isRead) {
        msg.isRead = true
        unreadMessageIds.push(msg.id)
      }
    })
    
    // 发送批量已读回执
    if (unreadMessageIds.length > 0) {
      chatService.sendReadReceipt(unreadMessageIds).catch(error => {
        console.warn('发送已读回执失败:', error)
      })
    }
  }

  // 工具函数
  const generateMockMessages = (count) => {
    const mockMessages = []
    const now = new Date()
    
    for (let i = 0; i < count; i++) {
      const isOwn = Math.random() > 0.5
      const minutesAgo = (count - i) * 5 // 每5分钟一条消息
      
      mockMessages.push({
        id: `mock-${Date.now()}-${i}`,
        content: isOwn ? `我发送的消息 ${i + 1}` : `${currentChatUser.value?.username || '对方'}的消息 ${i + 1}`,
        timestamp: new Date(now.getTime() - minutesAgo * 60000),
        isOwn,
        isRead: isOwn || Math.random() > 0.3,
        type: 'text'
      })
    }
    
    return mockMessages
  }

  const generateReplyMessage = (userMessage) => {
    const replies = [
      '好的，收到！',
      '明白了，谢谢！',
      '这个想法不错',
      '我也有同感',
      '稍后回复你',
      '正在处理中',
      '没问题',
      '好的，了解',
      '感谢分享',
      '很有趣的观点'
    ]
    
    let reply = replies[Math.floor(Math.random() * replies.length)]
    
    // 简单关键词匹配
    if (userMessage.includes('你好') || userMessage.includes('您好')) {
      reply = '你好！很高兴和你聊天'
    } else if (userMessage.includes('谢谢')) {
      reply = '不客气！'
    } else if (userMessage.includes('？') || userMessage.includes('?')) {
      reply = '这个问题我需要考虑一下'
    }
    
    return {
      id: `reply-${Date.now()}`,
      content: reply,
      timestamp: new Date(),
      isOwn: false,
      isRead: false,
      type: 'text',
      fromUserId: currentChatUser.value?.id
    }
  }

  return {
    // 状态
    currentChatUser,
    messages,
    isLoading,
    hasMore,
    
    // 计算属性
    unreadCount,
    lastMessage,
    hasMoreMessages: hasMore,
    
    // Actions
    setCurrentChatUser,
    addMessage,
    addMessages,
    markMessageAsRead,
    markAllAsRead,
    clearMessages,
    loadMoreMessages,
    sendMessage,
    // generateReply, // 移除模拟回复函数
    loadInitialMessages,
    connectToChat,
    disconnectFromChat
  }
})

// 工具函数：从roomId解析出toUserId
const parseToUserIdFromRoomId = (roomId, currentUserId) => {
  if (!roomId || !roomId.startsWith('room_')) {
    return null
  }
  
  try {
    const parts = roomId.split('_')
    if (parts.length >= 3) {
      const userId1 = parts[1]
      const userId2 = parts[2]
      
      // 返回不是当前用户的那个ID
      if (userId1 === currentUserId) {
        return userId2
      } else if (userId2 === currentUserId) {
        return userId1
      }
    }
  } catch (error) {
    console.warn('解析roomId失败:', error)
  }
  
  return null
}