<script setup lang="ts">
import type { AllowableMatrixColumnNumber } from '@/types/matrix'

const allowMatrixColumnNumbers: Array<AllowableMatrixColumnNumber> = [1, 2, 3, 4]

</script>

<template>
  <section class="component-container">
    <h2 class="section-title">Number of Swing Columns</h2>

    <section class="selector-section">
      <div
        v-for="selector in allowMatrixColumnNumbers"
        :key="selector"
        class="selector-container"
      >
        <div>{{selector}}</div>
      </div>
    </section>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.component-container {
  padding: 8px;
}

.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}

.selector-section {
  @apply justify-around;
  display: flex;
  flex-direction: row;
  margin-top: 12px;
}

.selector-container {
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 8px 16px;
  color: #9ca3af;
}

.selector-container.active {
  background-color: #818cf8;
  color: #f3f4f6;
}
</style>
