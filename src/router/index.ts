import { createRouter, createWebHistory, type RouteRecordNameGeneric } from 'vue-router'

export const publicRoutes: Array<RouteRecordNameGeneric> = ['login', 'register']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/matrix',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/register/RegisterView.vue'),
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
