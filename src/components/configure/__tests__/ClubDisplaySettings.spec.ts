import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ClubDisplaySettings from '@/components/configure/ClubDisplaySettings.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  getBlob: vi.fn(),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

describe('ClubDisplaySettings Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('renders', () => {
      const wrapper = mount(ClubDisplaySettings)

      expect(wrapper.exists()).toBeTruthy()
    })

    it('renders both display mode tiles', () => {
      const wrapper = mount(ClubDisplaySettings)

      const titleTile = wrapper.find('[data-test-id="display-mode-title"]')
      const loftTile = wrapper.find('[data-test-id="display-mode-loft"]')

      expect(titleTile.exists()).toBe(true)
      expect(loftTile.exists()).toBe(true)
    })

    it('renders loft inputs for each selected club', () => {
      const store = useMatrixConfigurationStore()
      store.setSelectedClubs(['LW', 'SW', 'GW', 'PW'])

      const wrapper = mount(ClubDisplaySettings)

      expect(wrapper.find('[data-test-id="loft-input-LW"]').exists()).toBe(true)
      expect(wrapper.find('[data-test-id="loft-input-SW"]').exists()).toBe(true)
      expect(wrapper.find('[data-test-id="loft-input-GW"]').exists()).toBe(true)
      expect(wrapper.find('[data-test-id="loft-input-PW"]').exists()).toBe(true)
    })
  })

  describe('User Input', () => {
    it('toggles display mode when a tile is clicked', async () => {
      const store = useMatrixConfigurationStore()
      const wrapper = mount(ClubDisplaySettings)

      expect(store.clubLabelDisplayMode).toBe('title')

      await wrapper.find('[data-test-id="display-mode-loft"]').trigger('click')

      expect(store.clubLabelDisplayMode).toBe('loft')
    })

    it('updates club loft value on input change', async () => {
      const store = useMatrixConfigurationStore()
      const wrapper = mount(ClubDisplaySettings)

      const input = wrapper.find('[data-test-id="loft-input-LW"]')
      await input.setValue('60')
      await input.trigger('change')

      expect(store.clubLofts[0]).toBe(60)
    })

    it('sets loft to null for empty input', async () => {
      const store = useMatrixConfigurationStore()
      store.setClubLoft(0, 56)

      const wrapper = mount(ClubDisplaySettings)

      const input = wrapper.find('[data-test-id="loft-input-LW"]')
      await input.setValue('')
      await input.trigger('change')

      expect(store.clubLofts[0]).toBeNull()
    })
  })

  describe('Interaction With MatrixConfigurationStore', () => {
    it('shows active state on the current display mode tile', () => {
      const store = useMatrixConfigurationStore()
      store.clubLabelDisplayMode = 'title'

      const wrapper = mount(ClubDisplaySettings)

      expect(wrapper.find('[data-test-id="display-mode-title"]').classes()).toContain('tile-active')
      expect(wrapper.find('[data-test-id="display-mode-loft"]').classes()).toContain('tile')
    })

    it('marks requiresSync when display mode changes', async () => {
      const store = useMatrixConfigurationStore()
      store.requiresSync = false

      const wrapper = mount(ClubDisplaySettings)
      await wrapper.find('[data-test-id="display-mode-loft"]').trigger('click')

      expect(store.requiresSync).toBe(true)
    })

    it('marks requiresSync when loft value changes', async () => {
      const store = useMatrixConfigurationStore()
      store.requiresSync = false

      const wrapper = mount(ClubDisplaySettings)
      const input = wrapper.find('[data-test-id="loft-input-LW"]')
      await input.setValue('60')
      await input.trigger('change')

      expect(store.requiresSync).toBe(true)
    })
  })
})
