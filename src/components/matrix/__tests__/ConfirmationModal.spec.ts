import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmationModal from '@/components/matrix/ConfirmationModal.vue'

describe('ConfirmationModal Component', () => {
  const defaultProps = {
    visible: true,
    title: 'Clear Matrix',
    message: 'Are you sure you want to clear all records?',
  }

  const mountOptions = {
    global: {
      stubs: {
        teleport: true,
      },
    },
  }

  it('does not render when visible is false', () => {
    const wrapper = mount(ConfirmationModal, {
      props: { ...defaultProps, visible: false },
      ...mountOptions,
    })

    expect(wrapper.find('[data-test-id="modal-overlay"]').exists()).toBe(false)
  })

  it('renders title and message when visible is true', () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps,
      ...mountOptions,
    })

    expect(wrapper.find('.modal-title').text()).toBe('Clear Matrix')
    expect(wrapper.find('.modal-message').text()).toBe(
      'Are you sure you want to clear all records?',
    )
  })

  it('emits confirm when confirm button is clicked', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('[data-test-id="confirm-button"]').trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('[data-test-id="cancel-button"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('emits cancel when overlay backdrop is clicked', async () => {
    const wrapper = mount(ConfirmationModal, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('[data-test-id="modal-overlay"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
