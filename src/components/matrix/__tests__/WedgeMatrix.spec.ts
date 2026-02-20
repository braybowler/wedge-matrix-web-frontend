import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { RowDisplayOption } from '@/types/matrix'

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn().mockResolvedValue({}),
  get: vi.fn().mockResolvedValue({}),
  put: vi.fn().mockResolvedValue({}),
  patch: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

describe('WedgeMatrix Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockUseAxiosComposable.put.mockResolvedValue({})
    mockUseAxiosComposable.patch.mockResolvedValue({})
    setActivePinia(createPinia())
  })

  describe('Matrix Rendering', () => {
    it('renders', () => {
      const wrapper = mount(WedgeMatrix)

      expect(wrapper.exists()).toBeTruthy()
    })

    it('displays correct clubs (matrix rows)', () => {
      const matrixConfigurationStore = useMatrixConfigurationStore()
      const { selectedClubs } = storeToRefs(matrixConfigurationStore)

      const wrapper = mount(WedgeMatrix)
      selectedClubs.value.forEach((club) => {
        expect(wrapper.text()).toContain(club)
      })
    })

    it('updates rendered rows when selectedClubs changes', async () => {
      const matrixConfigurationStore = useMatrixConfigurationStore()
      const wrapper = mount(WedgeMatrix)

      matrixConfigurationStore.setSelectedClubs(['LW', 'PW'])
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('LW')
      expect(wrapper.text()).toContain('PW')
      expect(wrapper.text()).not.toContain('SW')
      expect(wrapper.text()).not.toContain('GW')
    })

    it('displays correct column headers (matrix columns)', () => {
      const matrixConfigurationStore = useMatrixConfigurationStore()
      const { matrixColumnHeaders } = storeToRefs(matrixConfigurationStore)
      matrixColumnHeaders.value = ['25%', '50%', '75%', '100%']

      const wrapper = mount(WedgeMatrix)

      matrixColumnHeaders.value.forEach((header, index) => {
        expect(wrapper.text()).toContain(header)
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

      const confirmButton = document.body.querySelector('[data-test-id="confirm-button"]')
      expect(confirmButton).not.toBeNull()
      ;(confirmButton as HTMLElement).click()
      await wrapper.vm.$nextTick()

      for (const input of inputs) {
        expect((input.element as HTMLInputElement).value).toBe('')
      }
    })
  })
})
