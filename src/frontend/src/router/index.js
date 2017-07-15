import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/pages/login'
import Signup from '@/pages/signup'
import List from '@/pages/list'
import detail from '@/pages/detail'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup
    },
    {
      path: '/list',
      name: 'List',
      component: List
    },
    {
      path: '/detail/:id',
      name: 'Detail',
      component: detail
    },
    {
      path: '*',
      redirect: '/login'
    }
  ]
})
