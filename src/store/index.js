// store index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// 初始化时用sessionStore.getItem('token'),这样子刷新页面就无需重新登录
const state = {
  user: window.sessionStorage.getItem('user'),
  token: window.sessionStorage.getItem('token'),
  layerRefresh: false
}
const getters = { // 实时监听state值的变化(最新状态)
  layerRefresh (state) { // 承载变化的showFooter的值
    return state.layerRefresh
  }
}
const mutations = {
  // 将token保存到sessionStorage里，token表示登陆状态
  SET_TOKEN: (state, data) => {
    state.token = data
    window.sessionStorage.setItem('token', data)
  },
  // 获取用户名
  GET_USER: (state, data) => {
    // 把用户名存起来
    state.user = data
    window.sessionStorage.setItem('user', data)
  },
  // 登出
  LOGOUT: (state) => {
    // 登出的时候要清除token
    state.token = null
    state.user = null
    window.sessionStorage.removeItem('token')
    window.sessionStorage.removeItem('user')
  },
  layerChange (state) { // 自定义改变state初始值的方法，这里面的参数除了state之外还可以再传额外的参数(变量或对象);
    state.layerRefresh = !state.layerRefresh
  }
}

const actions = {
  layerRefresh (context) { // 自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit('layerChange')
  }
}
export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})
