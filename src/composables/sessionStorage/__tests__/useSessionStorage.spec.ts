import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionStorage } from '@/composables/sessionStorage/useSessionStorage.ts'

const TEST_KEY = 'test_session_key'

type TestSession = { id: number; items: string[] }

const alwaysValid = () => true
const requireItems = (parsed: TestSession) => Array.isArray(parsed.items) && parsed.items.length > 0

describe('useSessionStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('persist', () => {
    it('stores data as JSON in localStorage', () => {
      const { persist } = useSessionStorage<TestSession>(TEST_KEY, alwaysValid)
      const data: TestSession = { id: 10, items: ['a', 'b'] }

      persist(data)

      const stored = localStorage.getItem(TEST_KEY)
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toEqual(data)
    })
  })

  describe('clear', () => {
    it('removes the key from localStorage', () => {
      localStorage.setItem(TEST_KEY, '{"id":10}')

      const { clear } = useSessionStorage<TestSession>(TEST_KEY, alwaysValid)
      clear()

      expect(localStorage.getItem(TEST_KEY)).toBeNull()
    })
  })

  describe('load', () => {
    it('returns null when no data exists', () => {
      const { load } = useSessionStorage<TestSession>(TEST_KEY, alwaysValid)

      expect(load()).toBeNull()
    })

    it('returns parsed data when validator passes', () => {
      const data: TestSession = { id: 10, items: ['a'] }
      localStorage.setItem(TEST_KEY, JSON.stringify(data))

      const { load } = useSessionStorage<TestSession>(TEST_KEY, requireItems)

      expect(load()).toEqual(data)
    })

    it('returns parsed data when no validator is provided', () => {
      const data: TestSession = { id: 10, items: ['a'] }
      localStorage.setItem(TEST_KEY, JSON.stringify(data))

      const { load } = useSessionStorage<TestSession>(TEST_KEY)

      expect(load()).toEqual(data)
    })

    it('returns null and clears storage when validator fails', () => {
      const data: TestSession = { id: 10, items: [] }
      localStorage.setItem(TEST_KEY, JSON.stringify(data))

      const { load } = useSessionStorage<TestSession>(TEST_KEY, requireItems)

      expect(load()).toBeNull()
      expect(localStorage.getItem(TEST_KEY)).toBeNull()
    })

    it('returns null and clears storage on invalid JSON', () => {
      localStorage.setItem(TEST_KEY, '{not valid json}')

      const { load } = useSessionStorage<TestSession>(TEST_KEY, alwaysValid)

      expect(load()).toBeNull()
      expect(localStorage.getItem(TEST_KEY)).toBeNull()
    })
  })
})
