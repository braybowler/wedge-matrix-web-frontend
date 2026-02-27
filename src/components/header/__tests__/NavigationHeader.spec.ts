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

    it('displays Wedge Matrix link', () => {
      const wrapper = mount(NavigationHeader, { global: { plugins: [router] } })

      const link = wrapper.find('a[href="/matrix"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Wedge Matrix')
    })

    it('displays Configure link', () => {
      const wrapper = mount(NavigationHeader, { global: { plugins: [router] } })

      const link = wrapper.find('a[href="/configure"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Configure')
    })

    it('displays Calibrate link', () => {
      const wrapper = mount(NavigationHeader, { global: { plugins: [router] } })

      const link = wrapper.find('a[href="/calibrate"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Calibrate')
    })
  })
})
