// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ViewUI from 'view-design' // 引入iview依赖
import 'view-design/dist/styles/iview.css' // 引入iview css样式
import axios from 'axios'
import VueAxios from 'vue-axios'
import Vuex from 'vuex'
import store from './store/index'
Vue.use(Vuex)
Vue.config.productionTip = false
Vue.use(ViewUI) // 使用iview组件
Vue.use(VueAxios, axios)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
