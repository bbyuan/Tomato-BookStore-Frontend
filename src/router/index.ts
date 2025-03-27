import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/login.vue'
import Register from '@/pages/Register.vue'
import HomePage from '@/pages/HomePage.vue'
import AccountSettings from '@/pages/AccountSettings.vue'
import Accounts from '@/views/AccountSettings/Accounts.vue'
import Security from '@/views/AccountSettings/Security.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/homepage',
      name: 'homepage',
      component: HomePage,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/account-settings',
      component: AccountSettings,
      children: [
        {
          path: '',
          redirect: '/account-settings/account'
        },
        {
          path: 'account',
          component: Accounts
        },
        {
          path: 'security',
          component: Security
        }
      ]
    },
  ],
})

export default router
