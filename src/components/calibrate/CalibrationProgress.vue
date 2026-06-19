<script setup lang="ts">
defineProps<{
  currentStep: number
  totalSteps: number
  percent: number
}>()
</script>

<template>
  <div>
    <div class="cal-entry-label" data-test-id="progress-label">
      Step {{ currentStep }} of {{ totalSteps }}
    </div>
    <div class="cal-progress-track">
      <div
        class="cal-progress-fill"
        data-test-id="progress-bar-fill"
        :style="{ width: percent + '%' }"
      />
    </div>
  </div>
</template>
