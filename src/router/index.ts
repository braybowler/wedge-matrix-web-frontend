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

let isAuthVerified = false

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const { user, verifyAndRefreshAuth } = userStore

  // If navigating to a protected route and we haven't verified auth yet
  if (to.meta.requiresAuth && !isAuthVerified && user) {
    // Verify the token is still valid
    const isValid = await verifyAndRefreshAuth()
    isAuthVerified = true

    if (!isValid) {
      // Token invalid, redirect to login
      next({ name: 'login' })
      return
    }
  }

  // Standard auth check
  if (to.meta.requiresAuth && !userStore.user) {
    next({ name: 'login' })
  } else if (
    !to.meta.requiresAuth &&
    userStore.user &&
    (to.name === 'login' || to.name === 'register')
  ) {
    // If logged in and trying to access login/register, redirect to matrix
    next({ name: 'matrix' })
  } else {
    next()
  }
})

export default router
