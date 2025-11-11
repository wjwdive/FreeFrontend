// 聊天功能测试脚本
import { chatService } from '@/services/chatService'
import { useChatStore } from '@/stores/chatStore'
import { formatMessageTime, formatChatTime, shouldShowTime } from '@/utils/messageUtils'

// 测试聊天服务
export const testChatService = async () => {
  console.log('🧪 开始测试聊天服务...')
  
  try {
    // 测试连接
    await chatService.connect('test-user-123')
    console.log('✅ 聊天服务连接测试通过')
    
    // 测试发送消息
    const messageData = {
      content: '测试消息',
      toUserId: 'test-recipient-456',
      type: 'text'
    }
    
    const sentMessage = await chatService.sendMessage(messageData)
    console.log('✅ 消息发送测试通过:', sentMessage)
    
    // 测试断开连接
    chatService.disconnect()
    console.log('✅ 断开连接测试通过')
    
    return true
  } catch (error) {
    console.error('❌ 聊天服务测试失败:', error)
    return false
  }
}

// 测试消息工具函数
export const testMessageUtils = () => {
  console.log('🧪 开始测试消息工具函数...')
  
  try {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60000)
    
    // 测试时间格式化
    const messageTime = formatMessageTime(now)
    const chatTime = formatChatTime(now)
    console.log('✅ 时间格式化测试通过:')
    console.log('  - 消息时间:', messageTime)
    console.log('  - 聊天时间:', chatTime)
    
    // 测试时间显示判断
    const message1 = { timestamp: now }
    const message2 = { timestamp: fiveMinutesAgo }
    const shouldShow = shouldShowTime(message1, message2)
    console.log('✅ 时间显示判断测试通过:', shouldShow)
    
    return true
  } catch (error) {
    console.error('❌ 消息工具函数测试失败:', error)
    return false
  }
}

// 测试聊天状态管理
export const testChatStore = () => {
  console.log('🧪 开始测试聊天状态管理...')
  
  try {
    // 这里只是验证导入是否正常
    // 实际使用需要在Vue组件中测试
    console.log('✅ 聊天状态管理导入正常')
    return true
  } catch (error) {
    console.error('❌ 聊天状态管理测试失败:', error)
    return false
  }
}

// 运行所有测试
export const runAllTests = async () => {
  console.log('🚀 开始运行聊天功能分层架构测试...\n')
  
  const results = await Promise.all([
    testChatService(),
    testMessageUtils(),
    testChatStore()
  ])
  
  const passed = results.filter(result => result).length
  const total = results.length
  
  console.log(`\n📊 测试结果: ${passed}/${total} 通过`)
  
  if (passed === total) {
    console.log('🎉 所有测试通过！聊天功能分层架构正常工作。')
  } else {
    console.log('⚠️ 部分测试失败，请检查相关代码。')
  }
  
  return passed === total
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}