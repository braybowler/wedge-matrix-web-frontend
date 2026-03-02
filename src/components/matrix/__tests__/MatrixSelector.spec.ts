import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import MatrixSelector from '@/components/matrix/MatrixSelector.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useUserStore } from '@/stores/user/userStore.ts'
import type { WedgeMatrix } from '@/types/matrix'
import type { User } from '@/types/user'

const mockUseAxiosComposable = vi.hoisted(() => ({
  post: vi.fn().mockResolvedValue({}),
  get: vi.fn().mockResolvedValue({}),
  getBlob: vi.fn().mockResolvedValue({}),
  put: vi.fn().mockResolvedValue({}),
  patch: vi.fn().mockResolvedValue({}),
  del: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => mockUseAxiosComposable,
}))

const buildMatrix = (overrides: Partial<WedgeMatrix> = {}): WedgeMatrix => ({
  id: 1,
  user_id: 1,
  label: null,
  number_of_rows: 4,
  number_of_columns: 4,
  column_headers: ['100%', '75%', '50%', '25%'],
  selected_row_display_option: 'Carry',
  yardage_values: [],
  ...overrides,
})

const buildUser = (matrices: WedgeMatrix[]): User => ({
  id: 1,
  email: 'test@example.com',
  email_verified_at: null,
  has_dismissed_tutorial: false,
  wedge_matrices: matrices,
})

function setupStores(matrices: WedgeMatrix[]) {
  const userStore = useUserStore()
  userStore.initializeUserStoreValues(buildUser(matrices), 'test-token')
  const matrixStore = useMatrixConfigurationStore()
  matrixStore.initializeMatrixValues(matrices)
  return { userStore, matrixStore }
}

describe('MatrixSelector', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    mockUseAxiosComposable.post.mockReset().mockResolvedValue({})
    mockUseAxiosComposable.put.mockReset().mockResolvedValue({})
    mockUseAxiosComposable.del.mockReset().mockResolvedValue({})
  })

  it('renders dropdown with all matrices from user store', () => {
    const matrices = [
      buildMatrix({ id: 1, label: 'First' }),
      buildMatrix({ id: 2, label: 'Second' }),
    ]
    setupStores(matrices)

    const wrapper = mount(MatrixSelector, { attachTo: document.body })
    const options = wrapper.findAll('option')

    expect(options).toHaveLength(2)
    expect(options[0]!.text()).toBe('First')
    expect(options[1]!.text()).toBe('Second')
  })

  it('displays fallback label for matrices with null label', () => {
    const matrices = [buildMatrix({ id: 5, label: null })]
    setupStores(matrices)

    const wrapper = mount(MatrixSelector, { attachTo: document.body })
    const options = wrapper.findAll('option')

    expect(options[0]!.text()).toBe('Matrix 1')
  })

  it('has current matrix selected by default', () => {
    const matrices = [
      buildMatrix({ id: 1, label: 'First' }),
      buildMatrix({ id: 2, label: 'Second' }),
    ]
    setupStores(matrices)

    const wrapper = mount(MatrixSelector, { attachTo: document.body })
    const select = wrapper.find('[data-test-id="matrix-dropdown"]')

    expect((select.element as HTMLSelectElement).value).toBe('1')
  })

  it('changing dropdown calls switchMatrix', async () => {
    const matrices = [
      buildMatrix({ id: 1, label: 'First' }),
      buildMatrix({ id: 2, label: 'Second' }),
    ]
    const { matrixStore } = setupStores(matrices)
    const switchSpy = vi.spyOn(matrixStore, 'switchMatrix').mockResolvedValue()

    const wrapper = mount(MatrixSelector, { attachTo: document.body })
    const select = wrapper.find('[data-test-id="matrix-dropdown"]')
    await select.setValue('2')

    expect(switchSpy).toHaveBeenCalledWith(2, expect.any(Array))
  })

  it('create button calls createMatrix and updates user store', async () => {
    const matrices = [buildMatrix({ id: 1, label: 'First' })]
    const { matrixStore, userStore } = setupStores(matrices)
    const newMatrix = buildMatrix({ id: 99, label: 'Matrix 2' })
    vi.spyOn(matrixStore, 'createMatrix').mockResolvedValue(newMatrix)
    vi.spyOn(matrixStore, 'switchMatrix').mockResolvedValue()

    const wrapper = mount(MatrixSelector, { attachTo: document.body })
    await wrapper.find('[data-test-id="create-matrix-button"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(matrixStore.createMatrix).toHaveBeenCalledWith('Matrix 2')
    expect(userStore.user!.wedge_matrices).toHaveLength(2)
  })

  it('delete button is disabled when only 1 matrix exists', () => {
    const matrices = [buildMatrix({ id: 1, label: 'First' })]
    setupStores(matrices)

    const wrapper = mount(MatrixSelector, { attachTo: document.body })
    const deleteBtn = wrapper.find('[data-test-id="delete-matrix-button"]')

    expect((deleteBtn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('delete button opens confirmation modal when multiple matrices exist', async () => {
    const matrices = [
      buildMatrix({ id: 1, label: 'First' }),
      buildMatrix({ id: 2, label: 'Second' }),
    ]
    setupStores(matrices)

    const wrapper = mount(MatrixSelector, {
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    })
    const deleteBtn = wrapper.find('[data-test-id="delete-matrix-button"]')

    expect((deleteBtn.element as HTMLButtonElement).disabled).toBe(false)
    await deleteBtn.trigger('click')

    expect(wrapper.find('[data-test-id="modal-overlay"]').exists()).toBe(true)
  })

  it('confirming delete calls deleteMatrix and switches to remaining matrix', async () => {
    const matrices = [
      buildMatrix({ id: 1, label: 'First' }),
      buildMatrix({ id: 2, label: 'Second' }),
    ]
    const { matrixStore } = setupStores(matrices)
    vi.spyOn(matrixStore, 'deleteMatrix').mockResolvedValue(true)
    vi.spyOn(matrixStore, 'switchMatrix').mockResolvedValue()

    const wrapper = mount(MatrixSelector, {
      attachTo: document.body,
      global: { stubs: { teleport: true } },
    })
    await wrapper.find('[data-test-id="delete-matrix-button"]').trigger('click')
    await wrapper.find('[data-test-id="confirm-button"]').trigger('click')
    await flushPromises()

    expect(matrixStore.deleteMatrix).toHaveBeenCalledWith(1)
  })

  it('rename button shows inline input', async () => {
    const matrices = [buildMatrix({ id: 1, label: 'First' })]
    setupStores(matrices)

    const wrapper = mount(MatrixSelector, { attachTo: document.body })
    await wrapper.find('[data-test-id="rename-matrix-button"]').trigger('click')

    expect(wrapper.find('[data-test-id="rename-row"]').exists()).toBe(true)
    expect((wrapper.find('[data-test-id="rename-input"]').element as HTMLInputElement).value).toBe(
      'First',
    )
  })

  it('confirming rename calls renameMatrix', async () => {
    const matrices = [buildMatrix({ id: 1, label: 'First' })]
    const { matrixStore } = setupStores(matrices)
    vi.spyOn(matrixStore, 'renameMatrix').mockResolvedValue(true)

    const wrapper = mount(MatrixSelector, { attachTo: document.body })
    await wrapper.find('[data-test-id="rename-matrix-button"]').trigger('click')

    const input = wrapper.find('[data-test-id="rename-input"]')
    await input.setValue('Renamed')
    await wrapper.find('[data-test-id="rename-save"]').trigger('click')

    expect(matrixStore.renameMatrix).toHaveBeenCalledWith(1, 'Renamed')
  })

  it('cancel rename hides the inline input', async () => {
    const matrices = [buildMatrix({ id: 1, label: 'First' })]
    setupStores(matrices)

    const wrapper = mount(MatrixSelector, { attachTo: document.body })
    await wrapper.find('[data-test-id="rename-matrix-button"]').trigger('click')
    expect(wrapper.find('[data-test-id="rename-row"]').exists()).toBe(true)

    await wrapper.find('[data-test-id="rename-cancel"]').trigger('click')
    expect(wrapper.find('[data-test-id="rename-row"]').exists()).toBe(false)
  })

  it('hides action buttons when readonly is true', () => {
    const matrices = [
      buildMatrix({ id: 1, label: 'First' }),
      buildMatrix({ id: 2, label: 'Second' }),
    ]
    setupStores(matrices)

    const wrapper = mount(MatrixSelector, {
      attachTo: document.body,
      props: { readonly: true },
    })

    expect(wrapper.find('[data-test-id="matrix-dropdown"]').exists()).toBe(true)
    expect(wrapper.find('[data-test-id="create-matrix-button"]').exists()).toBe(false)
    expect(wrapper.find('[data-test-id="rename-matrix-button"]').exists()).toBe(false)
    expect(wrapper.find('[data-test-id="delete-matrix-button"]').exists()).toBe(false)
  })
})
