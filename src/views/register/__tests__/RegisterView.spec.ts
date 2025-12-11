import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MatrixView from '@/views/matrix/MatrixView.vue'
import { createPinia, setActivePinia } from 'pinia'
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'

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
