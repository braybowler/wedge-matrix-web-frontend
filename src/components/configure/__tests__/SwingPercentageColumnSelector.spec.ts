import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SwingPercentageColumnSelector from '@/components/configure/SwingPercentageColumnSelector.vue'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

describe('SwingPercentageColumnSelector Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('renders', () => {
      const wrapper = mount(SwingPercentageColumnSelector)

      expect(wrapper.exists()).toBeTruthy()
    })

    it('renders four options for the number of swing columns a user may configure', () => {
      const wrapper = mount(SwingPercentageColumnSelector)

      const selectors = wrapper.findAll('[data-test-id="selector"]')

      expect(selectors.length).toEqual(4)
    })
  })

  describe('User Input', () => {
    it('allows a user to select the number of swing columns', async () => {
      const wrapper = mount(SwingPercentageColumnSelector)

      const selectors = wrapper.findAll('[data-test-id="selector"]')

      expect(selectors[0]?.classes()).not.toContain('selector-container-active')
      expect(selectors[0]?.classes()).toContain('selector-container')

      await selectors[0]?.trigger('click')

      expect(selectors[0]?.classes()).toContain('selector-container-active')
      expect(selectors[0]?.classes()).not.toContain('selector-container')
    })
  })

  describe('Interaction With MatrixConfigurationStore', () => {
    it('receives initialization values from store on mount', () => {
      const matrixConfigurationStore = useMatrixConfigurationStore()
      const { matrixColumns } = storeToRefs(matrixConfigurationStore)
      matrixColumns.value = 4
      const wrapper = mount(SwingPercentageColumnSelector)

      const selectors = wrapper.findAll('[data-test-id="selector"]')

      expect(selectors[matrixColumns.value - 1]?.classes()).toContain('selector-container-active')
    })

    it('updates store values when a user makes a selection', async () => {
      const store = useMatrixConfigurationStore()
      const { matrixColumns } = storeToRefs(store)

      const wrapper = mount(SwingPercentageColumnSelector)

      const selectors = wrapper.findAll('[data-test-id="selector"]')

      expect(matrixColumns.value).toBe(4)

      await selectors[0]?.trigger('click')

      expect(matrixColumns.value).toBe(1)
    })
  })
})
