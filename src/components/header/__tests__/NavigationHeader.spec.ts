import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NavigationHeader from '@/components/header/NavigationHeader.vue'
import { createMemoryHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/matrix', name: 'matrix', component: { template: '<div />' } },
    { path: '/configure', name: 'configure', component: { template: '<div />' } },
    { path: '/calibrate', name: 'calibrate', component: { template: '<div />' } },
  ],
})

describe('NavigationHeader Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders', () => {
      const wrapper = mount(NavigationHeader, { global: { plugins: [router] } })

      expect(wrapper.exists()).toBe(true)
    })

    it('renders the hamburger button', () => {
      const wrapper = mount(NavigationHeader, { global: { plugins: [router] } })

      const button = wrapper.find('[data-test-id="hamburger-button"]')

      expect(button.exists()).toBe(true)
    })

    it('does not show drawer by default', () => {
      const wrapper = mount(NavigationHeader, { global: { plugins: [router] } })

      const drawer = wrapper.find('[data-test-id="mobile-drawer"]')

      expect(drawer.exists()).toBe(false)
    })

    it('opens drawer when hamburger button is clicked', async () => {
      const wrapper = mount(NavigationHeader, { global: { plugins: [router] } })

      await wrapper.find('[data-test-id="hamburger-button"]').trigger('click')

      const drawer = wrapper.find('[data-test-id="mobile-drawer"]')
      expect(drawer.exists()).toBe(true)
    })

    it('displays nav links in open drawer', async () => {
      const wrapper = mount(NavigationHeader, { global: { plugins: [router] } })

      await wrapper.find('[data-test-id="hamburger-button"]').trigger('click')

      expect(wrapper.find('a[href="/matrix"]').text()).toBe('Wedge Matrix')
      expect(wrapper.find('a[href="/configure"]').text()).toBe('Configure')
      expect(wrapper.find('a[href="/calibrate"]').text()).toBe('Calibrate')
    })

    it('displays category headings in open drawer', async () => {
      const wrapper = mount(NavigationHeader, { global: { plugins: [router] } })

      await wrapper.find('[data-test-id="hamburger-button"]').trigger('click')

      const categories = wrapper.findAll('.nav-category').map((c) => c.text())
      expect(categories).toEqual(['Matrix', 'Practice'])
    })

    it('closes drawer when close button is clicked', async () => {
      const wrapper = mount(NavigationHeader, { global: { plugins: [router] } })

      await wrapper.find('[data-test-id="hamburger-button"]').trigger('click')
      expect(wrapper.find('[data-test-id="mobile-drawer"]').exists()).toBe(true)

      await wrapper.find('[data-test-id="close-drawer-button"]').trigger('click')

      expect(wrapper.find('[data-test-id="mobile-drawer"]').exists()).toBe(false)
    })
  })
})
