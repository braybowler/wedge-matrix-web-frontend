<script setup lang="ts">
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'
import { useMatrixConfigurationStore } from '@/stores/matrixConfigurationStore.ts'

const {
  matrixColumns,
  matrixColumnHeaders
} = useMatrixConfigurationStore()

</script>

<template>
  <main>
    <WedgeMatrix
      :num-columns="matrixColumns"
      :column-headers="matrixColumnHeaders"
    />
  </main>
</template>
