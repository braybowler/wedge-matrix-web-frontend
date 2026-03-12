import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PracticeProgress from '@/components/practice/PracticeProgress.vue'

describe('PracticeProgress Component', () => {
  const defaultProps = {
    currentShot: 3,
    totalShots: 10,
    percent: 20,
  }

  it('renders shot label with correct text', () => {
    const wrapper = mount(PracticeProgress, { props: defaultProps })

    expect(wrapper.find('[data-test-id="practice-progress-label"]').text()).toBe('Shot 3 of 10')
  })

  it('sets progress bar fill width based on percent', () => {
    const wrapper = mount(PracticeProgress, { props: defaultProps })

    const fill = wrapper.find('[data-test-id="practice-progress-bar-fill"]')
    expect(fill.attributes('style')).toContain('width: 20%')
  })

  it('shows 0% fill when percent is 0', () => {
    const wrapper = mount(PracticeProgress, {
      props: { ...defaultProps, percent: 0 },
    })

    const fill = wrapper.find('[data-test-id="practice-progress-bar-fill"]')
    expect(fill.attributes('style')).toContain('width: 0%')
  })

  it('shows 100% fill when percent is 100', () => {
    const wrapper = mount(PracticeProgress, {
      props: { ...defaultProps, percent: 100 },
    })

    const fill = wrapper.find('[data-test-id="practice-progress-bar-fill"]')
    expect(fill.attributes('style')).toContain('width: 100%')
  })
})
