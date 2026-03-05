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
        :class="matrixColumns === selector ? 'tile-active' : 'tile'"
        @click="setNumberOfMatrixColumns(selector)"
        :data-test-id="'column-count-' + selector"
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

@media (max-width: 480px) {
  .selector-section {
    margin-top: 4px;
  }
}
</style>
