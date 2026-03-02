<script setup lang="ts">
import { computed } from 'vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'
import { SWING_FEEL_SYSTEMS, PERCENTAGE_OPTIONS, CLOCK_OPTIONS } from '@/types/matrix'

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setMatrixColumnHeader, setSwingFeelSystem } = matrixConfigurationStore
const { matrixColumns, matrixColumnHeaders, swingFeelSystem } =
  storeToRefs(matrixConfigurationStore)

const headerOptions = computed(() =>
  swingFeelSystem.value === 'Clock' ? CLOCK_OPTIONS : PERCENTAGE_OPTIONS,
)
</script>

<template>
  <section class="component-container">
    <h2 class="section-title">Column Header Labels</h2>

    <section class="system-selector">
      <div
        v-for="system in SWING_FEEL_SYSTEMS"
        :key="system"
        :class="swingFeelSystem === system ? 'tile-active' : 'tile'"
        @click="setSwingFeelSystem(system)"
        data-test-id="swing-feel-system-option"
      >
        {{ system }}
      </div>
    </section>

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
          <option v-for="opt in headerOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
    </section>
  </section>
</template>

<style scoped>
.component-container {
  min-height: 195px;
}

.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}

.system-selector {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-top: 8px;
}

.input-container {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
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

@media (max-width: 480px) {
  .component-container {
    min-height: auto;
  }

  .system-selector {
    margin-top: 4px;
  }

  .input-container {
    margin-top: 4px;
    gap: 8px;
  }

  .column-label-selector-pair {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>
