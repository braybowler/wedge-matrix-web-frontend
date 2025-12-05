import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AllowableMatrixColumnNumber, UserColumnHeader } from '@/types/matrix'
export const useMatrixConfigurationStore = defineStore('matrixConfiguration', () => {
  const matrixColumns = ref<AllowableMatrixColumnNumber>(4)
  const matrixColumnHeaders = ref<Array<UserColumnHeader>>([
    {
      swingPercentage: 25,
      id: 1,
    },
    {
      swingPercentage: 50,
      id: 2,
    },
    {
      swingPercentage: 75,
      id: 3,
    },
    {
      swingPercentage: 100,
      id: 4,
    },
  ])

  return {
    matrixColumns,
    matrixColumnHeaders,
  }
})
