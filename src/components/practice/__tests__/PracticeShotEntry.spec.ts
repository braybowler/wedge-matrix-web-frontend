import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PracticeShotEntry from '@/components/practice/PracticeShotEntry.vue'
import type { PracticeShot } from '@/types/practice'

describe('PracticeShotEntry Component', () => {
  const defaultShot: PracticeShot = {
    shot_number: 1,
    target_yards: 67,
    actual_carry: null,
    difference: null,
  }

  const defaultProps = {
    shot: defaultShot,
    isFirstShot: true,
  }

  it('displays target distance', () => {
    const wrapper = mount(PracticeShotEntry, { props: defaultProps })

    expect(wrapper.find('[data-test-id="practice-target-label"]').text()).toBe('Hit to 67 yards')
  })

  it('hides back button on first shot', () => {
    const wrapper = mount(PracticeShotEntry, { props: defaultProps })

    expect(wrapper.find('[data-test-id="practice-back-button"]').exists()).toBe(false)
  })

  it('shows back button when not first shot', () => {
    const wrapper = mount(PracticeShotEntry, {
      props: { ...defaultProps, isFirstShot: false },
    })

    expect(wrapper.find('[data-test-id="practice-back-button"]').exists()).toBe(true)
  })

  it('emits next when Next is clicked', async () => {
    const wrapper = mount(PracticeShotEntry, { props: defaultProps })

    await wrapper.find('[data-test-id="practice-next-button"]').trigger('click')

    expect(wrapper.emitted('next')).toHaveLength(1)
  })

  it('emits back when Back is clicked', async () => {
    const wrapper = mount(PracticeShotEntry, {
      props: { ...defaultProps, isFirstShot: false },
    })

    await wrapper.find('[data-test-id="practice-back-button"]').trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('emits quit when Quit Practice is clicked', async () => {
    const wrapper = mount(PracticeShotEntry, { props: defaultProps })

    await wrapper.find('[data-test-id="quit-practice-button"]').trigger('click')

    expect(wrapper.emitted('quit')).toHaveLength(1)
  })

  it('shows difference preview when difference is set', () => {
    const shot: PracticeShot = {
      shot_number: 1,
      target_yards: 67,
      actual_carry: 64,
      difference: 3,
    }
    const wrapper = mount(PracticeShotEntry, {
      props: { shot, isFirstShot: true },
    })

    expect(wrapper.find('[data-test-id="practice-diff-preview"]').text()).toBe('3 yards off')
  })

  it('hides difference preview when difference is null', () => {
    const wrapper = mount(PracticeShotEntry, { props: defaultProps })

    expect(wrapper.find('[data-test-id="practice-diff-preview"]').exists()).toBe(false)
  })

  it('emits update-carry on input', async () => {
    const wrapper = mount(PracticeShotEntry, { props: defaultProps })

    const input = wrapper.find('[data-test-id="practice-carry-input"]')
    await input.setValue('65')

    expect(wrapper.emitted('update-carry')).toBeTruthy()
  })
})
