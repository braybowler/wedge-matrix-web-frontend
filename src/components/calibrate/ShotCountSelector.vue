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
        class="tile"
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

@media (max-width: 480px) {
  .option-section {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>
