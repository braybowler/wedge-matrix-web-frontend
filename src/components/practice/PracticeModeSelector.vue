<script setup lang="ts">
import type { PracticeMode } from '@/types/practice'

const emit = defineEmits<{
  select: [mode: PracticeMode]
}>()
</script>

<template>
  <section class="component-container">
    <h2 class="section-title">Choose a mode</h2>

    <section class="option-section">
      <div class="tile mode-tile" data-test-id="mode-gauntlet" @click="emit('select', 'gauntlet')">
        <div class="tile-title">Gauntlet</div>
        <div class="tile-desc">Random target distances</div>
      </div>
      <div class="tile mode-tile" data-test-id="mode-drill" @click="emit('select', 'drill')">
        <div class="tile-title">Drill</div>
        <div class="tile-desc">Practice specific combos</div>
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

.mode-tile {
  min-width: 120px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tile-title {
  font-size: 15px;
  font-weight: 600;
}

.tile-desc {
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 480px) {
  .option-section {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>
