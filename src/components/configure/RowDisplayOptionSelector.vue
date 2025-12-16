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
        :class="
          selectedRowDisplayOption === option ? `option-container-active` : `option-container`
        "
        @click="setSelectedRowDisplayOption(option)"
        data-test-id="option"
      >
        <div>{{ option }}</div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.component-container {
  padding: 8px;
}

.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}

.option-section {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-top: 12px;
}

.option-container {
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 8px 16px;
  color: #9ca3af;
}

.option-container:hover {
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 8px 16px;
  color: #9ca3af;
  cursor: pointer;
}

.option-container-active {
  background-color: #818cf8;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 8px 16px;
  color: #f3f4f6;
}

.option-container-active:hover {
  background-color: #818cf8;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 8px 16px;
  color: #f3f4f6;
  cursor: pointer;
}
</style>
