import Loading from './Loading.vue'

// 导出所有组件
export {
  Loading
}

// 默认导出，用于全局注册
export default {
  install(app) {
    app.component('Loading', Loading)
  }
}