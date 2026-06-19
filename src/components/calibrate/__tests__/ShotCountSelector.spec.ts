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

  it('emits select with 5 when 5 Shots is clicked', async () => {
    const wrapper = mount(ShotCountSelector)

    await wrapper.find('[data-test-id="shot-count-5"]').trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual([5])
  })

  it('emits select with 10 when 10 Shots is clicked', async () => {
    const wrapper = mount(ShotCountSelector)

    await wrapper.find('[data-test-id="shot-count-10"]').trigger('click')

    expect(wrapper.emitted('select')![0]).toEqual([10])
  })

  it('emits select with 15 when 15 Shots is clicked', async () => {
    const wrapper = mount(ShotCountSelector)

    await wrapper.find('[data-test-id="shot-count-15"]').trigger('click')

    expect(wrapper.emitted('select')![0]).toEqual([15])
  })
})
