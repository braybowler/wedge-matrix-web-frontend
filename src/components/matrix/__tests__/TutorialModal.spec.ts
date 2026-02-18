import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TutorialModal from '@/components/matrix/TutorialModal.vue'

const mountOptions = {
  global: {
    stubs: { Teleport: true },
  },
}

describe('TutorialModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('does not render modal when not visible', () => {
      const wrapper = mount(TutorialModal, {
        props: { visible: false },
        ...mountOptions,
      })

      expect(wrapper.find('[data-test-id="tutorial-modal-overlay"]').exists()).toBe(false)
    })

    it('renders modal when visible', () => {
      const wrapper = mount(TutorialModal, {
        props: { visible: true },
        ...mountOptions,
      })

      expect(wrapper.find('[data-test-id="tutorial-modal-overlay"]').exists()).toBe(true)
    })

    it('displays welcome title', () => {
      const wrapper = mount(TutorialModal, {
        props: { visible: true },
        ...mountOptions,
      })

      expect(wrapper.find('.modal-title').text()).toBe('Welcome to Wedge Matrix!')
    })

    it('displays learn more and close buttons', () => {
      const wrapper = mount(TutorialModal, {
        props: { visible: true },
        ...mountOptions,
      })

      expect(wrapper.find('[data-test-id="tutorial-learn-more-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-test-id="tutorial-dismiss-button"]').exists()).toBe(true)
    })
  })

  describe('User Input', () => {
    it('emits learnMore when Learn More button is clicked', async () => {
      const wrapper = mount(TutorialModal, {
        props: { visible: true },
        ...mountOptions,
      })

      await wrapper.find('[data-test-id="tutorial-learn-more-button"]').trigger('click')

      expect(wrapper.emitted('learnMore')).toHaveLength(1)
    })

    it('emits dismiss when Close is clicked without checkbox', async () => {
      const wrapper = mount(TutorialModal, {
        props: { visible: true },
        ...mountOptions,
      })

      await wrapper.find('[data-test-id="tutorial-dismiss-button"]').trigger('click')

      expect(wrapper.emitted('dismiss')).toHaveLength(1)
      expect(wrapper.emitted('dismissPermanently')).toBeUndefined()
    })

    it('emits dismissPermanently when Close is clicked with checkbox checked', async () => {
      const wrapper = mount(TutorialModal, {
        props: { visible: true },
        ...mountOptions,
      })

      await wrapper.find('.checkbox').setValue(true)
      await wrapper.find('[data-test-id="tutorial-dismiss-button"]').trigger('click')

      expect(wrapper.emitted('dismissPermanently')).toHaveLength(1)
      expect(wrapper.emitted('dismiss')).toBeUndefined()
    })
  })
})
