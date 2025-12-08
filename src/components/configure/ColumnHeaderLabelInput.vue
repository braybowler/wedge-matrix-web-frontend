<script setup lang="ts">
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'

const matrixConfigurationStore = useMatrixConfigurationStore()
const { matrixColumns, matrixColumnHeaders } = storeToRefs(matrixConfigurationStore)
</script>

<template>
  <section class="component-container">
    <h2 class="section-title">Column Header Labels</h2>
    <p class="section-text">Please keep labels to a maximum of 7 characters.</p>

    <section class="input-container">
      <input
        v-for="(column, index) in matrixColumns"
        :key="column"
        type="text"
        :placeholder="`Header for column: ${column}`"
        class="input"
        data-test-id="column-header-input"
        v-model="matrixColumnHeaders[index]!.label"
      />
    </section>
  </section>
</template>

<style scoped>
.component-container {
  padding: 8px;
  min-height: 250px;
}

.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}

.section-text {
  margin-top: 8px;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 300;
}

.input-container {
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  gap: 12px;
}

.input {
  color: #f3f4f6;
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 4px 8px;
}

input:focus {
  color: #f3f4f6;
  background-color: #374151;
  border: 1px solid #818cf8;
  border-radius: 8px;
  padding: 4px 8px;
}

.input:focus::placeholder {
  color: transparent;
}
</style>
