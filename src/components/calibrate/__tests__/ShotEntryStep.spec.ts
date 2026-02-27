import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ShotEntryStep from '@/components/calibrate/ShotEntryStep.vue'
import CalibrationShotInput from '@/components/calibrate/CalibrationShotInput.vue'

describe('ShotEntryStep Component', () => {
  const defaultProps = {
    clubLabel: 'LW',
    swingLabel: '50%',
    shots: [
      { carry_value: null, total_value: null },
      { carry_value: null, total_value: null },
      { carry_value: null, total_value: null },
    ],
    shotCount: 3,
    displayOption: 'Carry' as const,
    isFirstStep: true,
  }

  it('renders the step header with club and swing label', () => {
    const wrapper = mount(ShotEntryStep, { props: defaultProps })

    expect(wrapper.find('[data-test-id="step-header"]').text()).toBe('LW @ 50%')
  })

  it('renders correct number of CalibrationShotInput components', () => {
    const wrapper = mount(ShotEntryStep, { props: defaultProps })

    const inputs = wrapper.findAllComponents(CalibrationShotInput)
    expect(inputs).toHaveLength(3)
  })

  it('hides back button on first step', () => {
    const wrapper = mount(ShotEntryStep, { props: defaultProps })

    expect(wrapper.find('[data-test-id="step-back-button"]').exists()).toBe(false)
  })

  it('shows back button when not first step', () => {
    const wrapper = mount(ShotEntryStep, {
      props: { ...defaultProps, isFirstStep: false },
    })

    expect(wrapper.find('[data-test-id="step-back-button"]').exists()).toBe(true)
  })

  it('always shows next button', () => {
    const wrapper = mount(ShotEntryStep, { props: defaultProps })

    expect(wrapper.find('[data-test-id="step-next-button"]').exists()).toBe(true)
  })

  it('emits next when next button is clicked', async () => {
    const wrapper = mount(ShotEntryStep, { props: defaultProps })

    await wrapper.find('[data-test-id="step-next-button"]').trigger('click')

    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('emits back when back button is clicked', async () => {
    const wrapper = mount(ShotEntryStep, {
      props: { ...defaultProps, isFirstStep: false },
    })

    await wrapper.find('[data-test-id="step-back-button"]').trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('shows quit button', () => {
    const wrapper = mount(ShotEntryStep, { props: defaultProps })

    expect(wrapper.find('[data-test-id="quit-calibration-button"]').exists()).toBe(true)
  })

  it('emits quit when quit button is clicked', async () => {
    const wrapper = mount(ShotEntryStep, { props: defaultProps })

    await wrapper.find('[data-test-id="quit-calibration-button"]').trigger('click')

    expect(wrapper.emitted('quit')).toHaveLength(1)
  })
})
