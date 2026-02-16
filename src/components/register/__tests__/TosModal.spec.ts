import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TosModal from '@/components/register/TosModal.vue'
import { TOS_CONTENT } from '@/components/register/tosContent.ts'

describe('TosModal Component', () => {
  const mountOptions = {
    global: {
      stubs: {
        teleport: true,
      },
    },
  }

  it('does not render when visible is false', () => {
    const wrapper = mount(TosModal, {
      props: { visible: false },
      ...mountOptions,
    })

    expect(wrapper.find('[data-test-id="tos-modal-overlay"]').exists()).toBe(false)
  })

  it('renders title and TOS content when visible is true', () => {
    const wrapper = mount(TosModal, {
      props: { visible: true },
      ...mountOptions,
    })

    expect(wrapper.find('.modal-title').text()).toBe('Terms of Service')
    const headings = wrapper.findAll('.tos-heading')
    expect(headings).toHaveLength(TOS_CONTENT.length)
    expect(headings[0]!.text()).toBe(TOS_CONTENT[0]!.heading)
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = mount(TosModal, {
      props: { visible: true },
      ...mountOptions,
    })

    await wrapper.find('[data-test-id="tos-close-button"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when close icon is clicked', async () => {
    const wrapper = mount(TosModal, {
      props: { visible: true },
      ...mountOptions,
    })

    await wrapper.find('[data-test-id="tos-close-icon"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when overlay backdrop is clicked', async () => {
    const wrapper = mount(TosModal, {
      props: { visible: true },
      ...mountOptions,
    })

    await wrapper.find('[data-test-id="tos-modal-overlay"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
