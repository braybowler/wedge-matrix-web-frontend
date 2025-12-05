import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WedgeMatrix, { type WedgeMatrixProps } from '@/components/matrix/WedgeMatrix.vue'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { RowDisplayOption } from '@/types/matrix'

const defaultMountProps: WedgeMatrixProps = {
  clubs: [
    {
      label: 'LW',
      id: 1,
    },
    {
      label: 'SW',
      id: 2,
    },
    {
      label: 'GW',
      id: 3,
    },
    {
      label: 'PW',
      id: 4,
    },
  ],
}

describe('WedgeMatrix Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Matrix Rendering', () => {
    it('renders', () => {
      const wrapper = mount(WedgeMatrix, {
        props: defaultMountProps,
      })

      expect(wrapper.exists()).toBeTruthy()
    })

    it('displays correct clubs (matrix rows)', () => {
      const wrapper = mount(WedgeMatrix, {
        props: defaultMountProps,
      })

      defaultMountProps.clubs.forEach((club) => {
        expect(wrapper.text()).toContain(club.label)
      })
    })

    it('displays correct column headers (matrix columns)', () => {
      const matrixConfigurationStore = useMatrixConfigurationStore()
      const { matrixColumnHeaders } = storeToRefs(matrixConfigurationStore)
      matrixColumnHeaders.value = [
        {
          label: 'Test 1',
          id: 1,
        },
        {
          label: 'Test 2',
          id: 2,
        },
        {
          label: 'Test 3',
          id: 3,
        },
        {
          label: 'Test 4',
          id: 4,
        },
      ]

      const wrapper = mount(WedgeMatrix, {
        props: defaultMountProps,
      })

      matrixColumnHeaders.value.forEach((header) => {
        expect(wrapper.text()).toContain(header.label)
      })
    })

    it.each([
      {
        testDisplayOptionValues: ['Carry', 'Total', 'Both'],
        testRowDisplayOption: 'Carry',
      },
      {
        testDisplayOptionValues: ['Carry', 'Total', 'Both'],
        testRowDisplayOption: 'Total',
      },
    ])(
      'displays correct row display option when selected row option is: $testRowDisplayOption',
      ({ testDisplayOptionValues, testRowDisplayOption }) => {
        const matrixConfigurationStore = useMatrixConfigurationStore()
        const { matrixRowDisplayOptions, selectedRowDisplayOption } =
          storeToRefs(matrixConfigurationStore)
        matrixRowDisplayOptions.value = testDisplayOptionValues as Array<RowDisplayOption>
        selectedRowDisplayOption.value = testRowDisplayOption as RowDisplayOption

        const wrapper = mount(WedgeMatrix, {
          props: defaultMountProps,
        })

        expect(wrapper.text()).toContain(testRowDisplayOption)
      },
    )

    it('displays correct row display option when selected row option is: Both', () => {
      const matrixConfigurationStore = useMatrixConfigurationStore()
      const { matrixRowDisplayOptions, selectedRowDisplayOption } =
        storeToRefs(matrixConfigurationStore)
      matrixRowDisplayOptions.value = ['Carry', 'Total', 'Both']
      selectedRowDisplayOption.value = 'Both'

      const wrapper = mount(WedgeMatrix, {
        props: defaultMountProps,
      })

      expect(wrapper.text()).toContain('Carry')
      expect(wrapper.text()).toContain('Total')
    })
  })

  describe('User Input', () => {
    it('accepts user yardage input', async () => {
      const wrapper = mount(WedgeMatrix, {
        props: defaultMountProps,
      })

      const inputs = wrapper.findAll('[data-test-id="carry-input"]')

      await inputs[0]?.setValue('50')
      await inputs[0]?.trigger('input')

      expect((inputs[0]?.element as HTMLInputElement).value).toBe('50')
    })

    it('clears the matrix values on clear matrix button press', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)

      const wrapper = mount(WedgeMatrix, {
        props: defaultMountProps,
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
