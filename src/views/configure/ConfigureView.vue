<script setup lang="ts">
import SwingPercentageColumnSelector from '@/components/configure/SwingPercentageColumnSelector.vue'
import ColumnHeaderLabelInput from '@/components/configure/ColumnHeaderLabelInput.vue'
import RowDisplayOptionSelector from '@/components/configure/RowDisplayOptionSelector.vue'
import { onUnmounted } from 'vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'

const matrixConfigurationStore = useMatrixConfigurationStore()
const { syncError } = storeToRefs(matrixConfigurationStore)

onUnmounted(async () => {
  await matrixConfigurationStore.synchronizeValues()
})
</script>

<template>
  <main class="configure-container">
    <p v-if="syncError" class="error-message" data-test-id="sync-error-message">
      {{ syncError }}
    </p>
    <SwingPercentageColumnSelector />
    <ColumnHeaderLabelInput />
    <RowDisplayOptionSelector />
  </main>
</template>

<style scoped>
.error-message {
  color: #818cf8;
  font-size: 14px;
  text-align: center;
  margin-bottom: 12px;
}

.configure-container {
  padding: 16px;
  background-color: #1f2937;
  border-radius: 8px;
}
</style>
