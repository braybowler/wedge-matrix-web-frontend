<script setup lang="ts">
import { SHOT_COUNTS, type ShotCount } from '@/constants/practice.ts'

const shotCounts = SHOT_COUNTS

const emit = defineEmits<{
  select: [shotCount: ShotCount]
  back: []
}>()
</script>

<template>
  <section class="component-container">
    <h2 class="section-title">How many shots per club per swing type?</h2>

    <section class="option-section">
      <div
        v-for="count in shotCounts"
        :key="count"
        class="tile shot-tile"
        :data-test-id="`shot-count-${count}`"
        @click="emit('select', count)"
      >
        <div>{{ count }} Shots</div>
      </div>
    </section>

    <div class="button-row">
      <button
        class="button button-secondary"
        data-test-id="shot-count-back-button"
        @click="emit('back')"
      >
        Back
      </button>
    </div>
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

.shot-tile {
  min-width: 90px;
  text-align: center;
}

.button-row {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.button {
  border-radius: 8px;
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button-secondary {
  background-color: #374151;
  color: #9ca3af;
  border: 1px solid #4b5563;
}

.button-secondary:hover {
  background-color: #4b5563;
  border-color: #818cf8;
}

@media (max-width: 480px) {
  .option-section {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>
