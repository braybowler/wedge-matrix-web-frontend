import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import LoginForm from '@/components/login/LoginForm.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from '@/views/login/LoginView.vue'
import RegisterView from '@/views/register/RegisterView.vue'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useAxios } from '@/composables/axios/axios.ts'
import MatrixView from '@/views/matrix/MatrixView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login',
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
    {
      path: '/matrix',
      name: 'matrix',
      component: MatrixView,
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

describe('LoginForm Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Form Rendering', () => {
    it('renders', () => {
      const wrapper = mount(LoginForm, { global: { plugins: [router] } })

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
    ])('accepts $inputId', async ({ inputId }) => {
      const wrapper = mount(LoginForm, { global: { plugins: [router] } })

      const input = wrapper.find(`[data-test-id=${inputId}]`)

      await input.setValue('test-text')
      await input.trigger('input')

      expect((input.element as HTMLInputElement).value).toBe('test-text')
    })

    it('links a user to the register page', async () => {
      const wrapper = mount(LoginForm, { global: { plugins: [router] } })

      const registerPageLink = wrapper.find(`[data-test-id="register-page-link"]`)

      await registerPageLink.trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.path).toBe('/register')
    })

    it('redirects a user to /matrix after a successful login attempt', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        data: {
          message: 'Login successful',
          user: {
            id: 3,
            email: 'email@example.com',
            email_verified_at: null,
            wedge_matrices: [
              {
                id: 1,
                user_id: 1,
                label: null,
                number_of_rows: 4,
                number_of_columns: 4,
                selected_row_display_option: 'Both',
                column_headers: null,
                values: null,
              },
            ],
          },
          access_token: 'mock-token-123',
        },
        status: 200,
      })

      await router.push({ name: 'login' })
      await router.isReady()

      const wrapper = mount(LoginForm, { global: { plugins: [router] } })

      const emailInput = wrapper.find('[data-test-id="email-input"]')
      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const loginButton = wrapper.find('[data-test-id="login-button"]')

      await emailInput.setValue('email@example.com')
      await passwordInput.setValue('password')
      await loginButton.trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('matrix')
    })
  })

  describe('Communication', () => {
    it('sends an API request with form values on login attempt', async () => {
      const wrapper = mount(LoginForm, { global: { plugins: [router] } })

      const emailInput = wrapper.find('[data-test-id="email-input"]')
      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const loginButton = wrapper.find('[data-test-id="login-button"]')

      await emailInput.setValue('email@example.com')
      await passwordInput.setValue('password')
      await loginButton.trigger('click')
      await nextTick()

      expect(useAxios().post).toHaveBeenCalledExactlyOnceWith('/login', {
        email: 'email@example.com',
        password: 'password',
      })
    })
  })

  describe('Error Handling', () => {
    const submitLoginForm = async (wrapper: ReturnType<typeof mount>) => {
      const emailInput = wrapper.find('[data-test-id="email-input"]')
      const passwordInput = wrapper.find('[data-test-id="password-input"]')
      const loginButton = wrapper.find('[data-test-id="login-button"]')

      await emailInput.setValue('email@example.com')
      await passwordInput.setValue('password')
      await loginButton.trigger('click')
      await flushPromises()
    }

    it('shows "Invalid credentials." for a 401 response', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        error: 'Unauthorized',
        status: 401,
      })

      const wrapper = mount(LoginForm, { global: { plugins: [router] } })
      await submitLoginForm(wrapper)

      const errorMessage = wrapper.find('[data-test-id="login-error-message"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Invalid credentials.')
    })

    it('shows "Invalid credentials." for a 422 response', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        error: 'Validation failed',
        status: 422,
      })

      const wrapper = mount(LoginForm, { global: { plugins: [router] } })
      await submitLoginForm(wrapper)

      const errorMessage = wrapper.find('[data-test-id="login-error-message"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Invalid credentials.')
    })

    it('shows a network error message when the server is unreachable', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        error: 'Unable to reach the server. Please check your connection.',
        status: 0,
      })

      const wrapper = mount(LoginForm, { global: { plugins: [router] } })
      await submitLoginForm(wrapper)

      const errorMessage = wrapper.find('[data-test-id="login-error-message"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Unable to reach the server. Please check your connection.')
    })

    it('shows a generic error message for a 500 response', async () => {
      mockUseAxiosComposable.post.mockResolvedValueOnce({
        error: 'Internal Server Error',
        status: 500,
      })

      const wrapper = mount(LoginForm, { global: { plugins: [router] } })
      await submitLoginForm(wrapper)

      const errorMessage = wrapper.find('[data-test-id="login-error-message"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Something went wrong. Please try again later.')
    })
  })
})
