import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingBar from '@/components/loading/LoadingBar.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'

describe('LoadingBar Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('is hidden when not loading', () => {
    const wrapper = mount(LoadingBar)

    expect(wrapper.find('[data-test-id="loading-bar"]').exists()).toBe(false)
  })

  it('is visible when loading', () => {
    const loadingStore = useLoadingStore()
    loadingStore.startLoading()

    const wrapper = mount(LoadingBar)

    expect(wrapper.find('[data-test-id="loading-bar"]').exists()).toBe(true)
  })

  it('hides again when loading finishes', async () => {
    const loadingStore = useLoadingStore()
    loadingStore.startLoading()

    const wrapper = mount(LoadingBar)
    expect(wrapper.find('[data-test-id="loading-bar"]').exists()).toBe(true)

    loadingStore.stopLoading()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test-id="loading-bar"]').exists()).toBe(false)
  })
})
