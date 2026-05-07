import { createRouter, createWebHistory, type RouteRecordNameGeneric } from 'vue-router'
import { useUserStore } from '@/stores/user/userStore.ts'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
  }
}

export const publicRoutes: Array<RouteRecordNameGeneric> = [
  'landing',
  'login',
  'register',
  'forgot-password',
  'reset-password',
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/landing/LandingView.vue'),
      meta: { requiresAuth: false },
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
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/forgot-password/ForgotPasswordView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/reset-password/ResetPasswordView.vue'),
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
    {
      path: '/calibrate',
      name: 'calibrate',
      component: () => import('../views/calibrate/CalibrateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/practice',
      name: 'practice',
      component: () => import('../views/practice/PracticeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'landing' },
    },
  ],
})

export const routerGuard: Parameters<typeof router.beforeEach>[0] = async (to, from, next) => {
  const userStore = useUserStore()
  const { user, verifyAndRefreshAuth } = userStore

  // If navigating to a protected route and we haven't verified auth yet
  if (to.meta.requiresAuth && !userStore.isAuthVerified && user) {
    const isValid = await verifyAndRefreshAuth()

    if (!isValid) {
      next({ name: 'login' })
      return
    }

    userStore.setAuthVerified(true)
  }

  // Standard auth check
  if (to.meta.requiresAuth && !userStore.user) {
    next({ name: 'login' })
  } else if (!to.meta.requiresAuth && userStore.user && publicRoutes.includes(to.name)) {
    // If logged in and trying to access login/register, redirect to matrix
    next({ name: 'matrix' })
  } else {
    next()
  }
}

router.beforeEach(routerGuard)

export default router
