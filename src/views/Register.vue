<template>
  <div class="register-container">
    <div class="register-header">
      <h1>用户注册</h1>
      <p>创建您的账号</p>
    </div>
    
    <van-form @submit="onSubmit" class="register-form">
      <van-cell-group inset>
        <van-field
          v-model="registerForm.username"
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          :rules="[
            { required: true, message: '请填写用户名' },
            { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '用户名只能包含字母、数字和下划线，长度3-20位' }
          ]"
        />
        <van-field
          v-model="registerForm.email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          :rules="[
            { required: true, message: '请填写邮箱' },
            { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱格式' }
          ]"
        />
        <van-field
          v-model="registerForm.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[
            { required: true, message: '请填写密码' },
            { pattern: /^.{6,20}$/, message: '密码长度6-20位' }
          ]"
        />
        <van-field
          v-model="registerForm.confirmPassword"
          type="password"
          name="confirmPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: validateConfirmPassword, message: '两次输入的密码不一致' }
          ]"
        />
      </van-cell-group>
      
      <div style="margin: 16px;">
        <van-button 
          round 
          block 
          type="primary" 
          native-type="submit"
          :loading="loading"
          loading-text="注册中..."
        >
          注册
        </van-button>
      </div>
    </van-form>
    
    <div class="register-footer">
      <van-button 
        type="default" 
        size="small" 
        @click="goToLogin"
        plain
      >
        已有账号？立即登录
      </van-button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { authAPI } from '@/services/api'

export default {
  name: 'Register',
  
  setup() {
    const router = useRouter()
    
    const registerForm = ref({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    
    const loading = ref(false)
    
    const validateConfirmPassword = (val) => {
      return val === registerForm.value.password
    }
    
    const onSubmit = async () => {
      loading.value = true
      
      try {
        // 调用真实注册API
        const response = await authAPI.register({
          username: registerForm.value.username,
          email: registerForm.value.email,
          password: registerForm.value.password
        })
        
        // 注册成功处理
        if (response.success) {
          showSuccessToast('注册成功')
          
          // 注册成功后自动跳转到登录页面
          setTimeout(() => {
            router.push('/login')
          }, 1500)
        } else {
          showFailToast(response.message || '注册失败')
        }
      } catch (error) {
        // 错误处理
        console.error('注册错误:', error)
        showFailToast(error.message || '注册失败，请重试')
      } finally {
        loading.value = false
      }
    }
    
    const goToLogin = () => {
      router.push('/login')
    }
    
    return {
      registerForm,
      loading,
      onSubmit,
      validateConfirmPassword,
      goToLogin
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
}

.register-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.register-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 10px;
}

.register-header p {
  font-size: 14px;
  opacity: 0.8;
}

.register-form {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.register-footer {
  text-align: center;
  margin-top: 20px;
}
</style>