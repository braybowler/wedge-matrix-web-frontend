import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import ColumnHeaderLabelInput from '@/components/configure/ColumnHeaderLabelInput.vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { AllowableMatrixColumnNumber } from '@/types/matrix'

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
    ])('renders correct number of column header label inputs', ({ numberOfSwingColumns }) => {
      const store = useMatrixConfigurationStore()
      const { matrixColumns } = storeToRefs(store)
      matrixColumns.value = numberOfSwingColumns as AllowableMatrixColumnNumber
      const wrapper = mount(ColumnHeaderLabelInput)

      const inputs = wrapper.findAll('[data-test-id="column-header-input"]')

      expect(inputs.length).toEqual(numberOfSwingColumns)
    })
  })

  describe('User Input', () => {
    it('allows a user to input custom header labels', async () => {
      const wrapper = mount(ColumnHeaderLabelInput)

      const inputs = wrapper.findAll('[data-test-id="column-header-input"]')

      await inputs[0]?.setValue('30%')
      await inputs[0]?.trigger('input')

      expect((inputs[0]?.element as HTMLInputElement).value).toBe('30%')
    })
  })

  describe('Interaction With MatrixConfigurationStore', () => {
    it('receives initialization values from store on mount', () => {
      const store = useMatrixConfigurationStore()
      const { matrixColumnHeaders } = storeToRefs(store)
      const wrapper = mount(ColumnHeaderLabelInput)

      const inputs = wrapper.findAll('[data-test-id="column-header-input"]')

      expect(inputs.length).toBe(4)
      inputs.forEach((input, index) => {
        expect((input.element as HTMLInputElement).value).toBe(
          matrixColumnHeaders.value[index]?.label,
        )
      })
    })

    it('updates store values when a user updates an input', async () => {
      const store = useMatrixConfigurationStore()
      const { matrixColumnHeaders } = storeToRefs(store)
      const wrapper = mount(ColumnHeaderLabelInput)

      const inputs = wrapper.findAll('[data-test-id="column-header-input"]')

      expect(matrixColumnHeaders.value).toEqual([
        {
          label: '25%',
          id: 1,
        },
        {
          label: '50%',
          id: 2,
        },
        {
          label: '75%',
          id: 3,
        },
        {
          label: '100%',
          id: 4,
        },
      ])

      await inputs[0]?.setValue('30%')
      await inputs[0]?.trigger('input')

      expect(matrixColumnHeaders.value).toEqual([
        {
          label: '30%',
          id: 1,
        },
        {
          label: '50%',
          id: 2,
        },
        {
          label: '75%',
          id: 3,
        },
        {
          label: '100%',
          id: 4,
        },
      ])
    })
  })
})
