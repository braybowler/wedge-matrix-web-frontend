<script setup lang="ts">
import type { ShotCount } from '@/stores/calibration/calibrationStore.ts'

const shotCounts: ShotCount[] = [5, 10, 15]

const emit = defineEmits<{
  select: [shotCount: ShotCount]
  back: []
}>()
</script>

<template>
  <section>
    <div class="cal-card">
      <h2 class="cal-card-title">How many shots per club, per swing?</h2>
      <p class="cal-card-desc">More shots means a tighter, more reliable average.</p>

      <div class="cal-shot-opts">
        <button
          v-for="count in shotCounts"
          :key="count"
          type="button"
          class="cal-shot-opt"
          :data-test-id="`shot-count-${count}`"
          @click="emit('select', count)"
        >
          <span class="cal-shot-opt-num">{{ count }}</span>
          <span class="cal-shot-opt-label">shots</span>
        </button>
      </div>
    </div>

    <div class="cal-footer">
      <button
        type="button"
        class="cal-btn cal-btn-back"
        data-test-id="shot-count-back-button"
        @click="emit('back')"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>
    </div>
  </section>
</template>
