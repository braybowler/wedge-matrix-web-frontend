import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ClubSelector from '@/components/configure/ClubSelector.vue'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

describe('ClubSelector Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('renders', () => {
      const wrapper = mount(ClubSelector)

      expect(wrapper.exists()).toBeTruthy()
    })

    it('renders all 6 club tiles', () => {
      const wrapper = mount(ClubSelector)

      const selectors = wrapper.findAll('[data-test-id^="club-selector-"]')

      expect(selectors.length).toEqual(6)
    })

    it('has 4 default active clubs', () => {
      const wrapper = mount(ClubSelector)

      const selectors = wrapper.findAll('[data-test-id^="club-selector-"]')
      const active = selectors.filter((s) => s.classes().includes('tile-active'))

      expect(active.length).toEqual(4)
    })
  })

  describe('User Input', () => {
    it('clicking an inactive club adds it', async () => {
      const wrapper = mount(ClubSelector)

      const selectors = wrapper.findAll('[data-test-id^="club-selector-"]')
      // AW is at index 3, inactive by default
      const awTile = selectors[3]!

      expect(awTile.classes()).toContain('tile')

      await awTile.trigger('click')

      expect(awTile.classes()).toContain('tile-active')
    })

    it('clicking an active club removes it', async () => {
      const wrapper = mount(ClubSelector)

      const selectors = wrapper.findAll('[data-test-id^="club-selector-"]')
      // LW is at index 0, active by default
      const lwTile = selectors[0]!

      expect(lwTile.classes()).toContain('tile-active')

      await lwTile.trigger('click')

      expect(lwTile.classes()).toContain('tile')
    })
  })

  describe('Interaction With Store', () => {
    it('active clubs match store state', () => {
      const store = useMatrixConfigurationStore()
      store.setSelectedClubs(['LW', 'PW'])

      const wrapper = mount(ClubSelector)

      const selectors = wrapper.findAll('[data-test-id^="club-selector-"]')
      const active = selectors.filter((s) => s.classes().includes('tile-active'))

      expect(active.length).toEqual(2)
      expect(active[0]!.text()).toBe('LW')
      expect(active[1]!.text()).toBe('PW')
    })

    it('toggling updates the store', async () => {
      const store = useMatrixConfigurationStore()
      const { selectedClubs } = storeToRefs(store)

      const wrapper = mount(ClubSelector)

      const selectors = wrapper.findAll('[data-test-id^="club-selector-"]')
      // Click AW (index 3) to add it
      await selectors[3]!.trigger('click')

      expect(selectedClubs.value).toContain('AW')
    })

    it('cannot deselect the last remaining club', async () => {
      const store = useMatrixConfigurationStore()
      store.setSelectedClubs(['LW'])

      const wrapper = mount(ClubSelector)

      const selectors = wrapper.findAll('[data-test-id^="club-selector-"]')
      const lwTile = selectors[0]!

      await lwTile.trigger('click')

      expect(lwTile.classes()).toContain('tile-active')
      expect(store.selectedClubs).toEqual(['LW'])
    })
  })
})
