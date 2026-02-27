import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalibrationProgress from '@/components/calibrate/CalibrationProgress.vue'

describe('CalibrationProgress Component', () => {
  const defaultProps = {
    currentStep: 2,
    totalSteps: 8,
    percent: 25,
  }

  it('renders step label with correct text', () => {
    const wrapper = mount(CalibrationProgress, { props: defaultProps })

    expect(wrapper.find('[data-test-id="progress-label"]').text()).toBe('Step 2 of 8')
  })

  it('sets progress bar fill width based on percent', () => {
    const wrapper = mount(CalibrationProgress, { props: defaultProps })

    const fill = wrapper.find('[data-test-id="progress-bar-fill"]')
    expect(fill.attributes('style')).toContain('width: 25%')
  })

  it('shows 0% fill when percent is 0', () => {
    const wrapper = mount(CalibrationProgress, {
      props: { ...defaultProps, percent: 0 },
    })

    const fill = wrapper.find('[data-test-id="progress-bar-fill"]')
    expect(fill.attributes('style')).toContain('width: 0%')
  })

  it('shows 100% fill when percent is 100', () => {
    const wrapper = mount(CalibrationProgress, {
      props: { ...defaultProps, percent: 100 },
    })

    const fill = wrapper.find('[data-test-id="progress-bar-fill"]')
    expect(fill.attributes('style')).toContain('width: 100%')
  })
})
