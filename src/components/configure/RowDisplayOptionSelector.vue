<script setup lang="ts">
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'
import type { RowDisplayOption } from '@/types/matrix'
import TileSelector from '@/components/shared/TileSelector.vue'

const rowDisplayOptions: RowDisplayOption[] = ['Carry', 'Total', 'Both']

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setSelectedRowDisplayOption } = matrixConfigurationStore
const { selectedRowDisplayOption } = storeToRefs(matrixConfigurationStore)
</script>

<template>
  <section class="component-container">
    <h2 class="section-title">Row Display Options</h2>
    <TileSelector
      :options="rowDisplayOptions"
      :model-value="selectedRowDisplayOption"
      test-id-prefix="row-display-option-"
      @update:model-value="setSelectedRowDisplayOption"
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
