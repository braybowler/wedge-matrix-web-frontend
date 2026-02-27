import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', redirect: '/matrix' },
    { path: '/login', name: 'login', component: { template: '<div />' } },
    { path: '/matrix', name: 'matrix', component: { template: '<div />' } },
    { path: '/configure', name: 'configure', component: { template: '<div />' } },
    { path: '/calibrate', name: 'calibrate', component: { template: '<div />' } },
  ],
})

describe('SidebarNavigation Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('renders', () => {
      const wrapper = mount(SidebarNavigation, { global: { plugins: [router] } })

      expect(wrapper.exists()).toBe(true)
    })

    it('displays Wedge Matrix link', () => {
      const wrapper = mount(SidebarNavigation, { global: { plugins: [router] } })

      const link = wrapper.find('a[href="/matrix"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Wedge Matrix')
    })

    it('displays Configure link', () => {
      const wrapper = mount(SidebarNavigation, { global: { plugins: [router] } })

      const link = wrapper.find('a[href="/configure"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Configure')
    })

    it('displays Calibrate link', () => {
      const wrapper = mount(SidebarNavigation, { global: { plugins: [router] } })

      const link = wrapper.find('a[href="/calibrate"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Calibrate')
    })

    it('displays an account settings button', () => {
      const wrapper = mount(SidebarNavigation, { global: { plugins: [router] } })

      const button = wrapper.find('[data-test-id="account-settings-button"]')

      expect(button.exists()).toBe(true)
    })

    it('displays a logout button', () => {
      const wrapper = mount(SidebarNavigation, { global: { plugins: [router] } })

      const button = wrapper.find('[data-test-id="logout-button"]')

      expect(button.exists()).toBe(true)
      expect(button.text()).toBe('Logout')
    })
  })

  describe('User Input', () => {
    it('navigates to login page on logout', async () => {
      await router.push({ name: 'matrix' })
      await router.isReady()

      const wrapper = mount(SidebarNavigation, { global: { plugins: [router] } })

      await wrapper.find('[data-test-id="logout-button"]').trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('login')
    })
  })
})
