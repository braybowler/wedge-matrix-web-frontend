import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  const loadingCount = ref(0)
  const isLoading = computed(() => loadingCount.value > 0)

  function startLoading() {
    loadingCount.value++
  }

  function stopLoading() {
    if (loadingCount.value > 0) {
      loadingCount.value--
    }
  }

  return {
    isLoading,
    startLoading,
    stopLoading,
  }
})
