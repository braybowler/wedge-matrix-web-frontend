<script setup lang="ts">
import SwingPercentageColumnSelector from '@/components/configure/SwingPercentageColumnSelector.vue'
import ColumnHeaderLabelInput from '@/components/configure/ColumnHeaderLabelInput.vue'
import RowDisplayOptionSelector from '@/components/configure/RowDisplayOptionSelector.vue'
import { onUnmounted } from 'vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'

const matrixConfigurationStore = useMatrixConfigurationStore()

onUnmounted(async () => {
  await matrixConfigurationStore.synchronizeValues()
})
</script>

<template>
  <main>
    <SwingPercentageColumnSelector />
    <ColumnHeaderLabelInput />
    <RowDisplayOptionSelector />
  </main>
</template>
