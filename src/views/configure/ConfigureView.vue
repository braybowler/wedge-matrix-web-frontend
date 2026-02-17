<script setup lang="ts">
import ClubSelector from '@/components/configure/ClubSelector.vue'
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
    <ClubSelector />
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
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: #1f2937;
  border-radius: 8px;
}
</style>
