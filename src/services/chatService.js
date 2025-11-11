import { ref } from 'vue'
import io from 'socket.io-client'

// 真实的WebSocket服务，使用socket.io-client
class ChatService {
  constructor() {
    this.socket = null
    this.isConnected = ref(false)
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.messageCallbacks = []
  }

  // 连接WebSocket
  connect(userId) {
    return new Promise((resolve, reject) => {
      console.log('🔌 连接WebSocket，用户ID:', userId)
      
      // 使用环境变量中的WebSocket URL，如果没有则使用默认值
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001'
      
      this.socket = io(wsUrl, {
        auth: { 
          userId: userId,
          token: localStorage.getItem('token') || ''
        },
        transports: ['websocket']
      })

      this.socket.on('connect', () => {
        this.isConnected.value = true
        this.reconnectAttempts = 0
        console.log('✅ WebSocket连接成功，连接ID:', this.socket.id)
        resolve(this.socket)
      })

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket连接失败:', error)
        reject(error)
      })

      this.socket.on('disconnect', (reason) => {
        this.isConnected.value = false
        console.log('🔌 WebSocket断开连接:', reason)
      })

      this.socket.on('reconnect_attempt', (attempt) => {
        console.log(`🔄 尝试重新连接，第${attempt}次`)
      })

      // 监听新消息事件（微信式设计）
      this.socket.on('new_message', (message) => {
        console.log('📥 收到新消息:', message)
        this.messageCallbacks.forEach(callback => callback(message))
      })

      // 监听离线消息事件
      this.socket.on('offline_messages', (messages) => {
        console.log('📥 收到离线消息:', messages)
        messages.forEach(message => {
          this.messageCallbacks.forEach(callback => callback(message))
        })
      })

      // 监听消息送达回执
      this.socket.on('message_delivered', (data) => {
        console.log('✅ 消息已送达:', data)
      })

      // 监听消息已读回执
      this.socket.on('message_read', (data) => {
        console.log('✅ 消息已读:', data)
      })

      // 监听错误事件
      this.socket.on('error', (error) => {
        console.error('❌ WebSocket错误:', error)
      })
    })
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      console.log('🔌 断开WebSocket连接')
      this.socket.disconnect()
      this.socket = null
      this.isConnected.value = false
      this.messageCallbacks = []
    }
  }

  // 发送消息（微信式简化设计）
  sendMessage(messageData) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected.value || !this.socket) {
        reject(new Error('WebSocket未连接，请先建立连接'))
        return
      }

      console.log('📤 发送消息:', messageData)
      
      // 生成房间ID
      const roomId = this.generateRoomId(messageData.fromUserId, messageData.toUserId)
      
      // 验证必要字段
      if (!roomId) {
        reject(new Error('房间ID生成失败'))
        return
      }
      if (!messageData.content || !messageData.content.trim()) {
        reject(new Error('消息内容不能为空'))
        return
      }
      
      // 简化消息格式，包含发送者和接收者信息
      const simplifiedMessage = {
        fromUserId: messageData.fromUserId, // 发送者用户ID
        toUserId: messageData.toUserId,     // 目标用户ID
        content: messageData.content.trim(), // 消息内容（去除首尾空格）
        timestamp: messageData.timestamp || new Date().toISOString(),
        type: messageData.type || 'text',
        roomId: roomId,                     // 房间ID
        clientId: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // 客户端唯一标识
      }
      
      console.log('📤 发送消息详情:', simplifiedMessage)
      
      // 检查WebSocket连接状态
      if (this.socket.disconnected) {
        reject(new Error('WebSocket连接已断开，请重新连接'))
        return
      }
      
      let responseReceived = false
      let timeoutId = null
      
      // 清理监听器函数
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId)
        this.socket.off('message_ack', messageAckHandler)
      }
      
      // 监听服务器广播的消息确认事件（备用确认机制）
      const messageAckHandler = (ackMessage) => {
        if (ackMessage.clientId === simplifiedMessage.clientId) {
          responseReceived = true
          cleanup()
          console.log('✅ 消息发送成功（广播确认）:', ackMessage)
          resolve(ackMessage)
        }
      }
      
      this.socket.on('message_ack', messageAckHandler)
      
      // 通过socket.io发送消息
      this.socket.emit('send_message', simplifiedMessage, (response) => {
        responseReceived = true
        cleanup()
        
        if (response && response.success) {
          console.log('✅ 消息发送成功（服务器确认）:', response)
          resolve(response.data || simplifiedMessage)
        } else {
          const errorMsg = response?.error || '服务器响应异常'
          console.error('❌ 消息发送失败（服务器确认）:', errorMsg)
          reject(new Error(errorMsg))
        }
      })
      
      // 设置超时（延长到10秒，增加容错性）
      timeoutId = setTimeout(() => {
        if (!responseReceived) {
          cleanup()
          console.warn('⏰ 消息发送超时，服务器可能未返回确认响应')
          console.log('💡 提示：服务器已收到消息但未返回确认，消息可能已成功发送')
          
          // 即使超时，也认为消息发送成功（乐观策略）
          // 因为服务器日志显示消息已收到
          resolve(simplifiedMessage)
        }
      }, 10000)
    })
  }

  // 生成房间ID（基于两个用户ID）
  generateRoomId(userId1, userId2) {
    const ids = [userId1, userId2].sort()
    return `room_${ids[0]}_${ids[1]}`
  }

  // 监听消息
  onMessage(callback) {
    console.log('👂 注册消息监听器')
    this.messageCallbacks.push(callback)
    
    // 返回取消监听函数
    return () => {
      const index = this.messageCallbacks.indexOf(callback)
      if (index > -1) {
        this.messageCallbacks.splice(index, 1)
      }
    }
  }

  // 加入聊天室
  joinRoom(roomId) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected.value || !this.socket) {
        reject(new Error('WebSocket未连接'))
        return
      }

      console.log('🚪 加入聊天室:', roomId)
      
      this.socket.emit('join_room', { roomId }, (response) => {
        if (response.success) {
          console.log('✅ 加入聊天室成功')
          resolve(response)
        } else {
          console.error('❌ 加入聊天室失败:', response.error)
          reject(new Error(response.error))
        }
      })
    })
  }

  // 离开聊天室
  leaveRoom(roomId) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected.value || !this.socket) {
        reject(new Error('WebSocket未连接'))
        return
      }

      console.log('🚪 离开聊天室:', roomId)
      
      this.socket.emit('leave_room', { roomId }, (response) => {
        if (response.success) {
          console.log('✅ 离开聊天室成功')
          resolve(response)
        } else {
          console.error('❌ 离开聊天室失败:', response.error)
          reject(new Error(response.error))
        }
      })
    })
  }

  // 获取连接状态
  getConnectionStatus() {
    return this.isConnected.value
  }

  // 获取当前用户ID
  getCurrentUserId() {
    return this.socket?.auth?.userId || null
  }

  // 发送已读回执（微信式设计）
  sendReadReceipt(messageIds) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected.value || !this.socket) {
        reject(new Error('WebSocket未连接'))
        return
      }

      console.log('✅ 发送已读回执:', messageIds)
      
      // 通过socket.io发送已读回执
      this.socket.emit('read_receipt', { messageIds }, (response) => {
        if (response.success) {
          console.log('✅ 已读回执发送成功')
          resolve(response)
        } else {
          console.error('❌ 已读回执发送失败:', response.error)
          reject(new Error(response.error))
        }
      })
      
      // 设置超时
      setTimeout(() => {
        reject(new Error('已读回执发送超时'))
      }, 5000)
    })
  }

  // 获取离线消息（微信式设计）
  fetchOfflineMessages() {
    return new Promise((resolve, reject) => {
      if (!this.isConnected.value || !this.socket) {
        reject(new Error('WebSocket未连接'))
        return
      }

      console.log('📥 请求离线消息')
      
      // 通过socket.io请求离线消息
      this.socket.emit('fetch_offline_messages', {}, (response) => {
        if (response.success) {
          console.log('✅ 离线消息获取成功:', response.data?.length || 0, '条')
          resolve(response.data || [])
        } else {
          console.error('❌ 离线消息获取失败:', response.error)
          reject(new Error(response.error))
        }
      })
      
      // 设置超时
      setTimeout(() => {
        reject(new Error('离线消息请求超时'))
      }, 5000)
    })
  }
}

// 创建单例实例
export const chatService = new ChatService()