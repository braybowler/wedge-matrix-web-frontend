import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ForgotPasswordForm from '@/components/forgot-password/ForgotPasswordForm.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from '@/views/login/LoginView.vue'
import ForgotPasswordView from '@/views/forgot-password/ForgotPasswordView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAxios } from '@/composables/axios/axios.ts'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      redirect: '/forgot-password',
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

describe('ForgotPasswordForm Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Form Rendering', () => {
    it('renders', () => {
      const wrapper = mount(ForgotPasswordForm, { global: { plugins: [router] } })

      expect(wrapper.exists).toBeTruthy()
    })
  })

  describe('User Input', () => {
    it('accepts email input', async () => {
      const wrapper = mount(ForgotPasswordForm, { global: { plugins: [router] } })

      const input = wrapper.find('[data-test-id="email-input"]')

      await input.setValue('test@example.com')
      await input.trigger('input')

      expect((input.element as HTMLInputElement).value).toBe('test@example.com')
    })

    it('links a user to the login page', async () => {
      const wrapper = mount(ForgotPasswordForm, { global: { plugins: [router] } })

      const loginPageLink = wrapper.find('[data-test-id="login-page-link"]')

      await loginPageLink.trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('Communication', () => {
    it('sends an API request with email on submission', async () => {
      const wrapper = mount(ForgotPasswordForm, { global: { plugins: [router] } })

      const emailInput = wrapper.find('[data-test-id="email-input"]')
      const submitButton = wrapper.find('[data-test-id="forgot-password-button"]')

      await emailInput.setValue('test@example.com')
      await submitButton.trigger('click')
      await nextTick()

      expect(useAxios().post).toHaveBeenCalledExactlyOnceWith('/forgot-password', {
        email: 'test@example.com',
      })
    })

    it('shows success message after successful submission', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        data: {
          message: 'If an account exists with that email, you will receive a password reset link.',
        },
        status: 200,
      })

      const wrapper = mount(ForgotPasswordForm, { global: { plugins: [router] } })

      const emailInput = wrapper.find('[data-test-id="email-input"]')
      const submitButton = wrapper.find('[data-test-id="forgot-password-button"]')

      await emailInput.setValue('test@example.com')
      await submitButton.trigger('click')
      await flushPromises()

      const successMessage = wrapper.find('[data-test-id="success-message"]')
      expect(successMessage.exists()).toBe(true)
      expect(successMessage.text()).toContain(
        'If an account exists with that email, you will receive a password reset link.',
      )
    })
  })

  describe('Validation', () => {
    it('shows error when email is empty', async () => {
      const wrapper = mount(ForgotPasswordForm, { global: { plugins: [router] } })

      const submitButton = wrapper.find('[data-test-id="forgot-password-button"]')

      await submitButton.trigger('click')
      await nextTick()

      const errorMessage = wrapper.find('.error-message')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Email is required.')
    })

    it('shows error when email is invalid', async () => {
      const wrapper = mount(ForgotPasswordForm, { global: { plugins: [router] } })

      const emailInput = wrapper.find('[data-test-id="email-input"]')
      const submitButton = wrapper.find('[data-test-id="forgot-password-button"]')

      await emailInput.setValue('not-an-email')
      await submitButton.trigger('click')
      await nextTick()

      const errorMessage = wrapper.find('.error-message')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Email must be valid.')
    })
  })

  describe('Error Handling', () => {
    it('shows generic error message on server error', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        error: 'Internal Server Error',
        status: 500,
      })

      const wrapper = mount(ForgotPasswordForm, { global: { plugins: [router] } })

      const emailInput = wrapper.find('[data-test-id="email-input"]')
      const submitButton = wrapper.find('[data-test-id="forgot-password-button"]')

      await emailInput.setValue('test@example.com')
      await submitButton.trigger('click')
      await flushPromises()

      const errorMessage = wrapper.find('[data-test-id="error-message"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Something went wrong. Please try again later.')
    })
  })
})
