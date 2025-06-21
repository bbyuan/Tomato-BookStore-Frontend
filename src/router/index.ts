import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/login.vue'
import Register from '@/pages/Register.vue'
import HomePage from '@/pages/HomePage.vue'
import AccountSettings from '@/pages/AccountSettings.vue'
import Accounts from '@/views/AccountSettings/Accounts.vue'
import Security from '@/views/AccountSettings/Security.vue'
import ProductShow from '@/views/HomePage/ProductShow.vue'
import Header from '@/views/HomePage/Header.vue'
import AsideLeft from '@/views/HomePage/Aside-left.vue'
import Slides from '@/views/HomePage/Slides.vue'
import BookRanking from '@/views/HomePage/BookRanking.vue'
import Detail from '@/pages/Detail.vue'
import AdminProductManagement from '@/pages/AdminProductManagement.vue'
import AdminAdverManagement from '@/pages/AdminAdverManagement.vue'
import Cart from '@/pages/Cart.vue';
import Order from '@/pages/Order.vue';
import PaymentSuccess from '@/pages/PaymentSuccess.vue'
import NotFound from '@/pages/NotFound.vue'
import Loading from '@/pages/Loading.vue'
import LoadingFail from '@/pages/LoadingFail.vue'
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
      children: [
        {
          path: '',
          components: {
            default: ProductShow,
            header: Header,
            asideleft: AsideLeft,
            slides: Slides,
            bookranking: BookRanking
          }
        },
        {
          path: 'category/:id',
          components: {
            default: ProductShow,
            header: Header,
            asideleft: AsideLeft,
            slides: Slides,
            bookranking: BookRanking
          },
          props: true
        }
      ]
    },
    {
      path: '/category/:category',
      name: 'CategoryProducts',
      component: () => import('../views/HomePage/CategoryPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/detail/:id',
      name: 'Detail',
      component: Detail
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
    {
      path: '/admin/product-management',
      name: 'AdminProductManagement',
      component: AdminProductManagement
    },
    {
      path: '/admin/adver-management',
      name: 'AdminAdverManagement',
      component: AdminAdverManagement
    },
    {
      path: '/not-found',
      name: 'NotFound',
      component: NotFound
    },
    {
      path: '/loading',
      name: 'Loading',
      component: Loading
    },
    {
      path: '/loading-fail',
      name: 'LoadingFail',
      component: LoadingFail
    },
    {
      path: '/cart',
      name: 'Cart',
      component: Cart
    },
    {
      path: '/order',
      name: 'Order',
      component: Order
    },
    {
      path: '/payment-success',
      name: 'PaymentSuccess',
      component: PaymentSuccess
    },
    {
      path: '/myorders',
      name: 'MyOrders',
      component: () => import('@/pages/MyOrders.vue')
    }
  ],
})

export default router
