import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseModal from '@/components/shared/BaseModal.vue'

describe('BaseModal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('does not render when visible is false', () => {
    mount(BaseModal, {
      props: { visible: false, label: 'Test Modal' },
      global: { stubs: { Teleport: true } },
    })

    expect(document.querySelector('.overlay')).toBeNull()
  })

  it('renders when visible is true', () => {
    const wrapper = mount(BaseModal, {
      props: { visible: true, label: 'Test Modal' },
      global: { stubs: { Teleport: true } },
    })

    expect(wrapper.find('.overlay').exists()).toBe(true)
    expect(wrapper.find('.modal').exists()).toBe(true)
  })

  it('sets aria-label on the dialog', () => {
    const wrapper = mount(BaseModal, {
      props: { visible: true, label: 'My Dialog' },
      global: { stubs: { Teleport: true } },
    })

    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.attributes('aria-label')).toBe('My Dialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
  })

  it('sets data-test-id on the overlay when testId is provided', () => {
    const wrapper = mount(BaseModal, {
      props: { visible: true, label: 'Test', testId: 'my-overlay' },
      global: { stubs: { Teleport: true } },
    })

    expect(wrapper.find('[data-test-id="my-overlay"]').exists()).toBe(true)
  })

  it('applies maxWidth style when provided', () => {
    const wrapper = mount(BaseModal, {
      props: { visible: true, label: 'Test', maxWidth: '600px' },
      global: { stubs: { Teleport: true } },
    })

    const modal = wrapper.find('.modal')
    expect(modal.attributes('style')).toContain('max-width: 600px')
  })

  it('does not apply maxWidth style when not provided', () => {
    const wrapper = mount(BaseModal, {
      props: { visible: true, label: 'Test' },
      global: { stubs: { Teleport: true } },
    })

    const modal = wrapper.find('.modal')
    expect(modal.attributes('style')).toBeUndefined()
  })

  it('emits close when overlay is clicked', async () => {
    const wrapper = mount(BaseModal, {
      props: { visible: true, label: 'Test' },
      global: { stubs: { Teleport: true } },
    })

    await wrapper.find('.overlay').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close when modal content is clicked', async () => {
    const wrapper = mount(BaseModal, {
      props: { visible: true, label: 'Test' },
      global: { stubs: { Teleport: true } },
    })

    await wrapper.find('.modal').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('emits close on Escape key', async () => {
    const wrapper = mount(BaseModal, {
      props: { visible: true, label: 'Test' },
      global: { stubs: { Teleport: true } },
    })

    await wrapper.find('.overlay').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('does not emit close on non-Escape keys', async () => {
    const wrapper = mount(BaseModal, {
      props: { visible: true, label: 'Test' },
      global: { stubs: { Teleport: true } },
    })

    await wrapper.find('.overlay').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('renders slot content', () => {
    const wrapper = mount(BaseModal, {
      props: { visible: true, label: 'Test' },
      global: { stubs: { Teleport: true } },
      slots: { default: '<p class="slot-content">Hello</p>' },
    })

    expect(wrapper.find('.slot-content').text()).toBe('Hello')
  })
})
