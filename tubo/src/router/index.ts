import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/app'),
  routes: [
    {
      path: '/',
      name: 'sync',
      component: () => import('@/views/AppView.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        nonAuthOnly: true
      }
    }
  ]
})

export default router
