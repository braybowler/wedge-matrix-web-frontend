import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingView from '@/views/landing/LandingView.vue'

describe('LandingView', () => {
  const mountComponent = () =>
    mount(LandingView, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    })

  it('renders the hero title', () => {
    const wrapper = mountComponent()

    expect(wrapper.text()).toContain('Wedge Matrix')
  })

  it('renders the tagline', () => {
    const wrapper = mountComponent()

    expect(wrapper.text()).toContain('Dial in your short game')
  })

  it('renders a Get Started link to /register', () => {
    const wrapper = mountComponent()

    const getStartedLink = wrapper.find('[data-test-id="get-started-button"]')

    expect(getStartedLink.exists()).toBe(true)
    expect(getStartedLink.attributes('href')).toBe('/register')
  })

  it('renders a Login link to /login', () => {
    const wrapper = mountComponent()

    const loginLink = wrapper.find('[data-test-id="login-button"]')

    expect(loginLink.exists()).toBe(true)
    expect(loginLink.attributes('href')).toBe('/login')
  })

  it('renders the three feature cards', () => {
    const wrapper = mountComponent()

    expect(wrapper.text()).toContain('Personalized Yardage Chart')
    expect(wrapper.text()).toContain('Built-in Tutorial')
    expect(wrapper.text()).toContain('Calibrate on the Range')
  })

  it('renders the bottom CTA linking to /register', () => {
    const wrapper = mountComponent()

    const createAccountLink = wrapper.find('[data-test-id="create-account-button"]')

    expect(createAccountLink.exists()).toBe(true)
    expect(createAccountLink.attributes('href')).toBe('/register')
  })
})
