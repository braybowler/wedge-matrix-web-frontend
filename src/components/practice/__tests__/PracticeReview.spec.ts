import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PracticeReview from '@/components/practice/PracticeReview.vue'
import type { PracticeShot } from '@/types/practice'

describe('PracticeReview Component', () => {
  const defaultShots: PracticeShot[] = [
    { shot_number: 1, target_yards: 50, actual_carry: 48, difference: 2 },
    { shot_number: 2, target_yards: 75, actual_carry: 70, difference: 5 },
    { shot_number: 3, target_yards: 60, actual_carry: 63, difference: 3 },
  ]

  const defaultProps = {
    shots: defaultShots,
    averageDifference: 3.3,
  }

  it('displays average difference', () => {
    const wrapper = mount(PracticeReview, { props: defaultProps })

    expect(wrapper.find('[data-test-id="practice-avg-diff"]').text()).toContain('3.3 yards')
  })

  it('renders all shots in table', () => {
    const wrapper = mount(PracticeReview, { props: defaultProps })

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(3)
  })

  it('emits save when Save is clicked', async () => {
    const wrapper = mount(PracticeReview, { props: defaultProps })

    await wrapper.find('[data-test-id="save-practice-button"]').trigger('click')

    expect(wrapper.emitted('save')).toHaveLength(1)
  })

  it('emits discard when Discard is clicked', async () => {
    const wrapper = mount(PracticeReview, { props: defaultProps })

    await wrapper.find('[data-test-id="discard-practice-button"]').trigger('click')

    expect(wrapper.emitted('discard')).toHaveLength(1)
  })

  it('shows dash for null actual_carry', () => {
    const shots: PracticeShot[] = [
      { shot_number: 1, target_yards: 50, actual_carry: null, difference: null },
    ]
    const wrapper = mount(PracticeReview, {
      props: { shots, averageDifference: 0 },
    })

    const cells = wrapper.findAll('tbody td')
    expect(cells[2]!.text()).toBe('-')
  })
})
