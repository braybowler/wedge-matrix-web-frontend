import { describe, it, expect, beforeEach, vi } from 'vitest'
import RegisterForm from '@/components/register/RegisterForm.vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from '@/views/login/LoginView.vue'
import RegisterView from '@/views/register/RegisterView.vue'
import { nextTick } from 'vue'
import { useAxios } from '@/composables/axios/axios.ts'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      redirect: '/register',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
  ],
})

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

describe('RegisterForm Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Form Rendering', () => {
    it('renders', () => {
      const wrapper = mount(RegisterForm, { global: { plugins: [router] } })

      expect(wrapper.exists).toBeTruthy()
    })
  })

  describe('User Input', () => {
    it.each([
      {
        inputId: 'email-input',
      },
      {
        inputId: 'password-input',
      },
      {
        inputId: 'password-confirmation-input',
      },
    ])('accepts $inputId', async ({ inputId }) => {
      const wrapper = mount(RegisterForm, { global: { plugins: [router] } })

      const input = wrapper.find(`[data-test-id=${inputId}]`)

      await input.setValue('test-text')
      await input.trigger('input')

      expect((input.element as HTMLInputElement).value).toBe('test-text')
    })

    it('links a user to the login page', async () => {
      const wrapper = mount(RegisterForm, { global: { plugins: [router] } })

      const loginPageLink = wrapper.find(`[data-test-id="login-page-link"]`)

      await loginPageLink.trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('redirects a user to /login after a successful registration attempt', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        data: {
          message: 'User registered successfully.',
          user: {
            email: 'test@admin.com',
            updated_at: '2025-12-10T18:04:59.000000Z',
            created_at: '2025-12-10T18:04:59.000000Z',
            id: 4,
          },
        },
        status: 201,
      })

      await router.push({ name: 'register' })
      await router.isReady()

      const wrapper = mount(RegisterForm, { global: { plugins: [router] } })

      const emailInput = wrapper.find('[data-test-id="email-input"]')
      const passwordConfirmationInput = wrapper.find('[data-test-id="password-confirmation-input"]')
      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const registerButton = wrapper.find('[data-test-id="register-button"]')

      await emailInput.setValue('test@admin.com')
      await passwordInput.setValue('password')
      await passwordConfirmationInput.setValue('password')
      await registerButton.trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('login')
    })
  })

  describe('Communication', () => {
    it('sends an API request with form values on register attempt', async () => {
      const wrapper = mount(RegisterForm, { global: { plugins: [router] } })

      const emailInput = wrapper.find('[data-test-id="email-input"]')
      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const passwordConfirmationInput = wrapper.find('[data-test-id="password-confirmation-input"]')
      const registerButton = wrapper.find('[data-test-id="register-button"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password')
      await passwordConfirmationInput.setValue('password')
      await registerButton.trigger('click')
      await nextTick()

      expect(useAxios().post).toHaveBeenCalledExactlyOnceWith('/register', {
        email: 'test@example.com',
        password: 'password',
        password_confirmation: 'password',
      })
    })
  })
})
