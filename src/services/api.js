import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    return response.data
  },
  (error) => {
    // 对响应错误做点什么
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      if (status === 401) {
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        window.location.href = '/login'
      }
      
      return Promise.reject(data || error)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      return Promise.reject({
        message: '网络错误，请检查网络连接'
      })
    } else {
      // 发送请求时发生了错误
      return Promise.reject(error)
    }
  }
)

// 认证相关API
export const authAPI = {
  // 用户登录
  login: (data) => api.post('/api/auth/login', data),
  
  // 用户注册
  register: (data) => api.post('/api/auth/register', data),
  
  // 获取用户信息
  getUserInfo: () => api.get('/api/auth/userinfo')
}

// 用户相关API
export const userAPI = {
  // 搜索用户
  searchUsers: (keyword) => api.post('/api/users/search', { keyword }),
  
  // 获取用户列表
  getUsers: (params) => api.get('/api/users', { params }),
  
  // 获取用户详情
  getUserById: (id) => api.get(`/api/users/${id}`)
}

export default api