import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AllowableMatrixColumnNumber, UserColumnHeader } from '@/types/matrix'
export const useMatrixConfigurationStore = defineStore('matrixConfiguration', () => {
  const matrixColumns = ref<AllowableMatrixColumnNumber>(3)
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
  ])

  return {
    matrixColumns,
    matrixColumnHeaders,
  }
})
