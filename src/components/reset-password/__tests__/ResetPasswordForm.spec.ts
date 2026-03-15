import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ResetPasswordForm from '@/components/reset-password/ResetPasswordForm.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from '@/views/login/LoginView.vue'
import ResetPasswordView from '@/views/reset-password/ResetPasswordView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAxios } from '@/composables/axios/axios.ts'

const createTestRouter = (query: Record<string, string> = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/reset-password',
        name: 'reset-password',
        component: ResetPasswordView,
      },
      {
        path: '/login',
        name: 'login',
        component: LoginView,
      },
    ],
  })
  return { router, query }
}

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

const mountWithQuery = async (query: Record<string, string> = {}) => {
  const { router } = createTestRouter()
  await router.push({ path: '/reset-password', query })
  await router.isReady()
  const wrapper = mount(ResetPasswordForm, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('ResetPasswordForm Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Form Rendering', () => {
    it('renders with token and email in URL', async () => {
      const { wrapper } = await mountWithQuery({
        token: 'valid-token',
        email: 'test@example.com',
      })

      expect(wrapper.exists()).toBeTruthy()
      expect(wrapper.find('[data-test-id="password-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-test-id="password-confirmation-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-test-id="reset-password-button"]').exists()).toBe(true)
    })

    it('shows error when params are missing', async () => {
      const { wrapper } = await mountWithQuery({})

      const errorMessage = wrapper.find('[data-test-id="missing-params-error"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toContain('Invalid reset link')
    })
  })

  describe('User Input', () => {
    it('accepts password inputs', async () => {
      const { wrapper } = await mountWithQuery({
        token: 'valid-token',
        email: 'test@example.com',
      })

      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const confirmInput = wrapper.find('[data-test-id="password-confirmation-input"]')

      await passwordInput.setValue('NewPassword1!')
      await confirmInput.setValue('NewPassword1!')

      expect((passwordInput.element as HTMLInputElement).value).toBe('NewPassword1!')
      expect((confirmInput.element as HTMLInputElement).value).toBe('NewPassword1!')
    })
  })

  describe('Communication', () => {
    it('sends an API request with correct payload', async () => {
      const { wrapper } = await mountWithQuery({
        token: 'valid-token',
        email: 'test@example.com',
      })

      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const confirmInput = wrapper.find('[data-test-id="password-confirmation-input"]')
      const submitButton = wrapper.find('[data-test-id="reset-password-button"]')

      await passwordInput.setValue('NewPassword1!')
      await confirmInput.setValue('NewPassword1!')
      await submitButton.trigger('click')
      await nextTick()

      expect(useAxios().post).toHaveBeenCalledExactlyOnceWith('/reset-password', {
        token: 'valid-token',
        email: 'test@example.com',
        password: 'NewPassword1!',
        password_confirmation: 'NewPassword1!',
      })
    })

    it('redirects to login on success', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        data: { message: 'Your password has been reset.' },
        status: 200,
      })

      const { wrapper, router } = await mountWithQuery({
        token: 'valid-token',
        email: 'test@example.com',
      })

      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const confirmInput = wrapper.find('[data-test-id="password-confirmation-input"]')
      const submitButton = wrapper.find('[data-test-id="reset-password-button"]')

      await passwordInput.setValue('NewPassword1!')
      await confirmInput.setValue('NewPassword1!')
      await submitButton.trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('login')
    })
  })

  describe('Validation', () => {
    it('shows error when password is empty', async () => {
      const { wrapper } = await mountWithQuery({
        token: 'valid-token',
        email: 'test@example.com',
      })

      const submitButton = wrapper.find('[data-test-id="reset-password-button"]')
      await submitButton.trigger('click')
      await nextTick()

      const errorMessage = wrapper.find('.error-message')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Password is required.')
    })

    it('shows error when passwords do not match', async () => {
      const { wrapper } = await mountWithQuery({
        token: 'valid-token',
        email: 'test@example.com',
      })

      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const confirmInput = wrapper.find('[data-test-id="password-confirmation-input"]')
      const submitButton = wrapper.find('[data-test-id="reset-password-button"]')

      await passwordInput.setValue('NewPassword1!')
      await confirmInput.setValue('DifferentPassword1!')
      await submitButton.trigger('click')
      await nextTick()

      const errorMessage = wrapper.find('.error-message')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Password and Password Confirmation must match.')
    })
  })

  describe('Error Handling', () => {
    it('shows invalid token error on 400 response', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        error: 'Invalid or expired reset token.',
        status: 400,
      })

      const { wrapper } = await mountWithQuery({
        token: 'invalid-token',
        email: 'test@example.com',
      })

      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const confirmInput = wrapper.find('[data-test-id="password-confirmation-input"]')
      const submitButton = wrapper.find('[data-test-id="reset-password-button"]')

      await passwordInput.setValue('NewPassword1!')
      await confirmInput.setValue('NewPassword1!')
      await submitButton.trigger('click')
      await flushPromises()

      const errorMessage = wrapper.find('[data-test-id="error-message"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Invalid or expired reset link. Please request a new one.')
    })

    it('shows generic error message on 500 response', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        error: 'Internal Server Error',
        status: 500,
      })

      const { wrapper } = await mountWithQuery({
        token: 'valid-token',
        email: 'test@example.com',
      })

      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const confirmInput = wrapper.find('[data-test-id="password-confirmation-input"]')
      const submitButton = wrapper.find('[data-test-id="reset-password-button"]')

      await passwordInput.setValue('NewPassword1!')
      await confirmInput.setValue('NewPassword1!')
      await submitButton.trigger('click')
      await flushPromises()

      const errorMessage = wrapper.find('[data-test-id="error-message"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Something went wrong. Please try again later.')
    })
  })
})
