<script setup lang="ts">
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'
import type { RowDisplayOption } from '@/types/matrix'
import { ref } from 'vue'

const matrixRowDisplayOptions = ref<Array<RowDisplayOption>>(['Carry', 'Total', 'Both'])

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setSelectedRowDisplayOption } = matrixConfigurationStore
const { selectedRowDisplayOption } = storeToRefs(matrixConfigurationStore)
</script>

<template>
  <section class="component-container">
    <h2 class="section-title">Row Display Options</h2>

    <section class="option-section">
      <div
        v-for="option in matrixRowDisplayOptions"
        :key="option"
        :class="selectedRowDisplayOption === option ? 'tile-active' : 'tile'"
        @click="setSelectedRowDisplayOption(option)"
        data-test-id="option"
      >
        <div>{{ option }}</div>
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

.option-section {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-top: 8px;
}

@media (max-width: 480px) {
  .option-section {
    margin-top: 4px;
  }
}
</style>
