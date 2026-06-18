import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ConfigureView from '@/views/configure/ConfigureView.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
    getBlob: vi.fn(),
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

    it('renders the matrix selector', () => {
      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      expect(wrapper.find('[data-test-id="matrix-selector"]').exists()).toBe(true)
    })

    it('renders the matrix selector without action buttons', () => {
      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      expect(wrapper.find('[data-test-id="create-matrix-button"]').exists()).toBe(false)
      expect(wrapper.find('[data-test-id="rename-matrix-button"]').exists()).toBe(false)
      expect(wrapper.find('[data-test-id="delete-matrix-button"]').exists()).toBe(false)
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

    it('starts on the Clubs step (step 1 of 4)', () => {
      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      expect(wrapper.text()).toContain('Step 1 of 4')
      expect(wrapper.text()).toContain('Which wedges are in your bag?')
    })
  })

  describe('Wizard Navigation', () => {
    it('advances to the next step when Continue is clicked', async () => {
      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      await wrapper.find('[data-test-id="wizard-next-button"]').trigger('click')

      expect(wrapper.text()).toContain('Step 2 of 4')
      expect(wrapper.text()).toContain('How should rows be labeled?')
    })

    it('goes back to the previous step when Back is clicked', async () => {
      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      await wrapper.find('[data-test-id="wizard-next-button"]').trigger('click')
      await wrapper.find('[data-test-id="wizard-back-button"]').trigger('click')

      expect(wrapper.text()).toContain('Step 1 of 4')
    })

    it('disables Back on the first step', () => {
      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      const backButton = wrapper.find('[data-test-id="wizard-back-button"]')
      expect((backButton.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('renders Save matrix label on the final step', async () => {
      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      const next = wrapper.find('[data-test-id="wizard-next-button"]')
      await next.trigger('click')
      await next.trigger('click')
      await next.trigger('click')

      expect(next.text()).toContain('Save matrix')
    })

    it('jumps directly to a step when the stepper button is clicked', async () => {
      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      await wrapper.find('[data-test-id="step-display"]').trigger('click')

      expect(wrapper.text()).toContain('Step 4 of 4')
      expect(wrapper.text()).toContain('What goes in each cell?')
    })

    it('navigates to /matrix when Save matrix is clicked on the final step', async () => {
      await router.push({ name: 'configure' })
      await router.isReady()

      const matrixStore = useMatrixConfigurationStore()
      vi.spyOn(matrixStore, 'synchronizeValues').mockResolvedValue()

      const wrapper = mount(ConfigureView, { global: { plugins: [router] } })

      await wrapper.find('[data-test-id="step-display"]').trigger('click')
      await wrapper.find('[data-test-id="wizard-next-button"]').trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.path).toBe('/matrix')
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
})
