// 测试后端连接的工具函数
export const testBackendConnection = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
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
      console.log('✅ 后端服务连接正常')
      return true
    } else {
      console.log('❌ 后端服务返回错误状态:', response.status)
      return false
    }
  } catch (error) {
    console.log('❌ 无法连接到后端服务:', error.message)
    console.log('💡 请确保后端服务正在运行，并检查端口配置')
    return false
  }
}

// 测试多个可能的端口
export const testMultiplePorts = async () => {
  const ports = [3001, 3301, 3000, 8080, 8000]
  
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/api/auth/login`, {
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
        console.log(`✅ 发现后端服务运行在端口 ${port}`)
        return port
      }
    } catch (error) {
      console.log(`❌ 端口 ${port} 连接失败`)
    }
  }
  
  console.log('❌ 未找到运行中的后端服务')
  return null
}