import { beforeEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AccountSettingsModal from '@/components/account/AccountSettingsModal.vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', redirect: '/matrix' },
    { path: '/login', name: 'login', component: { template: '<div />' } },
    { path: '/matrix', name: 'matrix', component: { template: '<div />' } },
  ],
})

describe('AccountSettingsModal Component', () => {
  const defaultProps = {
    visible: true,
  }

  const mountOptions = {
    global: {
      plugins: [router],
      stubs: {
        teleport: true,
      },
    },
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('does not render when visible is false', () => {
    const wrapper = mount(AccountSettingsModal, {
      props: { visible: false },
      ...mountOptions,
    })

    expect(wrapper.find('[data-test-id="account-settings-overlay"]').exists()).toBe(false)
  })

  it('renders title when visible', () => {
    const wrapper = mount(AccountSettingsModal, {
      props: defaultProps,
      ...mountOptions,
    })

    expect(wrapper.find('.modal-title').text()).toBe('Account Settings')
  })

  it('renders delete account button', () => {
    const wrapper = mount(AccountSettingsModal, {
      props: defaultProps,
      ...mountOptions,
    })

    const button = wrapper.find('[data-test-id="delete-account-button"]')

    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Delete Account')
  })

  it('emits close on close button click', async () => {
    const wrapper = mount(AccountSettingsModal, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('[data-test-id="account-settings-close-button"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close on overlay backdrop click', async () => {
    const wrapper = mount(AccountSettingsModal, {
      props: defaultProps,
      ...mountOptions,
    })

    await wrapper.find('[data-test-id="account-settings-overlay"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
