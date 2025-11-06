<template>
  <div class="home-container">
    <!-- 顶部搜索框 -->
    <div class="search-section">
      <van-search
        v-model="searchValue"
        placeholder="搜索内容"
        shape="round"
        background="#fff"
        @search="onSearch"
      />
    </div>
    
    <!-- 分类标签 -->
    <div class="category-section">
      <van-tabs v-model:active="activeCategory" swipeable @change="onCategoryChange">
        <van-tab 
          v-for="category in categories" 
          :key="category.id"
          :title="category.name"
          :name="category.id"
        >
          <!-- 内容列表 -->
          <div class="content-list">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
              <van-list
                v-model:loading="loading"
                :finished="finished"
                finished-text="没有更多了"
                @load="onLoad"
              >
                <div 
                  v-for="item in contentList" 
                  :key="item.id"
                  class="content-item"
                  @click="viewContentDetail(item)"
                >
                  <!-- 用户信息 -->
                  <div class="user-info">
                    <van-image
                      class="avatar"
                      round
                      :src="item.avatar"
                      :alt="item.nickname"
                    />
                    <div class="user-details">
                      <div class="nickname">{{ item.nickname }}</div>
                      <div class="publish-time">{{ item.publishTime }}</div>
                    </div>
                  </div>
                  
                  <!-- 内容标题和摘要 -->
                  <div class="content-main">
                    <h3 class="title">{{ item.title }}</h3>
                    <p class="summary">{{ item.summary }}</p>
                  </div>
                  
                  <!-- 操作按钮 -->
                  <div class="action-buttons">
                    <div class="action-item" @click.stop="handleLike(item)">
                      <van-icon name="good-job-o" />
                      <span>{{ item.likeCount }}</span>
                    </div>
                    <div class="action-item" @click.stop="handleComment(item)">
                      <van-icon name="chat-o" />
                      <span>{{ item.commentCount }}</span>
                    </div>
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showSuccessToast, showFailToast } from 'vant'

export default {
  name: 'Home',
  
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    // 搜索相关
    const searchValue = ref('')
    
    // 分类相关
    const activeCategory = ref('recommend')
    const categories = ref([
      { id: 'recommend', name: '推荐' },
      { id: 'hot', name: '热榜' },
      { id: 'headline', name: '头条' },
      { id: 'backend', name: '后端' },
      { id: 'frontend', name: '前端' },
      { id: 'android', name: 'Android' },
      { id: 'ios', name: 'iOS' },
      { id: 'ai', name: '人工智能' },
      { id: 'tools', name: '开发工具' },
      { id: 'life', name: '代码人生' },
      { id: 'reading', name: '阅读' }
    ])
    
    // 列表相关
    const contentList = ref([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    
    // 模拟数据生成
    const generateMockData = (count = 10) => {
      const mockData = []
      const avatars = [
        'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/dog.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/logo.png'
      ]
      
      const nicknames = ['程序员小张', '前端开发', '后端架构师', 'AI工程师', '产品经理']
      const titles = [
        'Vue3 + TypeScript 最佳实践',
        'React Hooks 深度解析',
        'Node.js 性能优化技巧',
        '微服务架构设计模式',
        '前端工程化建设方案',
        '移动端适配方案总结',
        '数据库索引优化指南',
        'Docker 容器化部署',
        'Webpack 5 新特性解析',
        'TypeScript 高级用法'
      ]
      
      for (let i = 0; i < count; i++) {
        mockData.push({
          id: Date.now() + i,
          avatar: avatars[i % avatars.length],
          nickname: nicknames[i % nicknames.length],
          publishTime: `${Math.floor(Math.random() * 12) + 1}小时前`,
          title: titles[i % titles.length],
          summary: '这是一段内容摘要，展示了文章的主要内容。内容摘要应该简洁明了，能够吸引用户点击阅读全文。',
          likeCount: Math.floor(Math.random() * 100),
          commentCount: Math.floor(Math.random() * 50)
        })
      }
      
      return mockData
    }
    
    // 搜索功能
    const onSearch = () => {
      if (searchValue.value.trim()) {
        showSuccessToast(`搜索: ${searchValue.value}`)
        // 这里可以调用搜索API
        loadData(true)
      }
    }
    
    // 分类切换
    const onCategoryChange = (name) => {
      console.log('切换到分类:', name)
      loadData(true)
    }
    
    // 加载数据
    const loadData = (reset = false) => {
      if (reset) {
        contentList.value = []
        finished.value = false
      }
      
      // 模拟API请求延迟
      setTimeout(() => {
        if (reset) {
          contentList.value = generateMockData(10)
        } else {
          contentList.value = contentList.value.concat(generateMockData(5))
        }
        
        loading.value = false
        refreshing.value = false
        
        // 模拟数据加载完成
        if (contentList.value.length >= 30) {
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
    
    // 查看内容详情
    const viewContentDetail = (item) => {
      showSuccessToast(`查看内容: ${item.title}`)
      // 这里可以跳转到详情页
      // router.push(`/content/${item.id}`)
    }
    
    // 点赞功能
    const handleLike = (item) => {
      item.likeCount++
      showSuccessToast('点赞成功')
    }
    
    // 评论功能
    const handleComment = (item) => {
      showSuccessToast('跳转到评论页面')
      // 这里可以跳转到评论页或打开评论弹窗
    }
    
    onMounted(() => {
      // 如果没有登录信息，跳转到登录页
      if (!userStore.isLoggedIn()) {
        router.push('/login')
      } else {
        // 初始化加载数据
        loadData(true)
      }
    })
    
    return {
      searchValue,
      activeCategory,
      categories,
      contentList,
      loading,
      finished,
      refreshing,
      onSearch,
      onCategoryChange,
      onRefresh,
      onLoad,
      viewContentDetail,
      handleLike,
      handleComment
    }
  }
}
</script>

<style scoped>
.home-container {
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

.category-section {
  margin-top: 8px;
}

.content-list {
  padding: 16px;
  background-color: #f5f5f5;
}

.content-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.content-item:active {
  background-color: #f8f8f8;
  transform: scale(0.98);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.user-details {
  flex: 1;
}

.nickname {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.publish-time {
  font-size: 12px;
  color: #999;
}

.content-main {
  margin-bottom: 16px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.summary {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease;
}

.action-item:active {
  color: #1989fa;
}

.action-item .van-icon {
  font-size: 16px;
}

/* 分类标签样式优化 */
:deep(.van-tabs__wrap) {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.van-tab) {
  font-size: 14px;
}

:deep(.van-tab--active) {
  color: #1989fa;
}

:deep(.van-tabs__line) {
  background-color: #1989fa;
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