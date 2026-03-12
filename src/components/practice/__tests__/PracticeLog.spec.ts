import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PracticeLog from '@/components/practice/PracticeLog.vue'
import type { PracticeSessionRecord } from '@/types/practice'

describe('PracticeLog Component', () => {
  const defaultSession: PracticeSessionRecord = {
    id: 1,
    user_id: 1,
    wedge_matrix_id: 10,
    shot_count: 5,
    shots: [{ shot_number: 1, target_yards: 50, actual_carry: 48, difference: 2 }],
    average_difference: 2,
    created_at: '2026-03-12T10:00:00Z',
  }

  it('shows empty state when no sessions', () => {
    const wrapper = mount(PracticeLog, {
      props: { sessions: [], error: null },
    })

    expect(wrapper.find('[data-test-id="practice-log-empty"]').exists()).toBe(true)
  })

  it('renders session items when sessions exist', () => {
    const wrapper = mount(PracticeLog, {
      props: { sessions: [defaultSession], error: null },
    })

    expect(wrapper.find('[data-test-id="practice-log-item"]').exists()).toBe(true)
  })

  it('shows error message and retry button on error', () => {
    const wrapper = mount(PracticeLog, {
      props: { sessions: [], error: 'Network error' },
    })

    expect(wrapper.text()).toContain('Network error')
    expect(wrapper.find('[data-test-id="retry-practice-log-button"]').exists()).toBe(true)
  })

  it('emits retry when retry button is clicked', async () => {
    const wrapper = mount(PracticeLog, {
      props: { sessions: [], error: 'Network error' },
    })

    await wrapper.find('[data-test-id="retry-practice-log-button"]').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
