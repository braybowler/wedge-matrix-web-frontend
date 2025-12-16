import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MatrixView from '@/views/matrix/MatrixView.vue'
import { createPinia, setActivePinia } from 'pinia'
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

describe('RegisterView', () => {
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
