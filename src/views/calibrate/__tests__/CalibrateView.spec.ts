import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import CalibrateView from '@/views/calibrate/CalibrateView.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { WedgeMatrix } from '@/types/matrix'

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => ({
    put: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
    get: vi.fn(),
    post: vi.fn(),
    del: vi.fn(),
    getBlob: vi.fn(),
  }),
}))

const buildMatrix = (overrides: Partial<WedgeMatrix> = {}): WedgeMatrix => ({
  id: 10,
  user_id: 1,
  label: null,
  number_of_rows: 2,
  number_of_columns: 2,
  column_headers: ['50%', '100%'],
  selected_row_display_option: 'Carry',
  yardage_values: [
    [
      { carry_value: 100, total_value: 110 },
      { carry_value: 80, total_value: 90 },
    ],
    [
      { carry_value: 60, total_value: 70 },
      { carry_value: 40, total_value: 50 },
    ],
  ],
  club_labels: ['LW', 'SW'],
  ...overrides,
})

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', redirect: '/matrix' },
    { path: '/matrix', name: 'matrix', component: { template: '<div />' } },
    { path: '/calibrate', name: 'calibrate', component: { template: '<div />' } },
  ],
})

describe('CalibrateView', () => {
  beforeEach(async () => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
    localStorage.clear()
    const matrixStore = useMatrixConfigurationStore()
    matrixStore.initializeMatrixValues([buildMatrix()])
    await router.push('/calibrate')
    await router.isReady()
  })

  it('renders ShotCountSelector when no session exists', () => {
    const wrapper = mount(CalibrateView, { global: { plugins: [router] } })

    expect(wrapper.find('[data-test-id="shot-count-5"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="shot-count-10"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="shot-count-15"]').exists()).toBe(true)
  })

  it('starts calibration when shot count is selected', async () => {
    const wrapper = mount(CalibrateView, { global: { plugins: [router] } })

    await wrapper.find('[data-test-id="shot-count-5"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test-id="progress-label"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="step-header"]').exists()).toBe(true)
  })

  it('shows progress and shot entry during active session', async () => {
    const wrapper = mount(CalibrateView, { global: { plugins: [router] } })

    await wrapper.find('[data-test-id="shot-count-5"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test-id="progress-label"]').text()).toBe('Step 1 of 4')
    expect(wrapper.find('[data-test-id="step-header"]').text()).toBe('LW @ 50%')
  })

  it('shows review screen when calibration is completed', async () => {
    const wrapper = mount(CalibrateView, { global: { plugins: [router] } })

    await wrapper.find('[data-test-id="shot-count-5"]').trigger('click')
    await flushPromises()

    // Advance through all 4 steps
    for (let i = 0; i < 4; i++) {
      await wrapper.find('[data-test-id="step-next-button"]').trigger('click')
      await flushPromises()
    }

    expect(wrapper.find('[data-test-id="calibration-review"]').exists()).toBe(true)
  })
})
