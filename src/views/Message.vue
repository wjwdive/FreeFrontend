<template>
  <div class="message-container">
    <!-- 分类标签 -->
    <div class="category-tabs">
      <van-tabs 
        v-model:active="activeCategory" 
        @change="onCategoryChange"
        background="#fff"
        line-width="60px"
        line-height="3px"
        color="#1989fa"
      >
        <van-tab title="聊天">
          <!-- 聊天分类内容 -->
          <div class="category-content">
            <!-- 顶部搜索框 -->
            <!-- 聊天搜索框 -->
            <div class="search-section">
              <van-search
                v-model="searchValue"
                placeholder="搜索用户或消息"
                shape="round"
                background="#fff"
                autocomplete="off"
                autocapitalize="off"
                :spellcheck="false"
                @search="onSearch"
                @input="onInput"
              />
            </div>
            
            <!-- 搜索用户结果 -->
            <div v-if="showUserSearchResults" class="user-search-results">
              <div class="search-title">用户搜索结果</div>
              <div 
                v-for="user in userSearchResults" 
                :key="user.id"
                class="user-item"
                :class="{ 'current-user': isCurrentUser(user) }"
                @click="!isCurrentUser(user) && startChatWithUser(user)"
              >
                <div class="user-avatar">
                  <van-image
                    round
                    :src="getUserAvatar(user)"
                    :alt="user.username"
                  />
                  <!-- 当前用户标识 -->
                  <div v-if="isCurrentUser(user)" class="current-user-badge">我</div>
                </div>
                <div class="user-info">
                  <div class="user-name">
                    {{ user.username }}
                    <span v-if="isCurrentUser(user)" class="current-user-label">（当前用户）</span>
                  </div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
                <div class="user-status">
                  <van-tag :type="user.status === 'active' ? 'success' : 'danger'">
                    {{ user.status === 'active' ? '在线' : '离线' }}
                  </van-tag>
                </div>
              </div>
              <div v-if="userSearchResults.length === 0" class="no-results">
                未找到相关用户
              </div>
            </div>
            
            <!-- 消息列表 -->
            <div v-else class="message-list">
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
        </van-tab>
        
        <van-tab title="通讯录">
          <!-- 通讯录分类内容 -->
          <div class="category-content">
            <!-- 通讯录搜索框 -->
            <div class="search-section">
              <van-search
                v-model="contactSearchValue"
                placeholder="搜索联系人"
                shape="round"
                background="#fff"
                autocomplete="off"
                autocapitalize="off"
                :spellcheck="false"
                @search="onContactSearch"
                @input="onContactInput"
              />
            </div>
            
            <!-- 通讯录列表 -->
            <div class="contact-list">
              <van-index-bar :sticky="false">
                <div 
                  v-for="(group, index) in contactGroups" 
                  :key="index"
                >
                  <van-index-anchor :index="group.letter" />
                  <div 
                    v-for="contact in group.contacts" 
                    :key="contact.id"
                    class="contact-item"
                    :class="{ 'current-user': isCurrentUser(contact) }"
                    @click="!isCurrentUser(contact) && startChatWithContact(contact)"
                  >
                    <div class="contact-avatar">
                      <van-image
                        round
                        :src="contact.avatar"
                        :alt="contact.name"
                      />
                      <!-- 当前用户标识 -->
                      <div v-if="isCurrentUser(contact)" class="current-user-badge">我</div>
                    </div>
                    <div class="contact-info">
                      <div class="contact-name">
                        {{ contact.name }}
                        <span v-if="isCurrentUser(contact)" class="current-user-label">（当前用户）</span>
                      </div>
                      <div class="contact-status">
                        <van-tag :type="contact.status === 'online' ? 'success' : 'danger'">
                          {{ contact.status === 'online' ? '在线' : '离线' }}
                        </van-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </van-index-bar>
              
              <div v-if="contactGroups.length === 0" class="no-contacts">
                <van-empty image="search" description="暂无联系人" />
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { userAPI } from '@/services/api'

export default {
  name: 'Message',
  
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    // 分类相关
    const activeCategory = ref(0) // 0: 聊天, 1: 通讯录
    
    // 聊天分类相关
    const searchValue = ref('')
    const showUserSearchResults = ref(false)
    const userSearchResults = ref([])
    const searchLoading = ref(false)
    
    // 消息列表相关
    const messageList = ref([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    
    // 通讯录分类相关
    const contactSearchValue = ref('')
    const contactList = ref([])
    
    // 获取当前登录用户信息
    const currentUser = computed(() => {
      const userInfo = userStore.userInfo || {}
      
      // 尝试多种可能的用户ID字段名
      const userId = userInfo.userId || userInfo.id || userInfo._id || userInfo.user_id || ''
      
      // 尝试多种可能的用户名字段名
      const username = userInfo.username || userInfo.name || userInfo.nickname || userInfo.userName || ''
      
      return {
        id: userId,
        username: username
      }
    })
    
    // 检查用户是否是当前登录用户
    const isCurrentUser = (user) => {
      if (!currentUser.value.id || !user.id) return false
      
      // 比较用户ID（转换为字符串比较）
      return currentUser.value.id.toString() === user.id.toString()
    }
    
    // 分类切换处理
    const onCategoryChange = (index) => {
      console.log(`切换到分类: ${index === 0 ? '聊天' : '通讯录'}`)
      
      // 重置搜索状态
      if (index === 0) {
        // 切换到聊天分类
        showUserSearchResults.value = false
        userSearchResults.value = []
      } else {
        // 切换到通讯录分类
        contactSearchValue.value = ''
      }
    }
    
    // 开始与用户聊天
    const startChatWithUser = (user) => {
      console.log('💬 开始与用户聊天:', user)
      
      // 检查是否是当前登录用户
      if (isCurrentUser(user)) {
        console.log('🚫 不能与自己聊天')
        showFailToast('不能与自己聊天')
        return
      }
      
      // 跳转到聊天页面
      router.push({
        name: 'Chat',
        query: {
          userId: user.id,
          username: user.username,
          avatar: getUserAvatar(user)
        }
      })
    }
    
    // 开始与联系人聊天
    const startChatWithContact = (contact) => {
      console.log('💬 开始与联系人聊天:', contact)
      
      // 检查是否是当前登录用户
      if (isCurrentUser(contact)) {
        console.log('🚫 不能与自己聊天')
        showFailToast('不能与自己聊天')
        return
      }
      
      // 跳转到聊天页面
      router.push({
        name: 'Chat',
        query: {
          userId: contact.id,
          username: contact.name,
          avatar: contact.avatar
        }
      })
    }
    
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
    
    // 模拟通讯录数据生成
    const generateMockContacts = () => {
      const contacts = [
        { id: 1, name: '张三', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg', status: 'online' },
        { id: 2, name: '李四', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/dog.jpeg', status: 'offline' },
        { id: 3, name: '王五', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/logo.png', status: 'online' },
        { id: 4, name: '赵六', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg', status: 'offline' },
        { id: 5, name: '钱七', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/dog.jpeg', status: 'online' },
        { id: 6, name: '孙八', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/logo.png', status: 'online' },
        { id: 7, name: '周九', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg', status: 'offline' },
        { id: 8, name: '吴十', avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/dog.jpeg', status: 'online' }
      ]
      
      // 按姓名首字母分组
      const groups = {}
      contacts.forEach(contact => {
        const letter = contact.name.charAt(0).toUpperCase()
        if (!groups[letter]) {
          groups[letter] = []
        }
        groups[letter].push(contact)
      })
      
      // 转换为数组格式
      return Object.keys(groups).sort().map(letter => ({
        letter,
        contacts: groups[letter].sort((a, b) => a.name.localeCompare(b.name))
      }))
    }
    
    // 计算属性：过滤后的通讯录分组
    const contactGroups = computed(() => {
      if (!contactSearchValue.value.trim()) {
        return generateMockContacts()
      }
      
      const searchTerm = contactSearchValue.value.toLowerCase()
      const allContacts = generateMockContacts().flatMap(group => group.contacts)
      const filteredContacts = allContacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm)
      )
      
      // 重新分组
      const groups = {}
      filteredContacts.forEach(contact => {
        const letter = contact.name.charAt(0).toUpperCase()
        if (!groups[letter]) {
          groups[letter] = []
        }
        groups[letter].push(contact)
      })
      
      return Object.keys(groups).sort().map(letter => ({
        letter,
        contacts: groups[letter].sort((a, b) => a.name.localeCompare(b.name))
      }))
    })
    
    // 聊天分类搜索功能
    const onSearch = () => {
      if (searchValue.value.trim()) {
        searchUsers()
      }
    }
    
    // 聊天分类输入监听（优化防抖实现）
    const onInput = () => {
      const keyword = searchValue.value.trim()
      
      // 清除之前的超时
      clearSearchTimeout()
      
      if (keyword) {
        // 设置新的防抖超时（300ms）
        searchTimeout.value = setTimeout(() => {
          searchUsers()
        }, 300)
      } else {
        // 清空搜索框时立即隐藏结果
        showUserSearchResults.value = false
        userSearchResults.value = []
      }
    }
    
    // 通讯录搜索功能
    const onContactSearch = () => {
      // 搜索逻辑在contactGroups计算属性中实现
      console.log('搜索联系人:', contactSearchValue.value)
    }
    
    // 通讯录输入监听
    const onContactInput = () => {
      // 搜索逻辑在contactGroups计算属性中实现
      console.log('输入联系人搜索:', contactSearchValue.value)
    }
    
    // 搜索超时变量（使用ref管理，提供更好的响应式控制）
    const searchTimeout = ref(null)
    
    // 清除搜索超时
    const clearSearchTimeout = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
        searchTimeout.value = null
      }
    }
    
    // 调用真实用户搜索API
    const searchUsers = async () => {
      const keyword = searchValue.value.trim()
      if (!keyword) {
        showUserSearchResults.value = false
        userSearchResults.value = []
        return
      }
      
      searchLoading.value = true
      
      try {
        console.log('🔍 开始搜索用户，关键词:', keyword)
        
        // 调用真实API接口
        let params = {"keyword": keyword, "searchType": "username"}
        const response = await userAPI.searchUsers(params)
        
        console.log('📊 搜索API响应:', response)
        
        // 处理不同的API响应格式
        let users = []
        
        // 格式1: 包含data字段 { data: { users: [] } }
        if (response.data && Array.isArray(response.data.users)) {
          users = response.data.users
        }
        // 格式2: 直接返回用户数组 { users: [] }
        else if (Array.isArray(response.users)) {
          users = response.users
        }
        // 格式3: 直接返回数组
        else if (Array.isArray(response)) {
          users = response
        }
        // 格式4: 其他可能的格式
        else if (response && typeof response === 'object') {
          // 尝试从响应对象中提取用户数据
          users = Object.values(response).find(val => Array.isArray(val)) || []
        }
        
        userSearchResults.value = users
        showUserSearchResults.value = true
        
        if (users.length === 0) {
          console.log('未找到相关用户')
          showFailToast('未找到相关用户')
        } else {
          showSuccessToast(`找到 ${users.length} 个用户`)
        }
        
      } catch (error) {
        console.error('❌ 搜索用户失败:', error)
        
        // 优雅降级：如果真实API调用失败，使用模拟数据
        console.log('⚠️ API调用失败，使用模拟数据作为降级方案')
        
        // 模拟搜索结果作为降级方案
        const mockUsers = [
          { id: 1, username: '张三', email: 'zhangsan@example.com', status: 'active' },
          { id: 2, username: '李四', email: 'lisi@example.com', status: 'inactive' },
          { id: 3, username: '王五', email: 'wangwu@example.com', status: 'active' },
          { id: 4, username: '赵六', email: 'zhaoliu@example.com', status: 'active' },
          { id: 5, username: '钱七', email: 'qianqi@example.com', status: 'inactive' }
        ]
        
        const searchTerm = keyword.toLowerCase()
        const filteredUsers = mockUsers.filter(user => 
          user.username.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        )
        
        userSearchResults.value = filteredUsers
        showUserSearchResults.value = true
        
        if (filteredUsers.length === 0) {
          console.log('未找到相关用户')
          showFailToast('未找到相关用户')
        } else {
          showSuccessToast(`找到 ${filteredUsers.length} 个用户（模拟数据）`)
        }
        
      } finally {
        searchLoading.value = false
      }
    }
    
    // 获取用户头像
    const getUserAvatar = (user) => {
      const avatars = [
        'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/dog.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/logo.png'
      ]
      return avatars[user.id % avatars.length]
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
    
    // 组件卸载时清理超时
    onUnmounted(() => {
      clearSearchTimeout()
    })
    
    return {
      activeCategory,
      searchValue,
      showUserSearchResults,
      userSearchResults,
      searchLoading,
      messageList,
      loading,
      finished,
      refreshing,
      contactSearchValue,
      contactGroups,
      onCategoryChange,
      onSearch,
      onInput,
      onContactSearch,
      onContactInput,
      onRefresh,
      onLoad,
      viewMessageDetail,
      getUserAvatar,
      startChatWithUser,
      startChatWithContact,
      isCurrentUser
    }
  }
}
</script>

<style scoped>
/* 消息容器样式 */
.message-container {
  height: 100vh;
  background-color: #f5f5f5;
}

/* 分类标签样式 */
.category-tabs {
  height: 100%;
}

.category-tabs :deep(.van-tabs__wrap) {
  position: sticky;
  top: 0;
  z-index: 100;
}

.category-tabs :deep(.van-tab__pane) {
  height: calc(100vh - 44px);
  overflow-y: auto;
}

.category-content {
  height: 100%;
}

/* 搜索区域样式 */
.search-section {
  background-color: #fff;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
}

/* 用户搜索结果样式 */
.user-search-results {
  background-color: #fff;
  min-height: 200px;
}

.search-title {
  padding: 12px 16px;
  font-size: 14px;
  color: #999;
  border-bottom: 1px solid #f0f0f0;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f8f8f8;
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: #f8f8f8;
}

/* 当前用户样式 */
.user-item.current-user {
  background-color: #f0f8ff;
  cursor: not-allowed;
  opacity: 0.7;
}

.user-item.current-user:hover {
  background-color: #e6f3ff;
}

.user-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

/* 调整头像图片大小 */
.user-avatar :deep(.van-image) {
  width: 36px !important;
  height: 36px !important;
}

.current-user-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #1989fa;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.current-user-label {
  font-size: 12px;
  color: #1989fa;
  font-weight: normal;
}

.user-email {
  font-size: 12px;
  color: #999;
}

.user-status {
  margin-left: 8px;
}

.no-results {
  padding: 40px 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 消息列表样式 */
.message-list {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #f8f8f8;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-item:hover {
  background-color: #f8f8f8;
}

.message-item.unread {
  background-color: #f8fbff;
}

.message-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

/* 调整消息列表头像大小 */
.message-avatar :deep(.van-image) {
  width: 40px !important;
  height: 40px !important;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #ee0a24;
  border-radius: 50%;
  border: 2px solid #fff;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-nickname {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.message-time {
  font-size: 12px;
  color: #999;
}

.message-summary {
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

/* 通讯录样式 */
.contact-list {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f8f8f8;
  cursor: pointer;
  transition: background-color 0.2s;
}

.contact-item:hover {
  background-color: #f8f8f8;
}

/* 当前用户样式 */
.contact-item.current-user {
  background-color: #f0f8ff;
  cursor: not-allowed;
  opacity: 0.7;
}

.contact-item.current-user:hover {
  background-color: #e6f3ff;
}

.contact-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

/* 调整通讯录头像大小 */
.contact-avatar :deep(.van-image) {
  width: 36px !important;
  height: 36px !important;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.no-contacts {
  padding: 40px 16px;
  text-align: center;
}

/* 索引栏样式 */
.contact-list :deep(.van-index-anchor) {
  background-color: #f5f5f5;
  color: #666;
  font-weight: 500;
}

.contact-list :deep(.van-index-bar__index) {
  color: #1989fa;
}
</style>