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
