<script setup lang="ts">
import type { AllowableMatrixColumnNumber } from '@/types/matrix'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'
import TileSelector from '@/components/shared/TileSelector.vue'

const columnOptions: AllowableMatrixColumnNumber[] = [1, 2, 3, 4]

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setNumberOfMatrixColumns } = matrixConfigurationStore
const { matrixColumns } = storeToRefs(matrixConfigurationStore)
</script>

<template>
  <section>
    <h2 class="section-title">Number of Swing Columns</h2>
    <TileSelector
      :options="columnOptions"
      :model-value="matrixColumns"
      test-id-prefix="column-count-"
      @update:model-value="setNumberOfMatrixColumns"
    />
  </section>
</template>

<style scoped>
.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}
</style>
