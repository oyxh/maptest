<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import Login from './components/Login' // 引入login.vue组件
export default {
  name: 'App',
  components: {
    'Login': Login
  }
}
</script>

<style>
</style>
