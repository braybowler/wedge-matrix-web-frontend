import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ConfigureView from '@/views/configure/ConfigureView.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
  }),
}))

const stubComponent = { template: '<div />' }

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', redirect: '/configure' },
    { path: '/configure', name: 'configure', component: stubComponent },
    { path: '/matrix', name: 'matrix', component: stubComponent },
  ],
})

describe('ConfigureView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('renders', () => {
      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      expect(wrapper.exists()).toBe(true)
    })

    it('displays sync error message when syncError is set', async () => {
      const matrixStore = useMatrixConfigurationStore()
      matrixStore.syncError = 'Server error'

      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      const errorMessage = wrapper.find('[data-test-id="sync-error-message"]')
      expect(errorMessage.exists()).toBe(true)
      expect(errorMessage.text()).toBe('Server error')
    })

    it('does not display sync error message when syncError is null', () => {
      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      const errorMessage = wrapper.find('[data-test-id="sync-error-message"]')
      expect(errorMessage.exists()).toBe(false)
    })
  })

  describe('Synchronization', () => {
    it('calls synchronizeValues on unmount', async () => {
      const matrixStore = useMatrixConfigurationStore()
      const syncSpy = vi.spyOn(matrixStore, 'synchronizeValues').mockResolvedValue()

      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })
      wrapper.unmount()
      await flushPromises()

      expect(syncSpy).toHaveBeenCalledOnce()
    })
  })

  describe('Tutorial Flow', () => {
    it('advances tutorial step when a highlight is dismissed', async () => {
      const tutorialStore = useTutorialStore()
      tutorialStore.tutorialStep = 1

      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      const highlight = wrapper.findComponent({ name: 'TutorialHighlight' })
      highlight.vm.$emit('dismiss')
      await flushPromises()

      expect(tutorialStore.tutorialStep).toBe(2)
    })

    it('navigates to /matrix when finishing configuration at the last step', async () => {
      await router.push({ name: 'configure' })
      await router.isReady()

      const tutorialStore = useTutorialStore()
      tutorialStore.tutorialStep = 4

      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      const highlights = wrapper.findAllComponents({ name: 'TutorialHighlight' })
      const lastHighlight = highlights[highlights.length - 1] as (typeof highlights)[number]
      lastHighlight.vm.$emit('dismiss')
      await flushPromises()

      expect(router.currentRoute.value.path).toBe('/matrix')
    })
  })
})
