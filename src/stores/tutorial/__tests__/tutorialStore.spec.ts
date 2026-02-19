import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'
import { useUserStore } from '@/stores/user/userStore.ts'

const mockPatch = vi.fn()

vi.mock('@/composables/axios/axios.ts', () => ({
  useAxios: () => ({ patch: mockPatch }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.restoreAllMocks()
  sessionStorage.clear()
})

describe('useTutorialStore', () => {
  describe('tutorial steps', () => {
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

  describe('modal visibility', () => {
    it('is visible when user has not dismissed tutorial', () => {
      const store = useTutorialStore()
      const userStore = useUserStore()
      userStore.user = { id: 1, email: 'test@example.com', has_dismissed_tutorial: false } as never

      expect(store.modalVisible).toBe(true)
    })

    it('is not visible when user has permanently dismissed tutorial', () => {
      const store = useTutorialStore()
      const userStore = useUserStore()
      userStore.user = { id: 1, email: 'test@example.com', has_dismissed_tutorial: true } as never

      expect(store.modalVisible).toBe(false)
    })

    it('is not visible when no user is logged in', () => {
      const store = useTutorialStore()

      expect(store.modalVisible).toBe(false)
    })

    it('is not visible after dismissModal is called', () => {
      const store = useTutorialStore()
      const userStore = useUserStore()
      userStore.user = { id: 1, email: 'test@example.com', has_dismissed_tutorial: false } as never

      store.dismissModal()

      expect(store.modalVisible).toBe(false)
    })

    it('persists session dismissal to sessionStorage', async () => {
      const store = useTutorialStore()

      store.dismissModal()
      await nextTick()

      expect(sessionStorage.getItem('wedge_matrix_tutorial_dismissed')).toBe('true')
    })

    it('is not visible when sessionStorage has dismissal', () => {
      sessionStorage.setItem('wedge_matrix_tutorial_dismissed', 'true')
      setActivePinia(createPinia())
      const store = useTutorialStore()
      const userStore = useUserStore()
      userStore.user = { id: 1, email: 'test@example.com', has_dismissed_tutorial: false } as never

      expect(store.modalVisible).toBe(false)
    })
  })

  describe('dismissModalPermanently', () => {
    it('patches the user and hides the modal on success', async () => {
      const dismissedUser = { id: 1, email: 'test@example.com', has_dismissed_tutorial: true }
      mockPatch.mockResolvedValueOnce({ data: { user: dismissedUser } })

      const store = useTutorialStore()
      const userStore = useUserStore()
      userStore.user = { id: 1, email: 'test@example.com', has_dismissed_tutorial: false } as never

      await store.dismissModalPermanently()

      expect(mockPatch).toHaveBeenCalledWith('/user', { has_dismissed_tutorial: true })
      expect(store.modalVisible).toBe(false)
    })

    it('keeps the modal visible when the API call fails', async () => {
      mockPatch.mockResolvedValueOnce({ error: 'Server error' })

      const store = useTutorialStore()
      const userStore = useUserStore()
      userStore.user = { id: 1, email: 'test@example.com', has_dismissed_tutorial: false } as never

      await store.dismissModalPermanently()

      expect(store.modalVisible).toBe(true)
    })
  })

  describe('finishTutorial', () => {
    it('ends the tutorial and patches the user on success', async () => {
      const dismissedUser = { id: 1, email: 'test@example.com', has_dismissed_tutorial: true }
      mockPatch.mockResolvedValueOnce({ data: { user: dismissedUser } })

      const store = useTutorialStore()
      const userStore = useUserStore()
      userStore.user = { id: 1, email: 'test@example.com', has_dismissed_tutorial: false } as never
      store.startTutorial()

      await store.finishTutorial()

      expect(store.tutorialStep).toBeNull()
      expect(mockPatch).toHaveBeenCalledWith('/user', { has_dismissed_tutorial: true })
    })

    it('keeps the tutorial active when the API call fails', async () => {
      mockPatch.mockResolvedValueOnce({ error: 'Server error' })

      const store = useTutorialStore()
      store.startTutorial()

      await store.finishTutorial()

      expect(store.tutorialStep).toBe(1)
    })
  })
})
