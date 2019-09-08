import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login'
import Index from '../components/index/Index'
import store from '../store/index'
Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: '/',
      component: Login
    },
    {
      path: '/index',
      name: 'index',
      component: Index,
      children: [// 二级路由
        {
          path: '/map',
          name: 'map',
          component: () => import('../components/index/map/MapWindow.vue')
        },
        {
          path: '/statis',
          name: 'statis',
          component: () => import('../components/index/statis/StatisWindow.vue')
        }
      ]
    }
  ]
})

// 注册全局钩子用来拦截导航
router.beforeEach((to, from, next) => {
  const token = store.state.token
  if (to.meta.requireAuth) { // 判断该路由是否需要登录权限
    console.log('ok' + token)
    if (token) { // 通过vuex state获取当前的token是否存在
      next()
    } else {
      console.log('该页面需要登陆')
      next({
        path: '/index'
        // query: {redirect: to.fullPath} // 将跳转的路由path作为参数，登录成功后跳转到该路由
      })
    }
  } else {
    next()
  }
})

export default router
