<script setup lang="ts">
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import type { UserClub } from '@/types/matrix'

const { matrixColumns, matrixColumnHeaders } = useMatrixConfigurationStore()

const tempWedges: Array<UserClub> = [
  {
    label: 'LW',
    id: 1,
  },
  {
    label: 'SW',
    id: 2,
  },
  {
    label: 'GW',
    id: 3,
  },
  {
    label: 'PW',
    id: 4,
  },
]
</script>

<template>
  <main>
    <WedgeMatrix
      :num-columns="matrixColumns"
      :column-headers="matrixColumnHeaders"
      :clubs="tempWedges"
    />
  </main>
</template>
