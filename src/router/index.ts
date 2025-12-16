import { createRouter, createWebHistory, type RouteRecordNameGeneric } from 'vue-router'
import { useUserStore } from '@/stores/user/userStore.ts'

export const publicRoutes: Array<RouteRecordNameGeneric> = ['login', 'register']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'login' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'login' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/register/RegisterView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/matrix',
      name: 'matrix',
      component: () => import('../views/matrix/MatrixView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/configure',
      name: 'configure',
      component: () => import('../views/configure/ConfigureView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const { user } = userStore

  if (to.meta.requiresAuth && !user) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
