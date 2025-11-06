<template>
  <div v-if="visible" class="loading-overlay">
    <div class="loading-content">
      <van-loading size="24px" type="spinner" color="#1989fa" />
      <span class="loading-text">{{ text }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: '加载中...'
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 120px;
}

.loading-text {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}
</style>