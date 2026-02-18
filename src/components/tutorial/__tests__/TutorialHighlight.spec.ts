import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TutorialHighlight from '@/components/tutorial/TutorialHighlight.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('TutorialHighlight Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders slot content when not visible', () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: false, message: 'Test message' },
        slots: { default: '<div data-test-id="slot-content">Slot</div>' },
      })

      expect(wrapper.find('[data-test-id="slot-content"]').exists()).toBe(true)
    })

    it('renders slot content when visible', () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: true, message: 'Test message' },
        slots: { default: '<div data-test-id="slot-content">Slot</div>' },
      })

      expect(wrapper.find('[data-test-id="slot-content"]').exists()).toBe(true)
    })

    it('does not show tooltip when not visible', () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: false, message: 'Test message' },
        slots: { default: '<div>Slot</div>' },
      })

      expect(wrapper.find('.tooltip').exists()).toBe(false)
    })

    it('shows tooltip with correct message when visible', () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: true, message: 'Select your clubs' },
        slots: { default: '<div>Slot</div>' },
      })

      expect(wrapper.find('.tooltip').exists()).toBe(true)
      expect(wrapper.find('.tooltip-message').text()).toBe('Select your clubs')
    })

    it('uses default button label of "Got it"', () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: true, message: 'Test message' },
        slots: { default: '<div>Slot</div>' },
      })

      expect(wrapper.find('[data-test-id="tutorial-got-it-button"]').text()).toBe('Got it')
    })

    it('uses custom button label when provided', () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: true, message: 'Test message', buttonLabel: 'Next' },
        slots: { default: '<div>Slot</div>' },
      })

      expect(wrapper.find('[data-test-id="tutorial-got-it-button"]').text()).toBe('Next')
    })

    it('applies active class to anchor when visible', () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: true, message: 'Test message' },
        slots: { default: '<div>Slot</div>' },
      })

      expect(wrapper.find('.tutorial-anchor').classes()).toContain('active')
    })

    it('does not apply active class when not visible', () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: false, message: 'Test message' },
        slots: { default: '<div>Slot</div>' },
      })

      expect(wrapper.find('.tutorial-anchor').classes()).not.toContain('active')
    })

    it('applies tooltip-below class by default', () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: true, message: 'Test message' },
        slots: { default: '<div>Slot</div>' },
      })

      expect(wrapper.find('.tooltip').classes()).toContain('tooltip-below')
    })

    it('applies tooltip-above class when tooltipPosition is above', () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: true, message: 'Test message', tooltipPosition: 'above' as const },
        slots: { default: '<div>Slot</div>' },
      })

      expect(wrapper.find('.tooltip').classes()).toContain('tooltip-above')
    })
  })

  describe('User Input', () => {
    it('emits dismiss when button is clicked', async () => {
      const wrapper = mount(TutorialHighlight, {
        props: { visible: true, message: 'Test message' },
        slots: { default: '<div>Slot</div>' },
      })

      await wrapper.find('[data-test-id="tutorial-got-it-button"]').trigger('click')

      expect(wrapper.emitted('dismiss')).toHaveLength(1)
    })
  })
})
