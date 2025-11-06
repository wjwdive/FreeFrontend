<template>
  <div class="home-container">
    <div class="home-content">
      <van-cell-group inset class="user-info-card">
        <van-cell title="欢迎回来" :value="userInfo.username || '用户'" />
        <van-cell title="登录时间" :value="loginTime" />
        <van-cell title="登录状态" value="已登录" />
      </van-cell-group>
      
      <div class="action-buttons">
      <van-button 
        type="primary" 
        size="large" 
        block
        @click="showUserInfo"
      >
        查看用户信息
      </van-button>
      
      <van-button 
        type="success" 
        size="large" 
        block
        @click="showWelcome"
        style="margin-top: 15px;"
      >
        欢迎消息
      </van-button>
      
      <van-button 
        type="warning" 
        size="large" 
        block
        @click="goToConnectionTest"
        style="margin-top: 15px;"
      >
        连接测试
      </van-button>
    </div>
      
      <div class="features-section">
        <h3>功能特性</h3>
        <van-grid :column-num="2" :gutter="10">
          <van-grid-item 
            v-for="feature in features" 
            :key="feature.id"
            :text="feature.name"
            :icon="feature.icon"
          />
        </van-grid>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showConfirmDialog, showDialog, showSuccessToast } from 'vant'

export default {
  name: 'Home',
  
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const userInfo = ref({})
    const loginTime = ref('')
    
    const features = ref([
      { id: 1, name: '用户管理', icon: 'user-o' },
      { id: 2, name: '数据统计', icon: 'chart-trending-o' },
      { id: 3, name: '系统设置', icon: 'setting-o' },
      { id: 4, name: '帮助中心', icon: 'question-o' }
    ])
    
    // 刷新功能
    const onRefresh = () => {
      showSuccessToast('页面已刷新')
      // 这里可以添加刷新数据的逻辑
    }
    
    const showUserInfo = () => {
      showDialog({
        title: '用户信息',
        message: `用户名：${userInfo.value.username || '未知'}\n邮箱：${userInfo.value.email || '未设置'}`,
        theme: 'round-button'
      })
    }
    
    const showWelcome = () => {
      showDialog({
        title: '欢迎',
        message: '欢迎使用Free Frontend系统！\n\n这是一个基于Vue3 + Pinia + Vant构建的前端项目。',
        theme: 'round-button'
      })
    }
    
    const goToConnectionTest = () => {
      router.push('/connection-test')
    }
    
    onMounted(() => {
      // 获取用户信息
      userInfo.value = userStore.userInfo
      
      // 设置登录时间
      const now = new Date()
      loginTime.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      // 如果没有登录信息，跳转到登录页
      if (!userStore.isLoggedIn()) {
        router.push('/login')
      }
    })
    
    return {
      userInfo,
      loginTime,
      features,
      onRefresh,
      showUserInfo,
      showWelcome,
      goToConnectionTest
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.home-content {
  padding: 16px 16px 20px;
}

.user-info-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.action-buttons {
  margin-bottom: 30px;
}

.features-section h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.features-section {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>