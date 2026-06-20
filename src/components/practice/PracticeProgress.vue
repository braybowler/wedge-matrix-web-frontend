<script setup lang="ts">
defineProps<{
  currentShot: number
  totalShots: number
  percent: number
}>()
</script>

<template>
  <div class="progress-container">
    <span class="progress-label" data-test-id="practice-progress-label">
      Shot {{ currentShot }} of {{ totalShots }}
    </span>
    <div class="progress-track">
      <div
        class="progress-fill"
        data-test-id="practice-progress-bar-fill"
        :style="{ width: percent + '%' }"
      />
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}

.progress-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #828aa0;
  text-align: center;
}

.progress-track {
  background-color: rgba(255, 255, 255, 0.07);
  border-radius: 6px;
  height: 6px;
  overflow: hidden;
}

.progress-fill {
  background-color: #8b8cf6;
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}
</style>
