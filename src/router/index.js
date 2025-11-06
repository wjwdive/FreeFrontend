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
      requiresAuth: true
    },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: Home
      },
      {
        path: 'hot',
        name: 'Hot',
        component: Hot
      },
      {
        path: 'discover',
        name: 'Discover',
        component: Discover
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
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
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router