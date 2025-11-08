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

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'

const router = useRouter()

// 搜索和分类相关
const searchValue = ref('')
const activeCategory = ref('recommend')
const categories = reactive([
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

// 内容列表相关
const contentList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 搜索功能
const onSearch = () => {
  if (searchValue.value.trim()) {
    page.value = 1
    contentList.value = []
    finished.value = false
    loadData()
  }
}

// 分类切换
const onCategoryChange = (name) => {
  console.log('切换到分类:', name)
  page.value = 1
  contentList.value = []
  finished.value = false
  loadData()
}

// 下拉刷新
const onRefresh = () => {
  page.value = 1
  contentList.value = []
  finished.value = false
  loadData()
  refreshing.value = false
}

// 上拉加载更多
const onLoad = () => {
  loadData()
}

// 加载数据
const loadData = () => {
  if (loading.value || finished.value) return
  
  loading.value = true
  
  // 模拟异步加载数据
  setTimeout(() => {
    if (refreshing.value) {
      contentList.value = []
    }
    
    const newData = generateMockData(page.value, pageSize.value)
    contentList.value.push(...newData)
    
    loading.value = false
    refreshing.value = false
    
    if (newData.length < pageSize.value) {
      finished.value = true
    }
    
    page.value++
  }, 500)
}

// 查看内容详情
const viewContentDetail = (item) => {
  Toast(`查看内容: ${item.title}`)
  // 这里可以跳转到详情页
  // router.push(`/content/${item.id}`)
}

// 点赞功能
const handleLike = (item) => {
  item.likeCount++
  Toast('点赞成功')
}

// 评论功能
const handleComment = (item) => {
  Toast('跳转到评论页面')
}

// 生成模拟内容数据
const generateMockData = (page, pageSize) => {
  const data = []
  const startIndex = (page - 1) * pageSize
  
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
  
  for (let i = 0; i < pageSize; i++) {
    const index = startIndex + i
    data.push({
      id: `content_${index}`,
      avatar: avatars[i % avatars.length],
      nickname: nicknames[i % nicknames.length],
      publishTime: `${Math.floor(Math.random() * 12) + 1}小时前`,
      title: titles[i % titles.length],
      summary: '这是一段内容摘要，展示了文章的主要内容。内容摘要应该简洁明了，能够吸引用户点击阅读全文。',
      likeCount: Math.floor(Math.random() * 100),
      commentCount: Math.floor(Math.random() * 50)
    })
  }
  
  return data
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 搜索区域样式 */
.search-section {
  background: #fff;
  padding: 10px;
}

/* 分类区域样式 */
.category-section {
  background: #fff;
  margin-top: 10px;
}

/* 内容列表样式 */
.content-list {
  padding: 10px;
}

.content-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.content-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.publish-time {
  font-size: 12px;
  color: #999;
}

.content-main {
  margin-bottom: 12px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.summary {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.action-buttons {
  display: flex;
  gap: 20px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.action-item:hover {
  color: #1989fa;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .search-section {
    padding: 8px;
  }
  
  .content-item {
    padding: 12px;
    margin-bottom: 8px;
  }
}
</style>