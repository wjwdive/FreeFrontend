<template>
  <div class="discover-container">
    <van-nav-bar title="发现" fixed />
    
    <div class="discover-content">
      <!-- 搜索框 -->
      <div class="search-section">
        <van-search
          v-model="searchValue"
          placeholder="搜索发现内容"
          shape="round"
          @search="onSearch"
        />
      </div>
      
      <!-- 分类导航 -->
      <div class="category-section">
        <van-grid :column-num="4" :border="false">
          <van-grid-item 
            v-for="category in categories" 
            :key="category.id"
            :text="category.name"
            :icon="category.icon"
            @click="onCategoryClick(category)"
          />
        </van-grid>
      </div>
      
      <!-- 推荐内容 -->
      <div class="recommend-section">
        <h3 class="section-title">推荐发现</h3>
        <div class="recommend-list">
          <van-card
            v-for="item in recommendList"
            :key="item.id"
            :price="item.price"
            :desc="item.description"
            :title="item.title"
            :thumb="item.thumb"
            @click="showDiscoverDetail(item)"
          >
            <template #tags>
              <van-tag plain type="primary">{{ item.tag }}</van-tag>
            </template>
            <template #footer>
              <van-button size="mini">查看详情</van-button>
            </template>
          </van-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { showToast, showDialog } from 'vant'

export default {
  name: 'Discover',
  
  setup() {
    const searchValue = ref('')
    
    // 分类数据
    const categories = ref([
      { id: 1, name: '技术', icon: 'gem' },
      { id: 2, name: '设计', icon: 'photo' },
      { id: 3, name: '产品', icon: 'shop' },
      { id: 4, name: '运营', icon: 'chart-trending-o' },
      { id: 5, name: '职场', icon: 'user-circle-o' },
      { id: 6, name: '生活', icon: 'smile' },
      { id: 7, name: '读书', icon: 'book' },
      { id: 8, name: '更多', icon: 'more' }
    ])
    
    // 推荐内容数据
    const recommendList = ref([
      {
        id: 1,
        title: '前端工程化实践指南',
        price: '免费',
        description: '从零开始构建现代化前端项目',
        thumb: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg',
        tag: '热门'
      },
      {
        id: 2,
        title: 'Vue3 组件开发技巧',
        price: '免费',
        description: '掌握Vue3组件开发的核心技术',
        thumb: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg',
        tag: '新上'
      },
      {
        id: 3,
        title: 'TypeScript 进阶教程',
        price: '免费',
        description: '深入理解TypeScript类型系统',
        thumb: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg',
        tag: '推荐'
      }
    ])
    
    const onSearch = (val) => {
      if (val.trim()) {
        showToast(`搜索：${val}`)
        // 这里可以添加搜索逻辑
      }
    }
    
    const onCategoryClick = (category) => {
      showToast(`进入${category.name}分类`)
      // 这里可以添加分类跳转逻辑
    }
    
    const showDiscoverDetail = (item) => {
      showDialog({
        title: item.title,
        message: `描述：${item.description}\n\n价格：${item.price}\n\n标签：${item.tag}\n\n这里是发现内容的详细描述...`,
        theme: 'round-button'
      })
    }
    
    return {
      searchValue,
      categories,
      recommendList,
      onSearch,
      onCategoryClick,
      showDiscoverDetail
    }
  }
}
</script>

<style scoped>
.discover-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.discover-content {
  padding: 16px 0 60px;
}

.search-section {
  padding: 0 16px 16px;
  background: white;
}

.category-section {
  background: white;
  padding: 16px 0;
  margin-bottom: 16px;
}

.recommend-section {
  background: white;
  padding: 16px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.van-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>