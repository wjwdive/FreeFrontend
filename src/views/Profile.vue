<template>
  <div class="profile-container">
    <van-nav-bar title="我的" fixed />
    
    <div class="profile-content">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-avatar">
          <van-image
            round
            width="60px"
            height="60px"
            :src="userInfo.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
          />
        </div>
        <div class="user-info">
          <div class="username">{{ userInfo.username || '用户' }}</div>
          <div class="user-id">ID: {{ userInfo.id || '--' }}</div>
        </div>
        <van-button 
          type="primary" 
          size="small"
          @click="editProfile"
        >
          编辑资料
        </van-button>
      </div>
      
      <!-- 功能菜单 -->
      <div class="menu-section">
        <van-cell-group>
          <van-cell 
            title="我的收藏" 
            icon="star-o" 
            is-link
            @click="goToFavorites"
          />
          <van-cell 
            title="浏览历史" 
            icon="clock-o" 
            is-link
            @click="goToHistory"
          />
          <van-cell 
            title="消息通知" 
            icon="chat-o" 
            is-link
            @click="goToNotifications"
          />
          <van-cell 
            title="设置" 
            icon="setting-o" 
            is-link
            @click="goToSettings"
          />
        </van-cell-group>
      </div>
      
      <!-- 统计信息 -->
      <div class="stats-section">
        <van-grid :column-num="3" :border="false">
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-value">{{ stats.collectionCount }}</div>
              <div class="stat-label">收藏</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-value">{{ stats.historyCount }}</div>
              <div class="stat-label">浏览</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-value">{{ stats.followCount }}</div>
              <div class="stat-label">关注</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-section">
        <van-button 
          type="default" 
          size="large" 
          block
          @click="showAbout"
          style="margin-bottom: 12px;"
        >
          关于我们
        </van-button>
        <van-button 
          type="danger" 
          size="large" 
          block
          @click="logout"
        >
          退出登录
        </van-button>
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
  name: 'Profile',
  
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const userInfo = ref({})
    const stats = ref({
      collectionCount: 12,
      historyCount: 89,
      followCount: 5
    })
    
    const editProfile = () => {
      showDialog({
        title: '编辑资料',
        message: '这里是编辑资料的功能页面（待实现）',
        theme: 'round-button'
      })
    }
    
    const goToFavorites = () => {
      showToast('跳转到我的收藏')
    }
    
    const goToHistory = () => {
      showToast('跳转到浏览历史')
    }
    
    const goToNotifications = () => {
      showToast('跳转到消息通知')
    }
    
    const goToSettings = () => {
      showToast('跳转到设置')
    }
    
    const showAbout = () => {
      showDialog({
        title: '关于我们',
        message: 'Free Frontend 是一个基于Vue3 + Pinia + Vant构建的前端项目。\n\n版本：1.0.0\n开发者：前端开发团队',
        theme: 'round-button'
      })
    }
    
    const logout = () => {
      showConfirmDialog({
        title: '确认退出',
        message: '您确定要退出登录吗？'
      }).then(() => {
        userStore.clearUserInfo()
        showSuccessToast('已退出登录')
        router.push('/login')
      }).catch(() => {
        // 用户取消
      })
    }
    
    onMounted(() => {
      // 获取用户信息
      userInfo.value = userStore.userInfo
      
      // 如果没有登录信息，跳转到登录页
      if (!userStore.isLoggedIn()) {
        router.push('/login')
      }
    })
    
    return {
      userInfo,
      stats,
      editProfile,
      goToFavorites,
      goToHistory,
      goToNotifications,
      goToSettings,
      showAbout,
      logout
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-content {
  padding: 16px 16px 20px;
}

.user-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  margin-right: 12px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-id {
  font-size: 12px;
  color: #999;
}

.menu-section {
  margin-bottom: 16px;
}

.stats-section {
  background: white;
  border-radius: 12px;
  padding: 16px 0;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1989fa;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.action-section {
  margin-top: 20px;
}
</style>