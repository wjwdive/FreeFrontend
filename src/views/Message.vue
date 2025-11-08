<template>
  <div class="message-container">
    <!-- 顶部搜索框 -->
    <div class="search-section">
      <van-search
        v-model="searchValue"
        placeholder="搜索消息"
        shape="round"
        background="#fff"
        @search="onSearch"
      />
    </div>
    
    <!-- 消息列表 -->
    <div class="message-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多消息了"
          @load="onLoad"
        >
          <div 
            v-for="message in messageList" 
            :key="message.id"
            class="message-item"
            :class="{ unread: !message.read }"
            @click="viewMessageDetail(message)"
          >
            <!-- 消息发送人头像 -->
            <div class="message-avatar">
              <van-image
                round
                :src="message.avatar"
                :alt="message.nickname"
              />
              <!-- 未读消息红点 -->
              <div v-if="!message.read" class="unread-dot"></div>
            </div>
            
            <!-- 消息内容 -->
            <div class="message-content">
              <div class="message-header">
                <div class="message-nickname">{{ message.nickname }}</div>
                <div class="message-time">{{ message.time }}</div>
              </div>
              <div class="message-summary">{{ message.summary }}</div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'

export default {
  name: 'Message',
  
  setup() {
    const router = useRouter()
    
    // 搜索相关
    const searchValue = ref('')
    
    // 消息列表相关
    const messageList = ref([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    
    // 模拟消息数据生成
    const generateMockMessages = (count = 10) => {
      const mockMessages = []
      const avatars = [
        'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/dog.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/logo.png'
      ]
      
      const nicknames = ['技术交流群', '前端开发小组', '后端架构师', 'AI学习小组', '产品经理群']
      const summaries = [
        '大家最近有学习Vue3的新特性吗？',
        '关于React性能优化有什么好的建议？',
        'Node.js项目部署的最佳实践',
        '微服务架构设计讨论',
        '前端工程化建设方案分享',
        '移动端适配方案总结',
        '数据库索引优化指南',
        'Docker容器化部署经验',
        'Webpack 5新特性解析',
        'TypeScript高级用法讨论'
      ]
      
      const timeOptions = ['刚刚', '5分钟前', '1小时前', '3小时前', '昨天', '2天前']
      
      for (let i = 0; i < count; i++) {
        mockMessages.push({
          id: Date.now() + i,
          avatar: avatars[i % avatars.length],
          nickname: nicknames[i % nicknames.length],
          time: timeOptions[i % timeOptions.length],
          summary: summaries[i % summaries.length],
          read: Math.random() > 0.3 // 70%的消息已读，30%未读
        })
      }
      
      return mockMessages
    }
    
    // 搜索功能
    const onSearch = () => {
      if (searchValue.value.trim()) {
        showSuccessToast(`搜索消息: ${searchValue.value}`)
        loadData(true)
      }
    }
    
    // 数据加载
    const loadData = (reset = false) => {
      if (reset) {
        messageList.value = []
        finished.value = false
      }
      
      // 模拟API请求延迟
      setTimeout(() => {
        if (reset) {
          messageList.value = generateMockMessages(10)
        } else {
          messageList.value = messageList.value.concat(generateMockMessages(5))
        }
        
        loading.value = false
        refreshing.value = false
        
        // 模拟数据加载完成
        if (messageList.value.length >= 20) {
          finished.value = true
        }
      }, 500)
    }
    
    // 下拉刷新
    const onRefresh = () => {
      refreshing.value = true
      loadData(true)
    }
    
    // 上拉加载更多
    const onLoad = () => {
      loading.value = true
      loadData()
    }
    
    // 查看消息详情
    const viewMessageDetail = (message) => {
      // 标记消息为已读
      message.read = true
      showSuccessToast(`查看消息: ${message.nickname}`)
      // 这里可以跳转到聊天页面
      // router.push(`/chat/${message.id}`)
    }
    
    onMounted(() => {
      // 初始化加载数据
      loadData(true)
    })
    
    return {
      searchValue,
      messageList,
      loading,
      finished,
      refreshing,
      onSearch,
      onRefresh,
      onLoad,
      viewMessageDetail
    }
  }
}
</script>

<style scoped>
.message-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-section {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-list {
  padding: 16px;
  background-color: #f5f5f5;
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.message-item:active {
  background-color: #f8f8f8;
  transform: scale(0.98);
}

.message-item.unread {
  background-color: #f8fbff;
}

.message-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.message-avatar .van-image {
  width: 48px;
  height: 48px;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ff4444;
  border-radius: 50%;
  border: 2px solid white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.message-nickname {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  margin-left: 8px;
}

.message-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 列表加载状态样式 */
:deep(.van-list__finished-text) {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}

:deep(.van-list__loading) {
  text-align: center;
  padding: 20px 0;
}
</style>