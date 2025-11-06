<template>
  <div class="hot-container">
    <van-nav-bar title="热点" fixed />
    
    <div class="hot-content">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="hot-list">
            <van-cell 
              v-for="item in list" 
              :key="item.id"
              :title="item.title"
              :label="item.description"
              :value="item.time"
              clickable
              @click="showHotDetail(item)"
            >
              <template #icon>
                <van-icon name="fire" color="#ff4444" style="margin-right: 8px;" />
              </template>
            </van-cell>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { showToast, showDialog } from 'vant'

export default {
  name: 'Hot',
  
  setup() {
    const refreshing = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    const list = ref([])
    
    // 模拟热点数据
    const mockHotData = [
      { id: 1, title: 'Vue 3.4 正式发布', description: '性能提升和开发体验优化', time: '2小时前' },
      { id: 2, title: '前端框架性能对比', description: 'React、Vue、Angular最新性能测试', time: '5小时前' },
      { id: 3, title: 'TypeScript 5.4 新特性', description: '类型系统增强和开发效率提升', time: '1天前' },
      { id: 4, title: 'Webpack vs Vite', description: '构建工具选择指南', time: '2天前' },
      { id: 5, title: 'CSS Grid 布局实战', description: '现代网页布局最佳实践', time: '3天前' }
    ]
    
    const onLoad = () => {
      // 模拟加载数据
      setTimeout(() => {
        if (list.value.length === 0) {
          list.value = mockHotData
        } else {
          // 模拟加载更多数据
          const newData = mockHotData.map(item => ({
            ...item,
            id: item.id + list.value.length
          }))
          list.value = list.value.concat(newData)
        }
        
        loading.value = false
        
        // 数据全部加载完成
        if (list.value.length >= 20) {
          finished.value = true
        }
      }, 1000)
    }
    
    const onRefresh = () => {
      // 清空列表数据
      list.value = []
      finished.value = false
      
      // 重新加载数据
      loading.value = true
      onLoad()
      
      refreshing.value = false
      showToast('刷新成功')
    }
    
    const showHotDetail = (item) => {
      showDialog({
        title: item.title,
        message: `描述：${item.description}\n\n发布时间：${item.time}\n\n这里是热点内容的详细描述...`,
        theme: 'round-button'
      })
    }
    
    return {
      refreshing,
      loading,
      finished,
      list,
      onLoad,
      onRefresh,
      showHotDetail
    }
  }
}
</script>

<style scoped>
.hot-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.hot-content {
  padding: 16px 0 60px;
}

.hot-list {
  padding: 0 16px;
}

.van-cell {
  margin-bottom: 8px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>