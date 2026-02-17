<script setup lang="ts">
import type { AllowableMatrixColumnNumber } from '@/types/matrix'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'

const allowMatrixColumnNumbers: Array<AllowableMatrixColumnNumber> = [1, 2, 3, 4]

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setNumberOfMatrixColumns } = matrixConfigurationStore
const { matrixColumns } = storeToRefs(matrixConfigurationStore)
</script>

<template>
  <section>
    <h2 class="section-title">Number of Swing Columns</h2>

    <section class="selector-section">
      <div
        v-for="selector in allowMatrixColumnNumbers"
        :key="selector"
        :class="matrixColumns === selector ? `selector-container-active` : `selector-container`"
        @click="setNumberOfMatrixColumns(selector)"
        data-test-id="selector"
      >
        <div>{{ selector }}</div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}

.selector-section {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-top: 8px;
}

.selector-container {
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 8px 16px;
  color: #9ca3af;
}

.selector-container:hover {
  background-color: #4b5563;
  border-color: #818cf8;
  border-radius: 8px;
  padding: 8px 16px;
  color: #9ca3af;
  cursor: pointer;
  transform: translateY(-1px);
}

.selector-container-active {
  background-color: #818cf8;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 8px 16px;
  color: #f3f4f6;
}

.selector-container-active:hover {
  background-color: #818cf8;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 8px 16px;
  color: #f3f4f6;
  cursor: pointer;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .selector-section {
    margin-top: 4px;
  }

  .selector-container,
  .selector-container:hover,
  .selector-container-active,
  .selector-container-active:hover {
    padding: 6px 12px;
  }
}
</style>
