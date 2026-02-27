import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalibrationReview from '@/components/calibrate/CalibrationReview.vue'

describe('CalibrationReview Component', () => {
  const defaultProps = {
    oldValues: [
      [
        { carry_value: 100, total_value: 110 },
        { carry_value: 80, total_value: 90 },
      ],
    ],
    newValues: [
      [
        { carry_value: 105, total_value: 115 },
        { carry_value: 85, total_value: null },
      ],
    ],
    clubs: ['LW'] as ('LW' | 'SW' | 'GW' | 'AW' | 'UW' | 'PW')[],
    columnHeaders: ['50%', '100%'],
    columns: 2,
    displayOption: 'Carry' as const,
  }

  it('renders the review container', () => {
    const wrapper = mount(CalibrationReview, { props: defaultProps })

    expect(wrapper.find('[data-test-id="calibration-review"]').exists()).toBe(true)
  })

  it('renders apply and cancel buttons', () => {
    const wrapper = mount(CalibrationReview, { props: defaultProps })

    expect(wrapper.find('[data-test-id="apply-calibration-button"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="cancel-calibration-button"]').exists()).toBe(true)
  })

  it('emits apply when apply button is clicked', async () => {
    const wrapper = mount(CalibrationReview, { props: defaultProps })

    await wrapper.find('[data-test-id="apply-calibration-button"]').trigger('click')

    expect(wrapper.emitted('apply')).toHaveLength(1)
  })

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(CalibrationReview, { props: defaultProps })

    await wrapper.find('[data-test-id="cancel-calibration-button"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('displays club labels in the table', () => {
    const wrapper = mount(CalibrationReview, { props: defaultProps })

    expect(wrapper.find('.club-cell').text()).toBe('LW')
  })

  it('displays column headers', () => {
    const wrapper = mount(CalibrationReview, { props: defaultProps })

    const headers = wrapper.findAll('.header-cell')
    expect(headers[1]!.text()).toBe('50%')
    expect(headers[2]!.text()).toBe('100%')
  })

  it('shows dash for null values', () => {
    const wrapper = mount(CalibrationReview, {
      props: {
        ...defaultProps,
        newValues: [
          [
            { carry_value: null, total_value: null },
            { carry_value: null, total_value: null },
          ],
        ],
      },
    })

    const newValues = wrapper.findAll('.new-value')
    expect(newValues[0]!.text()).toBe('-')
  })
})
