import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Home from '@/views/Home.vue'
import Hot from '@/views/Hot.vue'
import Discover from '@/views/Discover.vue'
import Profile from '@/views/Profile.vue'
import MainLayout from '@/views/MainLayout.vue'
import ConnectionTest from '@/views/ConnectionTest.vue'

const routes = [
  {
    path: '/',
    name: 'Root',
    redirect: '/main/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/main',
    component: MainLayout,
    meta: {
      requiresAuth: false
    },
    children: [
      {
        path: '',
        redirect: 'home'
      },
      {
        path: 'home',
        name: 'Home',
        component: Home,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'hot',
        name: 'Hot',
        component: Hot,
        meta: {
          requiresAuth: false
        }
      },
      {
        path: 'discover',
        name: 'Discover',
        component: Discover,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: {
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/connection-test',
    name: 'ConnectionTest',
    component: ConnectionTest
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 检查是否需要认证
  const requiresAuth = to.meta.requiresAuth
  
  console.log('路由守卫检查:', {
    '目标路由': to.name,
    '路径': to.path,
    '需要认证': requiresAuth,
    '当前token': token,
    '来源路由': from.name,
    '来源路径': from.path
  })
  
  // 特殊处理：允许游客访问首页和热点页面
  if (to.name === 'Home' || to.name === 'Hot') {
    console.log('允许游客访问特殊页面:', to.name, '来源:', from.name)
    next()
    return
  }
  
  // 正常认证检查
  if (requiresAuth === true && !token) {
    console.log('需要登录才能访问:', to.name)
    next('/login')
  } else {
    console.log('无需认证或已登录，允许访问:', to.name, '来源:', from.name)
    next()
  }
})

export default router