import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ShotCountSelector from '@/components/calibrate/ShotCountSelector.vue'

describe('ShotCountSelector Component', () => {
  it('renders three shot count options', () => {
    const wrapper = mount(ShotCountSelector)

    expect(wrapper.find('[data-test-id="shot-count-5"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="shot-count-10"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="shot-count-15"]').exists()).toBe(true)
  })

  it('displays correct text for each option', () => {
    const wrapper = mount(ShotCountSelector)

    for (const count of [5, 10, 15]) {
      const text = wrapper.find(`[data-test-id="shot-count-${count}"]`).text()
      expect(text).toContain(String(count))
      expect(text.toLowerCase()).toContain('shots')
    }
  })

  it('does not emit select when an option is clicked, only highlights it', async () => {
    const wrapper = mount(ShotCountSelector)

    await wrapper.find('[data-test-id="shot-count-10"]').trigger('click')

    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.find('[data-test-id="shot-count-10"]').classes()).toContain('is-active')
  })

  it('disables Next until an option is selected', async () => {
    const wrapper = mount(ShotCountSelector)

    const next = wrapper.find('[data-test-id="shot-count-next-button"]')
    expect(next.attributes('disabled')).toBeDefined()

    await wrapper.find('[data-test-id="shot-count-5"]').trigger('click')

    expect(next.attributes('disabled')).toBeUndefined()
  })

  it('emits select with the chosen count when Next is clicked', async () => {
    const wrapper = mount(ShotCountSelector)

    await wrapper.find('[data-test-id="shot-count-15"]').trigger('click')
    await wrapper.find('[data-test-id="shot-count-next-button"]').trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual([15])
  })

  it('emits back when Back is clicked', async () => {
    const wrapper = mount(ShotCountSelector)

    await wrapper.find('[data-test-id="shot-count-back-button"]').trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
  })
})
