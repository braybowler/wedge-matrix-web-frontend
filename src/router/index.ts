import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/matrix',
    },
    {
      path: '/matrix',
      name: 'matrix',
      component: () => import('../views/matrix/MatrixView.vue'),
    },
    {
      path: '/configure',
      name: 'configure',
      component: () => import('../views/configure/ConfigureView.vue'),
    },
  ],
})

export default router
