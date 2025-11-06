<template>
  <div class="login-container">
    <div class="login-header">
      <h1>欢迎登录</h1>
      <p>请输入您的账号和密码</p>
    </div>
    
    <van-form @submit="onSubmit" class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="loginForm.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="loginForm.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      
      <div style="margin: 16px;">
        <van-button 
          round 
          block 
          type="primary" 
          native-type="submit"
          :loading="loading"
          loading-text="登录中..."
        >
          登录
        </van-button>
        
        <van-button 
          round 
          block 
          type="default" 
          style="margin-top: 12px;"
          @click="skipLogin"
          plain
        >
          暂不登录
        </van-button>
      </div>
    </van-form>
    
    <div class="login-footer">
      <van-button 
        type="default" 
        size="small" 
        @click="goToRegister"
        plain
      >
        没有账号？立即注册
      </van-button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showSuccessToast, showFailToast } from 'vant'
import { authAPI } from '@/services/api'

export default {
  name: 'Login',
  
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const loginForm = ref({
      username: '',
      password: ''
    })
    
    const loading = ref(false)
    
    const onSubmit = async () => {
      loading.value = true
      
      try {
        // 调用真实登录API
        const response = await authAPI.login({
          username: loginForm.value.username,
          password: loginForm.value.password
        })
        
        console.log('登录API响应:', response)
        
        // 登录成功处理 - 适配不同的响应格式
        if (response.statusCode === 200 && response.data) {
          // 格式1: { success: true, data: { token, user } }
          const { token, user } = response.data
          //清除旧的token和用户信息
          userStore.clearUserInfo()

          // 保存token和用户信息
          userStore.setToken(token)
          userStore.setUserInfo(user)
          
          showSuccessToast('登录成功')
          console.log('准备跳转到 /main/home')
          router.push('/main/home').then(() => {
            console.log('路由跳转成功')
          }).catch((error) => {
            console.error('路由跳转失败:', error)
          })
        } else {
          showFailToast(response.message || '登录失败')
        }
      } catch (error) {
        // 错误处理
        console.error('登录错误:', error)
        showFailToast(error.message || '登录失败，请重试')
      } finally {
        loading.value = false
      }
    }
    
    const goToRegister = () => {
      router.push('/register')
    }
    
    const skipLogin = () => {
      showSuccessToast('以游客身份进入')
      console.log('准备以游客身份跳转到首页')
      
      // 直接使用路径跳转，避免路由名称解析问题
      console.log('直接跳转到 /main/home')
      
      // 使用Promise确保跳转完成
      router.push('/main/home').then(() => {
        console.log('路由跳转成功，当前路由:', router.currentRoute.value)
      }).catch((error) => {
        console.error('路由跳转失败:', error)
        
        // 如果Vue Router跳转失败，尝试使用原生跳转
        console.log('尝试使用原生跳转')
        window.location.href = '/main/home'
      })
    }
    
    return {
      loginForm,
      loading,
      onSubmit,
      goToRegister,
      skipLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
}

.login-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.8;
}

.login-form {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-footer {
  text-align: center;
  margin-top: 20px;
}
</style>