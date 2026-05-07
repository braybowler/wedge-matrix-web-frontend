export function useSessionStorage<T>(key: string, validator?: (parsed: T) => boolean) {
  function load(): T | null {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw) as T

      if (validator && !validator(parsed)) {
        localStorage.removeItem(key)
        return null
      }

      return parsed
    } catch {
      localStorage.removeItem(key)
      return null
    }
  }

  function persist(data: T) {
    localStorage.setItem(key, JSON.stringify(data))
  }

  function clear() {
    localStorage.removeItem(key)
  }

  return { load, persist, clear }
}
