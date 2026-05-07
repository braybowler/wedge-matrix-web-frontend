<script setup lang="ts">
withDefaults(
  defineProps<{
    current: number
    total: number
    percent: number
    unit?: string
  }>(),
  { unit: 'Step' },
)
</script>

<template>
  <div class="progress-container">
    <span class="progress-label" data-test-id="progress-label">
      {{ unit }} {{ current }} of {{ total }}
    </span>
    <div class="progress-track">
      <div
        class="progress-fill"
        data-test-id="progress-bar-fill"
        :style="{ width: percent + '%' }"
      />
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-label {
  color: #9ca3af;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.progress-track {
  background-color: #374151;
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
}

.progress-fill {
  background-color: #818cf8;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
