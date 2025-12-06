import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MatrixView from '@/views/matrix/MatrixView.vue'
import { createPinia, setActivePinia } from 'pinia'
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'
import { ref } from 'vue'

const mockMatrixConfigurationStore = {
  matrixColumns: ref(4),
  matrixColumnHeaders: ref([
    {
      swingPercentage: 25,
      id: 1,
    },
    {
      swingPercentage: 50,
      id: 2,
    },
    {
      swingPercentage: 75,
      id: 3,
    },
    {
      swingPercentage: 100,
      id: 4,
    },
  ])
}

vi.mock('@/stores/matrix/matrixConfigurationStore', () => ({
  useMatrixConfigurationStore: () => mockMatrixConfigurationStore
}))

describe('MatrixView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  describe('Rendering', () => {
    it('renders', () => {
      const wrapper = mount(MatrixView)

      expect(wrapper.exists()).toBeTruthy()
    })

    it('renders the wedge matrix component', () => {
      const wrapper = mount(MatrixView)

      const wedgeMatrixComponent = wrapper.findComponent(WedgeMatrix)

      expect(wedgeMatrixComponent.exists()).toBeTruthy()
    })
  })

  describe('Context Provisioning', () => {
    it('passes correct props from the store to the wedge matrix component', () => {
      const wrapper = mount(MatrixView)

      const wedgeMatrixComponent = wrapper.findComponent(WedgeMatrix)

      expect(wedgeMatrixComponent.props().numColumns).toBe(mockMatrixConfigurationStore.matrixColumns.value)
      expect(wedgeMatrixComponent.props().columnHeaders).toBe(mockMatrixConfigurationStore.matrixColumnHeaders.value)
    })
  })
})
