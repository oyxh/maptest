/* eslint-disable eqeqeq */
// store index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// 初始化时用sessionStore.getItem('token'),这样子刷新页面就无需重新登录
const state = {
  layerRefresh: false,
  radius: 0,
  geometrysInLayer: { }
}
const getters = { // 实时监听state值的变化(最新状态)
  layerRefresh (state) {
    return state.layerRefresh
  },
  radius (state) {
    return state.radius
  },
  geometrysInLayer (state) {
    return state.geometrysInLayer
  }
}
const mutations = {
  layerChange (state) { // 自定义改变state初始值的方法，这里面的参数除了state之外还可以再传额外的参数(变量或对象);
    state.layerRefresh = !state.layerRefresh
  },
  radius (state, radius) { // 自定义改变state初始值的方法，这里面的参数除了state之外还可以再传额外的参数(变量或对象);
    state.radius = radius
  },
  geometrysInLayerAdd (state, id, myOverlay) { // 自定义改变state初始值的方法，这里面的参数除了state之外还可以再传额外的参数(变量或对象);
    if (state.geometrysInLayer[id] == undefined) {
      state.geometrysInLayer[id] = new Set()
    }
    state.geometrysInLayer[id].add(myOverlay)
  }
}

const actions = {
  layerRefresh (context) { // 自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit('layerChange')
  },
  radius (context, radius) { // 自定义触发mutations里函数的方法，context与store 实例具有相同方法和属性
    context.commit('radius', radius)
  },
  geometrysInLayerAdd (context, id, myOverlay) {
    context.commit('geometrysInLayerAdd', id, myOverlay)
  }
}
export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})
