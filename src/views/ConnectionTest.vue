<template>
  <div class="connection-test">
    <van-nav-bar title="连接测试" left-text="返回" left-arrow @click-left="goBack" />
    
    <div class="test-content">
      <van-cell-group>
        <van-cell title="后端服务状态" :value="connectionStatus" />
        <van-cell title="后端服务地址" :value="apiBaseUrl" />
      </van-cell-group>
      
      <div style="margin: 20px;">
        <van-button 
          type="primary" 
          block 
          @click="testConnection"
          :loading="testing"
          loading-text="测试中..."
        >
          测试连接
        </van-button>
      </div>
      
      <div v-if="testResult" class="result-box">
        <h3>测试结果：</h3>
        <pre>{{ testResult }}</pre>
      </div>
      
      <div class="help-info">
        <h4>💡 连接问题排查指南：</h4>
        <ol>
          <li>确保后端服务正在运行</li>
          <li>检查后端服务端口是否正确（应该是3301）</li>
          <li>确认防火墙没有阻止连接</li>
          <li>检查网络连接是否正常</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

export default {
  name: 'ConnectionTest',
  
  setup() {
    const router = useRouter()
    
    const connectionStatus = ref('未知')
    const apiBaseUrl = ref(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001')
    const testing = ref(false)
    const testResult = ref('')
    
    const testConnection = async () => {
      testing.value = true
      testResult.value = ''
      
      try {
        // 测试连接
        const response = await fetch(`${apiBaseUrl.value}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'test',
            password: 'test'
          })
        })
        
        if (response.ok) {
          connectionStatus.value = '✅ 连接正常'
          testResult.value = '连接成功！后端服务正常运行。'
          showToast('连接测试成功')
        } else {
          connectionStatus.value = '⚠️ 服务异常'
          testResult.value = `服务返回错误状态: ${response.status}`
          showToast('服务异常')
        }
      } catch (error) {
        connectionStatus.value = '❌ 连接失败'
        testResult.value = `连接错误: ${error.message}\n\n请检查：\n1. 后端服务是否启动\n2. 端口号是否正确\n3. 防火墙设置`
        showToast('连接失败')
      } finally {
        testing.value = false
      }
    }
    
    const goBack = () => {
      router.back()
    }
    
    // 组件挂载时自动测试
    testConnection()
    
    return {
      connectionStatus,
      apiBaseUrl,
      testing,
      testResult,
      testConnection,
      goBack
    }
  }
}
</script>

<style scoped>
.connection-test {
  min-height: 100vh;
  background: #f5f5f5;
}

.test-content {
  padding: 20px;
}

.result-box {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  border-left: 4px solid #1989fa;
}

.help-info {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
}

.help-info h4 {
  margin: 0 0 10px 0;
  color: #d48806;
}

.help-info ol {
  margin: 0;
  padding-left: 20px;
}

.help-info li {
  margin-bottom: 5px;
  color: #666;
}
</style>