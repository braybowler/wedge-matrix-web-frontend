import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import MobileFooter from '@/components/footer/MobileFooter.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', redirect: '/matrix' },
    { path: '/login', name: 'login', component: { template: '<div />' } },
    { path: '/matrix', name: 'matrix', component: { template: '<div />' } },
  ],
})

describe('MobileFooter Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('renders', () => {
      const wrapper = mount(MobileFooter, { global: { plugins: [router] } })

      expect(wrapper.exists()).toBe(true)
    })

    it('displays an account settings button', () => {
      const wrapper = mount(MobileFooter, { global: { plugins: [router] } })

      const button = wrapper.find('[data-test-id="account-settings-button"]')

      expect(button.exists()).toBe(true)
    })

    it('displays a logout button', () => {
      const wrapper = mount(MobileFooter, { global: { plugins: [router] } })

      const button = wrapper.find('[data-test-id="logout-button"]')

      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Logout')
    })
  })

  describe('User Input', () => {
    it('navigates to login page on logout', async () => {
      await router.push({ name: 'matrix' })
      await router.isReady()

      const wrapper = mount(MobileFooter, { global: { plugins: [router] } })

      await wrapper.find('[data-test-id="logout-button"]').trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('login')
    })
  })
})
