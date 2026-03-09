import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalibrationSwingTypeSelector from '@/components/calibrate/CalibrationSwingTypeSelector.vue'

const columnHeaders = ['50%', '100%', '75%']

function mountSelector(props = {}) {
  return mount(CalibrationSwingTypeSelector, {
    props: { columnHeaders, columns: 3, ...props },
  })
}

describe('CalibrationSwingTypeSelector', () => {
  it('renders all column headers', () => {
    const wrapper = mountSelector()

    expect(wrapper.find('[data-test-id="swing-select-0"]').text()).toBe('50%')
    expect(wrapper.find('[data-test-id="swing-select-1"]').text()).toBe('100%')
    expect(wrapper.find('[data-test-id="swing-select-2"]').text()).toBe('75%')
  })

  it('all swing types are active by default', () => {
    const wrapper = mountSelector()

    for (let i = 0; i < 3; i++) {
      expect(wrapper.find(`[data-test-id="swing-select-${i}"]`).classes()).toContain('tile-active')
    }
  })

  it('"All" tile is active when all selected', () => {
    const wrapper = mountSelector()

    expect(wrapper.find('[data-test-id="swing-select-all"]').classes()).toContain('tile-active')
  })

  it('toggling a swing type deselects it', async () => {
    const wrapper = mountSelector()

    await wrapper.find('[data-test-id="swing-select-1"]').trigger('click')

    expect(wrapper.find('[data-test-id="swing-select-1"]').classes()).toContain('tile')
    expect(wrapper.find('[data-test-id="swing-select-1"]').classes()).not.toContain('tile-active')
  })

  it('toggling "All" when all selected keeps at least one', async () => {
    const wrapper = mountSelector()

    await wrapper.find('[data-test-id="swing-select-all"]').trigger('click')

    expect(wrapper.find('[data-test-id="swing-select-0"]').classes()).toContain('tile-active')
    expect(wrapper.find('[data-test-id="swing-select-1"]').classes()).toContain('tile')
    expect(wrapper.find('[data-test-id="swing-select-2"]').classes()).toContain('tile')
  })

  it('toggling "All" when not all selected selects all', async () => {
    const wrapper = mountSelector()

    await wrapper.find('[data-test-id="swing-select-1"]').trigger('click')
    await wrapper.find('[data-test-id="swing-select-all"]').trigger('click')

    for (let i = 0; i < 3; i++) {
      expect(wrapper.find(`[data-test-id="swing-select-${i}"]`).classes()).toContain('tile-active')
    }
  })

  it('minimum 1 swing type must remain selected', async () => {
    const wrapper = mount(CalibrationSwingTypeSelector, {
      props: { columnHeaders: ['50%', '100%'], columns: 2 },
    })

    await wrapper.find('[data-test-id="swing-select-1"]').trigger('click')
    await wrapper.find('[data-test-id="swing-select-0"]').trigger('click')

    expect(wrapper.find('[data-test-id="swing-select-0"]').classes()).toContain('tile-active')
  })

  it('emits sorted indices on Next click', async () => {
    const wrapper = mountSelector()

    await wrapper.find('[data-test-id="swing-select-1"]').trigger('click')
    await wrapper.find('[data-test-id="swing-next-button"]').trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual([[0, 2]])
  })

  it('emits back event', async () => {
    const wrapper = mountSelector()

    await wrapper.find('[data-test-id="swing-back-button"]').trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('respects columns prop to limit displayed headers', () => {
    const wrapper = mount(CalibrationSwingTypeSelector, {
      props: { columnHeaders: ['50%', '100%', '75%', '25%'], columns: 2 },
    })

    expect(wrapper.find('[data-test-id="swing-select-0"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="swing-select-1"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="swing-select-2"]').exists()).toBe(false)
  })
})
