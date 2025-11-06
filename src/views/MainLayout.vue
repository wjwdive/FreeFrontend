<template>
  <div class="main-layout">
    <!-- 页面内容区域 -->
    <div class="page-content">
      <router-view />
    </div>
    
    <!-- 底部导航栏 -->
    <van-tabbar v-model="activeTab" fixed>
      <van-tabbar-item 
        name="home" 
        icon="home-o"
        @click="navigateTo('home')"
      >
        首页
      </van-tabbar-item>
      <van-tabbar-item 
        name="hot" 
        icon="fire-o"
        @click="navigateTo('hot')"
      >
        热点
      </van-tabbar-item>
      <van-tabbar-item 
        name="discover" 
        icon="search"
        @click="navigateTo('discover')"
      >
        发现
      </van-tabbar-item>
      <van-tabbar-item 
        name="profile" 
        icon="user-o"
        @click="navigateTo('profile')"
      >
        我的
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'MainLayout',
  
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // 当前激活的tab，默认为首页
    const activeTab = ref('home')
    
    // 路由到tab页面的映射
    const routeToTabMap = {
      '/main/home': 'home',
      '/main/hot': 'hot',
      '/main/discover': 'discover',
      '/main/profile': 'profile'
    }
    
    // 监听路由变化，同步底部导航栏状态
    watch(() => route.path, (newPath) => {
      // 根据当前路由路径设置激活的tab
      if (routeToTabMap[newPath]) {
        activeTab.value = routeToTabMap[newPath]
      }
    }, { immediate: true })
    
    // 导航到指定页面
    const navigateTo = (tabName) => {
      const routeMap = {
        'home': '/main/home',
        'hot': '/main/hot',
        'discover': '/main/discover',
        'profile': '/main/profile'
      }
      
      if (routeMap[tabName] && route.path !== routeMap[tabName]) {
        router.push(routeMap[tabName])
      }
    }
    
    return {
      activeTab,
      navigateTo
    }
  }
}
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-content {
  padding-bottom: 50px; /* 为底部导航栏留出空间 */
}
</style>