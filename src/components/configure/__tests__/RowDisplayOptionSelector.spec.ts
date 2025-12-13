import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RowDisplayOptionSelector from '@/components/configure/RowDisplayOptionSelector.vue'
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

describe('RowDisplayOptionSelector Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('renders', () => {
      const wrapper = mount(RowDisplayOptionSelector)

      expect(wrapper.exists()).toBeTruthy()
    })

    it('renders all row display options', () => {
      const wrapper = mount(RowDisplayOptionSelector)

      const options = wrapper.findAll('[data-test-id="option"]')

      expect(options.length).toEqual(3)
    })
  })

  describe('User Input', () => {
    it('allows a user to select the row types to display', async () => {
      const wrapper = mount(RowDisplayOptionSelector)

      const options = wrapper.findAll('[data-test-id="option"]')

      expect(options[2]?.classes()).not.toContain('options-container-active')
      expect(options[2]?.classes()).toContain('option-container')

      await options[2]?.trigger('click')

      expect(options[2]?.classes()).toContain('option-container-active')
      expect(options[2]?.classes()).not.toContain('option-container')
    })
  })

  describe('Interaction With MatrixConfigurationStore', () => {
    it('receives initialization values from store on mount', () => {
      const matrixConfigurationStore = useMatrixConfigurationStore()
      matrixConfigurationStore.selectedRowDisplayOption = 'Both'
      const wrapper = mount(RowDisplayOptionSelector)

      const options = wrapper.findAll('[data-test-id="option"]')

      expect(options.length).toBe(3)
      expect(options[2]?.classes()).toContain('option-container-active')
    })

    it('updates store values when a user makes a selection', async () => {
      const store = useMatrixConfigurationStore()
      const { selectedRowDisplayOption } = storeToRefs(store)
      const wrapper = mount(RowDisplayOptionSelector)

      const options = wrapper.findAll('[data-test-id="option"]')

      expect(selectedRowDisplayOption.value).toBe('Carry')

      await options[2]?.trigger('click')

      expect(selectedRowDisplayOption.value).toBe('Both')
    })
  })
})
