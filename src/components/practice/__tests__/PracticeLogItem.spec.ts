import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PracticeLogItem from '@/components/practice/PracticeLogItem.vue'
import type { PracticeSessionRecord } from '@/types/practice'

describe('PracticeLogItem Component', () => {
  const defaultSession: PracticeSessionRecord = {
    id: 1,
    user_id: 1,
    wedge_matrix_id: 10,
    mode: 'gauntlet',
    shot_count: 5,
    shots: [
      { shot_number: 1, target_yards: 50, actual_carry: 48, difference: 2 },
      { shot_number: 2, target_yards: 75, actual_carry: 70, difference: 5 },
    ],
    average_difference: 3.5,
    created_at: '2026-03-12T10:00:00Z',
  }

  it('renders session summary', () => {
    const wrapper = mount(PracticeLogItem, {
      props: { session: defaultSession },
    })

    expect(wrapper.text()).toContain('5 shots')
    expect(wrapper.text()).toContain('3.5')
  })

  it('is collapsed by default', () => {
    const wrapper = mount(PracticeLogItem, {
      props: { session: defaultSession },
    })

    expect(wrapper.find('.detail-table').exists()).toBe(false)
  })

  it('expands on click to show shot details', async () => {
    const wrapper = mount(PracticeLogItem, {
      props: { session: defaultSession },
    })

    await wrapper.find('.log-summary').trigger('click')

    expect(wrapper.find('.detail-table').exists()).toBe(true)
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)
  })

  it('emits delete when delete button is clicked', async () => {
    const wrapper = mount(PracticeLogItem, {
      props: { session: defaultSession },
    })

    await wrapper.find('.log-summary').trigger('click')
    await wrapper.find('[data-test-id="delete-practice-session-button"]').trigger('click')

    expect(wrapper.emitted('delete')).toHaveLength(1)
  })
})
