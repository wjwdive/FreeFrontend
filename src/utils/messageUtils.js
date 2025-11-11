// 消息工具函数

// 格式化时间显示
export const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // 今天
  if (isToday(date)) {
    return formatTime(date)
  }
  
  // 昨天
  if (isYesterday(date)) {
    return `昨天 ${formatTime(date)}`
  }
  
  // 本周内
  if (isThisWeek(date)) {
    return `${getWeekday(date)} ${formatTime(date)}`
  }
  
  // 今年内
  if (isThisYear(date)) {
    return `${formatDate(date)} ${formatTime(date)}`
  }
  
  // 其他时间
  return `${formatFullDate(date)} ${formatTime(date)}`
}

// 格式化聊天列表时间（简化显示）
export const formatChatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else if (isYesterday(date)) { // 昨天
    return '昨天'
  } else if (isThisWeek(date)) { // 本周内
    return getWeekday(date)
  } else if (isThisYear(date)) { // 今年内
    return formatDate(date)
  } else {
    return formatFullDate(date)
  }
}

// 检查是否为今天
export const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

// 检查是否为昨天
export const isYesterday = (date) => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear()
}

// 检查是否为本周
export const isThisWeek = (date) => {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  return date >= startOfWeek
}

// 检查是否为本年
export const isThisYear = (date) => {
  const now = new Date()
  return date.getFullYear() === now.getFullYear()
}

// 获取星期几
export const getWeekday = (date) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

// 格式化时间（HH:mm）
export const formatTime = (date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
}

// 格式化日期（MM-DD）
export const formatDate = (date) => {
  return `${date.getMonth() + 1}-${date.getDate()}`
}

// 格式化完整日期（YYYY-MM-DD）
export const formatFullDate = (date) => {
  return date.toLocaleDateString('zh-CN')
}

// 消息内容处理
export const processMessageContent = (content, type = 'text') => {
  switch (type) {
    case 'text':
      return escapeHtml(content)
    case 'image':
      return '[图片]'
    case 'file':
      return '[文件]'
    case 'voice':
      return '[语音]'
    default:
      return content
  }
}

// HTML转义
export const escapeHtml = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 生成消息ID
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 检查消息是否有效
export const isValidMessage = (message) => {
  return message && 
         message.content && 
         message.content.trim().length > 0 &&
         message.timestamp &&
         typeof message.isOwn === 'boolean'
}

// 消息分组（按日期）
export const groupMessagesByDate = (messages) => {
  const groups = {}
  
  messages.forEach(message => {
    const dateKey = new Date(message.timestamp).toDateString()
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    
    groups[dateKey].push(message)
  })
  
  return groups
}

// 计算消息显示时间间隔
export const shouldShowTime = (currentMessage, previousMessage, timeThreshold = 300000) => {
  if (!previousMessage) return true
  
  const currentTime = new Date(currentMessage.timestamp)
  const previousTime = new Date(previousMessage.timestamp)
  const timeDiff = currentTime - previousTime
  
  return timeDiff > timeThreshold // 5分钟
}

// 消息搜索
export const searchMessages = (messages, keyword) => {
  if (!keyword.trim()) return messages
  
  const searchTerm = keyword.toLowerCase()
  return messages.filter(message => 
    message.content.toLowerCase().includes(searchTerm)
  )
}

// 消息统计
export const getMessageStats = (messages) => {
  const total = messages.length
  const sent = messages.filter(msg => msg.isOwn).length
  const received = total - sent
  const unread = messages.filter(msg => !msg.isRead && !msg.isOwn).length
  
  return {
    total,
    sent,
    received,
    unread,
    readRate: received > 0 ? ((received - unread) / received * 100).toFixed(1) : '0.0'
  }
}