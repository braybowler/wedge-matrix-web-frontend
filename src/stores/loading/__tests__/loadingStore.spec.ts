import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLoadingStore } from '@/stores/loading/loadingStore.ts'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useLoadingStore', () => {
  it('starts with isLoading as false', () => {
    const store = useLoadingStore()
    expect(store.isLoading).toBe(false)
  })

  it('sets isLoading to true after startLoading', () => {
    const store = useLoadingStore()
    store.startLoading()
    expect(store.isLoading).toBe(true)
  })

  it('sets isLoading back to false after matching stopLoading', () => {
    const store = useLoadingStore()
    store.startLoading()
    store.stopLoading()
    expect(store.isLoading).toBe(false)
  })

  it('requires equal stopLoading calls for multiple startLoading calls', () => {
    const store = useLoadingStore()
    store.startLoading()
    store.startLoading()
    store.startLoading()

    store.stopLoading()
    expect(store.isLoading).toBe(true)

    store.stopLoading()
    expect(store.isLoading).toBe(true)

    store.stopLoading()
    expect(store.isLoading).toBe(false)
  })

  it('does not decrement below zero', () => {
    const store = useLoadingStore()
    store.stopLoading()
    store.stopLoading()
    expect(store.isLoading).toBe(false)

    store.startLoading()
    expect(store.isLoading).toBe(true)

    store.stopLoading()
    expect(store.isLoading).toBe(false)
  })
})
