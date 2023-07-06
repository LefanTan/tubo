import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/app/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        startNowBtn: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        nonAuthOnly: true
      }
    },
    {
      path: '/app',
      name: 'app',
      component: () => import('@/views/AppView.vue'),
      meta: {
        requiresAuth: true
      }
    }
  ]
})

export default router
