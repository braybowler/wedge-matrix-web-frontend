import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { RowDisplayOption } from '@/types/matrix'

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

describe('WedgeMatrix Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Matrix Rendering', () => {
    it('renders', () => {
      const wrapper = mount(WedgeMatrix)

      expect(wrapper.exists()).toBeTruthy()
    })

    it('displays correct clubs (matrix rows)', () => {
      const wrapper = mount(WedgeMatrix)
      const clubs = ['LW', 'SW', 'GW', 'PW']

      clubs.forEach((club) => {
        expect(wrapper.text()).toContain(club)
      })
    })

    it('displays correct column headers (matrix columns)', () => {
      const matrixConfigurationStore = useMatrixConfigurationStore()
      const { matrixColumnHeaders } = storeToRefs(matrixConfigurationStore)
      matrixColumnHeaders.value = ['25%', '50%', '75%', '100%']

      const wrapper = mount(WedgeMatrix)

      matrixColumnHeaders.value.forEach((header, index) => {
        expect(wrapper.text()).toContain(header[index])
      })
    })

    it.each([
      {
        testRowDisplayOption: 'Carry',
      },
      {
        testRowDisplayOption: 'Total',
      },
    ])(
      'displays correct row display option when selected row option is: $testRowDisplayOption',
      ({ testRowDisplayOption }) => {
        const matrixConfigurationStore = useMatrixConfigurationStore()
        const { selectedRowDisplayOption } = storeToRefs(matrixConfigurationStore)
        selectedRowDisplayOption.value = testRowDisplayOption as RowDisplayOption

        const wrapper = mount(WedgeMatrix)

        expect(wrapper.text()).toContain(testRowDisplayOption)
      },
    )

    it('displays correct row display option when selected row option is: Both', () => {
      const matrixConfigurationStore = useMatrixConfigurationStore()
      const { selectedRowDisplayOption } = storeToRefs(matrixConfigurationStore)
      selectedRowDisplayOption.value = 'Both'

      const wrapper = mount(WedgeMatrix)

      expect(wrapper.text()).toContain('Carry')
      expect(wrapper.text()).toContain('Total')
    })
  })

  describe('User Input', () => {
    it('accepts user yardage input', async () => {
      const wrapper = mount(WedgeMatrix)

      const inputs = wrapper.findAll('[data-test-id="carry-input"]')

      await inputs[0]?.setValue('50')
      await inputs[0]?.trigger('input')

      expect((inputs[0]?.element as HTMLInputElement).value).toBe('50')
    })

    it('clears the matrix values on clear matrix button press', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      const wrapper = mount(WedgeMatrix, {
        attachTo: document.body,
      })

      const inputs = wrapper.findAll('[data-test-id="carry-input"]')

      for (const input of inputs) {
        await input.setValue('50')
        await input.trigger('input')
      }

      for (const input of inputs) {
        expect((input.element as HTMLInputElement).value).toBe('50')
      }

      const clearAllButton = wrapper.find('[data-test-id="clear-all-button"]')

      await clearAllButton.trigger('click')

      for (const input of inputs) {
        expect((input.element as HTMLInputElement).value).toBe('')
      }
    })

    it.todo('validates user yardage input')
  })
})
