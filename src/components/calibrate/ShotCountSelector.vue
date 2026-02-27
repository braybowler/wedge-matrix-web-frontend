<script setup lang="ts">
import type { ShotCount } from '@/stores/calibration/calibrationStore.ts'

const shotCounts: ShotCount[] = [5, 10, 15]

const emit = defineEmits<{
  select: [shotCount: ShotCount]
}>()
</script>

<template>
  <section class="component-container">
    <h2 class="section-title">How many shots per club?</h2>

    <section class="option-section">
      <div
        v-for="count in shotCounts"
        :key="count"
        class="option-container"
        :data-test-id="`shot-count-${count}`"
        @click="emit('select', count)"
      >
        <div>{{ count }} Shots</div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
}

.option-section {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-top: 8px;
}

.option-container {
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 8px 16px;
  color: #9ca3af;
}

.option-container:hover {
  background-color: #4b5563;
  border-color: #818cf8;
  border-radius: 8px;
  padding: 8px 16px;
  color: #9ca3af;
  cursor: pointer;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .option-section {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .option-container,
  .option-container:hover {
    padding: 6px 12px;
    width: 100%;
    text-align: center;
  }
}
</style>
