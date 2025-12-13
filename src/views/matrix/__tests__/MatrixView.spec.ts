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
      label: '25%',
      id: 1,
    },
    {
      label: '50%',
      id: 2,
    },
    {
      label: '75%',
      id: 3,
    },
    {
      label: '100%',
      id: 4,
    },
  ]),
  yardageValues: ref([
    [
      {
        carry_value: 50,
        total_value: 55,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
    ],
    [
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
    ],
    [
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
    ],
    [
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
      {
        carry_value: null,
        total_value: null,
      },
    ],
  ]),
}

vi.mock('@/stores/matrix/matrixConfigurationStore', () => ({
  useMatrixConfigurationStore: () => mockMatrixConfigurationStore,
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
})
