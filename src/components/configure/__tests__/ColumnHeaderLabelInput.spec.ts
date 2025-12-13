import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import ColumnHeaderLabelInput from '@/components/configure/ColumnHeaderLabelInput.vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { AllowableMatrixColumnNumber } from '@/types/matrix'

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

describe('ColumnHeaderLabelInput Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('renders', () => {
      const wrapper = mount(ColumnHeaderLabelInput)

      expect(wrapper.exists()).toBeTruthy()
    })

    it.each([
      {
        numberOfSwingColumns: 1,
      },
      {
        numberOfSwingColumns: 2,
      },
      {
        numberOfSwingColumns: 3,
      },
      {
        numberOfSwingColumns: 4,
      },
    ])(
      'renders correct number of column header label inputs: $numberOfSwingColumns',
      ({ numberOfSwingColumns }) => {
        const store = useMatrixConfigurationStore()
        const { matrixColumns } = storeToRefs(store)
        matrixColumns.value = numberOfSwingColumns as AllowableMatrixColumnNumber
        const wrapper = mount(ColumnHeaderLabelInput)

        const inputs = wrapper.findAll('[data-test-id="column-label-selector-pair"]')

        expect(inputs.length).toEqual(numberOfSwingColumns)
      },
    )
  })

  describe('User Input', () => {
    it('allows a user to select header labels from the dropdown', async () => {
      const wrapper = mount(ColumnHeaderLabelInput)

      const selects = wrapper.findAll('[data-test-id="column-header-selector"]')

      await selects[0]?.setValue('25%')

      expect((selects[0]?.element as HTMLSelectElement).value).toBe('25%')
    })
  })

  describe('Interaction With MatrixConfigurationStore', () => {
    it('receives initialization values from store on mount', () => {
      const store = useMatrixConfigurationStore()
      const { matrixColumnHeaders } = storeToRefs(store)
      const wrapper = mount(ColumnHeaderLabelInput)

      const selects = wrapper.findAll('[data-test-id="column-header-selector"]')

      expect(selects.length).toBe(4)
      selects.forEach((input, index) => {
        expect((input.element as HTMLSelectElement).value).toBe(matrixColumnHeaders.value[index])
      })
    })

    it('updates store values when a user updates an input', async () => {
      const store = useMatrixConfigurationStore()
      const { matrixColumnHeaders } = storeToRefs(store)
      const wrapper = mount(ColumnHeaderLabelInput)

      const inputs = wrapper.findAll('[data-test-id="column-header-selector"]')

      expect(matrixColumnHeaders.value).toEqual(['', '', '', ''])

      await inputs[0]?.setValue('25%')

      expect(matrixColumnHeaders.value).toEqual(['25%', '', '', ''])
    })
  })
})
