import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import ColumnHeaderLabelInput from '@/components/configure/ColumnHeaderLabelInput.vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { AllowableMatrixColumnNumber } from '@/types/matrix'
import { PERCENTAGE_OPTIONS, CLOCK_OPTIONS } from '@/types/matrix'

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
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

    it('renders the two swing feel system tiles', () => {
      const wrapper = mount(ColumnHeaderLabelInput)

      const tiles = wrapper.findAll('[data-test-id^="swing-feel-system-"]')

      expect(tiles).toHaveLength(2)
      expect(tiles[0]!.text()).toBe('Percentage')
      expect(tiles[1]!.text()).toBe('Clock')
    })

    it('defaults to Percentage system with percentage options in dropdowns', () => {
      const wrapper = mount(ColumnHeaderLabelInput)

      const tiles = wrapper.findAll('[data-test-id^="swing-feel-system-"]')
      expect(tiles[0]!.classes()).toContain('tile-active')
      expect(tiles[1]!.classes()).toContain('tile')

      const selects = wrapper.findAll('[data-test-id="column-header-selector"]')
      const options = selects[0]!.findAll('option')
      const optionValues = options.map((o) => o.element.value)

      expect(optionValues).toEqual([...PERCENTAGE_OPTIONS])
    })

    it('switching to Clock system shows clock options in dropdowns', async () => {
      const wrapper = mount(ColumnHeaderLabelInput)

      const tiles = wrapper.findAll('[data-test-id^="swing-feel-system-"]')
      await tiles[1]!.trigger('click')

      const selects = wrapper.findAll('[data-test-id="column-header-selector"]')
      const options = selects[0]!.findAll('option')
      const optionValues = options.map((o) => o.element.value)

      expect(optionValues).toEqual([...CLOCK_OPTIONS])
    })
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

    it('switching system preserves headers and restores them when switching back', async () => {
      const store = useMatrixConfigurationStore()
      const { matrixColumnHeaders } = storeToRefs(store)
      const wrapper = mount(ColumnHeaderLabelInput)

      const inputs = wrapper.findAll('[data-test-id="column-header-selector"]')
      await inputs[0]?.setValue('25%')
      expect(matrixColumnHeaders.value[0]).toBe('25%')

      const tiles = wrapper.findAll('[data-test-id^="swing-feel-system-"]')
      await tiles[1]!.trigger('click')
      expect(matrixColumnHeaders.value).toEqual(['9:00', '10:00', '11:00', '12:00'])

      await tiles[0]!.trigger('click')
      expect(matrixColumnHeaders.value[0]).toBe('25%')
    })

    it('updates store swingFeelSystem when a tile is clicked', async () => {
      const store = useMatrixConfigurationStore()
      const wrapper = mount(ColumnHeaderLabelInput)

      expect(store.swingFeelSystem).toBe('Percentage')

      const tiles = wrapper.findAll('[data-test-id^="swing-feel-system-"]')
      await tiles[1]!.trigger('click')

      expect(store.swingFeelSystem).toBe('Clock')
    })
  })
})
