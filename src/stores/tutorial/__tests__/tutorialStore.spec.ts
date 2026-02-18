import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useTutorialStore', () => {
  it('starts with tutorialStep as null', () => {
    const store = useTutorialStore()
    expect(store.tutorialStep).toBeNull()
  })

  it('sets tutorialStep to 1 after startTutorial', () => {
    const store = useTutorialStore()
    store.startTutorial()
    expect(store.tutorialStep).toBe(1)
  })

  it('increments tutorialStep after nextStep', () => {
    const store = useTutorialStore()
    store.startTutorial()
    store.nextStep()
    expect(store.tutorialStep).toBe(2)
  })

  it('increments through multiple steps', () => {
    const store = useTutorialStore()
    store.startTutorial()
    store.nextStep()
    store.nextStep()
    store.nextStep()
    expect(store.tutorialStep).toBe(4)
  })

  it('does not increment when tutorialStep is null', () => {
    const store = useTutorialStore()
    store.nextStep()
    expect(store.tutorialStep).toBeNull()
  })

  it('resets tutorialStep to null after endTutorial', () => {
    const store = useTutorialStore()
    store.startTutorial()
    store.nextStep()
    store.endTutorial()
    expect(store.tutorialStep).toBeNull()
  })
})
