<script setup lang="ts">
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setMatrixColumnHeader } = matrixConfigurationStore
const { matrixColumns, matrixColumnHeaders } = storeToRefs(matrixConfigurationStore)
</script>

<template>
  <section class="component-container">
    <h2 class="section-title">Column Header Labels</h2>

    <section class="input-container">
      <div
        v-for="(column, index) in matrixColumns"
        :key="column"
        class="column-label-selector-pair"
        data-test-id="column-label-selector-pair"
      >
        <label class="column-header-selector-label" for="column-header-selector"
          >Column {{ column }}:
        </label>

        <select
          class="column-header-selector"
          name="column-header-selector"
          id="column-headers"
          :value="matrixColumnHeaders[index]"
          @change="setMatrixColumnHeader(($event.target as HTMLSelectElement).value, index)"
          data-test-id="column-header-selector"
        >
          <option value="25%">25%</option>
          <option value="33%">33%</option>
          <option value="50%">50%</option>
          <option value="66%">66%</option>
          <option value="75%">75%</option>
          <option value="90%">90%</option>
          <option value="100%">100%</option>
        </select>
      </div>
    </section>
  </section>
</template>

<style scoped>
.component-container {
  padding: 8px;
  min-height: 225px;
}

.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}

.input-container {
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  gap: 12px;
}

.column-label-selector-pair {
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.column-header-selector-label {
  color: #f3f4f6;
  font-size: 14px;
  font-weight: 500;
}

.column-header-selector {
  color: #f3f4f6;
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 4px 8px;
}
</style>
