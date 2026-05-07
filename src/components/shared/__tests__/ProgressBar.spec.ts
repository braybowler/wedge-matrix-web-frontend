import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressBar from '@/components/shared/ProgressBar.vue'

describe('ProgressBar Component', () => {
  describe('Step unit (default)', () => {
    const defaultProps = { current: 2, total: 8, percent: 25 }

    it('renders step label with correct text', () => {
      const wrapper = mount(ProgressBar, { props: defaultProps })

      expect(wrapper.find('[data-test-id="progress-label"]').text()).toBe('Step 2 of 8')
    })

    it('sets progress bar fill width based on percent', () => {
      const wrapper = mount(ProgressBar, { props: defaultProps })

      expect(wrapper.find('[data-test-id="progress-bar-fill"]').attributes('style')).toContain(
        'width: 25%',
      )
    })

    it('shows 0% fill when percent is 0', () => {
      const wrapper = mount(ProgressBar, { props: { ...defaultProps, percent: 0 } })

      expect(wrapper.find('[data-test-id="progress-bar-fill"]').attributes('style')).toContain(
        'width: 0%',
      )
    })

    it('shows 100% fill when percent is 100', () => {
      const wrapper = mount(ProgressBar, { props: { ...defaultProps, percent: 100 } })

      expect(wrapper.find('[data-test-id="progress-bar-fill"]').attributes('style')).toContain(
        'width: 100%',
      )
    })
  })

  describe('Shot unit', () => {
    const shotProps = { current: 3, total: 10, percent: 20, unit: 'Shot' }

    it('renders shot label with correct text', () => {
      const wrapper = mount(ProgressBar, { props: shotProps })

      expect(wrapper.find('[data-test-id="progress-label"]').text()).toBe('Shot 3 of 10')
    })

    it('sets progress bar fill width based on percent', () => {
      const wrapper = mount(ProgressBar, { props: shotProps })

      expect(wrapper.find('[data-test-id="progress-bar-fill"]').attributes('style')).toContain(
        'width: 20%',
      )
    })
  })
})
