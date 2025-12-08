import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  AllowableMatrixColumnNumber,
  RowDisplayOption,
  UserColumnHeader,
} from '@/types/matrix'
export const useMatrixConfigurationStore = defineStore('matrixConfiguration', () => {
  const matrixColumns = ref<AllowableMatrixColumnNumber>(4)
  const matrixColumnHeaders = ref<Array<UserColumnHeader>>([
    {
      label: '25%',
      id: 1,
    },
    {
      label: '50%',
      id: 2,
    },
    {
      label: '75%',
      id: 3,
    },
    {
      label: '100%',
      id: 4,
    },
  ])
  const selectedRowDisplayOption = ref<RowDisplayOption>('Carry')
  const matrixRowDisplayOptions = ref<Array<RowDisplayOption>>(['Carry', 'Total', 'Both'])

  return {
    matrixColumns,
    matrixColumnHeaders,
    matrixRowDisplayOptions,
    selectedRowDisplayOption,
  }
})
