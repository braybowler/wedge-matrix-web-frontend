import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalibrationShotInput from '@/components/calibrate/CalibrationShotInput.vue'

describe('CalibrationShotInput Component', () => {
  const defaultProps = {
    shotIndex: 0,
    carryValue: null as number | null,
    totalValue: null as number | null,
    displayOption: 'Carry' as const,
  }

  it('renders carry input when displayOption is Carry', () => {
    const wrapper = mount(CalibrationShotInput, { props: defaultProps })

    expect(wrapper.find('[data-test-id="shot-carry-input-0"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="shot-total-input-0"]').exists()).toBe(false)
  })

  it('renders total input when displayOption is Total', () => {
    const wrapper = mount(CalibrationShotInput, {
      props: { ...defaultProps, displayOption: 'Total' },
    })

    expect(wrapper.find('[data-test-id="shot-carry-input-0"]').exists()).toBe(false)
    expect(wrapper.find('[data-test-id="shot-total-input-0"]').exists()).toBe(true)
  })

  it('renders both inputs when displayOption is Both', () => {
    const wrapper = mount(CalibrationShotInput, {
      props: { ...defaultProps, displayOption: 'Both' },
    })

    expect(wrapper.find('[data-test-id="shot-carry-input-0"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="shot-total-input-0"]').exists()).toBe(true)
  })

  it('displays correct shot label', () => {
    const wrapper = mount(CalibrationShotInput, {
      props: { ...defaultProps, shotIndex: 2 },
    })

    expect(wrapper.find('.shot-label').text()).toBe('Shot 3')
  })

  it('emits change with correct arguments on carry input change', async () => {
    const wrapper = mount(CalibrationShotInput, { props: defaultProps })

    const input = wrapper.find('[data-test-id="shot-carry-input-0"]')
    await input.trigger('change')

    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('change')![0]).toEqual([0, 'carry_value', ''])
  })

  it('emits change with correct arguments on total input change', async () => {
    const wrapper = mount(CalibrationShotInput, {
      props: { ...defaultProps, displayOption: 'Total' },
    })

    const input = wrapper.find('[data-test-id="shot-total-input-0"]')
    await input.trigger('change')

    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('change')![0]).toEqual([0, 'total_value', ''])
  })

  it('uses correct data-test-id based on shotIndex', () => {
    const wrapper = mount(CalibrationShotInput, {
      props: { ...defaultProps, shotIndex: 3 },
    })

    expect(wrapper.find('[data-test-id="shot-carry-input-3"]').exists()).toBe(true)
  })
})
