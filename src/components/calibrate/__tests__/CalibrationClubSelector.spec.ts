import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CalibrationClubSelector from '@/components/calibrate/CalibrationClubSelector.vue'
import type { ClubLabel } from '@/types/matrix'

const clubs: ClubLabel[] = ['LW', 'SW', 'GW']

function mountSelector(props = {}) {
  return mount(CalibrationClubSelector, {
    props: { clubs, ...props },
  })
}

describe('CalibrationClubSelector', () => {
  it('renders all clubs', () => {
    const wrapper = mountSelector()

    expect(wrapper.find('[data-test-id="club-select-0"]').text()).toBe('LW')
    expect(wrapper.find('[data-test-id="club-select-1"]').text()).toBe('SW')
    expect(wrapper.find('[data-test-id="club-select-2"]').text()).toBe('GW')
  })

  it('all clubs are active by default', () => {
    const wrapper = mountSelector()

    for (let i = 0; i < 3; i++) {
      expect(wrapper.find(`[data-test-id="club-select-${i}"]`).classes()).toContain('tile-active')
    }
  })

  it('"All" tile is active when all clubs selected', () => {
    const wrapper = mountSelector()

    expect(wrapper.find('[data-test-id="club-select-all"]').classes()).toContain('tile-active')
  })

  it('toggling a club deselects it', async () => {
    const wrapper = mountSelector()

    await wrapper.find('[data-test-id="club-select-1"]').trigger('click')

    expect(wrapper.find('[data-test-id="club-select-1"]').classes()).toContain('tile')
    expect(wrapper.find('[data-test-id="club-select-1"]').classes()).not.toContain('tile-active')
  })

  it('toggling "All" when all selected keeps at least one', async () => {
    const wrapper = mountSelector()

    await wrapper.find('[data-test-id="club-select-all"]').trigger('click')

    // Should have exactly 1 selected (first club)
    expect(wrapper.find('[data-test-id="club-select-0"]').classes()).toContain('tile-active')
    expect(wrapper.find('[data-test-id="club-select-1"]').classes()).toContain('tile')
    expect(wrapper.find('[data-test-id="club-select-2"]').classes()).toContain('tile')
  })

  it('toggling "All" when not all selected selects all', async () => {
    const wrapper = mountSelector()

    // Deselect one
    await wrapper.find('[data-test-id="club-select-1"]').trigger('click')
    // Click All
    await wrapper.find('[data-test-id="club-select-all"]').trigger('click')

    for (let i = 0; i < 3; i++) {
      expect(wrapper.find(`[data-test-id="club-select-${i}"]`).classes()).toContain('tile-active')
    }
  })

  it('minimum 1 club must remain selected', async () => {
    const twoClubs: ClubLabel[] = ['LW', 'SW']
    const wrapper = mount(CalibrationClubSelector, { props: { clubs: twoClubs } })

    // Deselect SW
    await wrapper.find('[data-test-id="club-select-1"]').trigger('click')
    // Try to deselect LW (last one)
    await wrapper.find('[data-test-id="club-select-0"]').trigger('click')

    expect(wrapper.find('[data-test-id="club-select-0"]').classes()).toContain('tile-active')
  })

  it('emits sorted indices on Next click', async () => {
    const wrapper = mountSelector()

    // Deselect middle club
    await wrapper.find('[data-test-id="club-select-1"]').trigger('click')
    await wrapper.find('[data-test-id="club-next-button"]').trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual([[0, 2]])
  })

  it('uses displayLabels when provided', () => {
    const wrapper = mountSelector({ displayLabels: ['Lob', 'Sand', 'Gap'] })

    expect(wrapper.find('[data-test-id="club-select-0"]').text()).toBe('Lob')
    expect(wrapper.find('[data-test-id="club-select-1"]').text()).toBe('Sand')
    expect(wrapper.find('[data-test-id="club-select-2"]').text()).toBe('Gap')
  })
})
