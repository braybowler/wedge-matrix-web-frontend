<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ClubLabel } from '@/types/matrix'

const props = defineProps<{
  clubs: ClubLabel[]
  displayLabels?: string[]
}>()

const emit = defineEmits<{
  select: [indices: number[]]
}>()

const selected = ref<Set<number>>(new Set(props.clubs.map((_, i) => i)))

const allSelected = computed(() => selected.value.size === props.clubs.length)

function toggleAll() {
  if (allSelected.value) {
    selected.value = new Set([0])
  } else {
    selected.value = new Set(props.clubs.map((_, i) => i))
  }
}

function toggle(index: number) {
  const next = new Set(selected.value)
  if (next.has(index)) {
    if (next.size > 1) {
      next.delete(index)
    }
  } else {
    next.add(index)
  }
  selected.value = next
}

function handleNext() {
  emit(
    'select',
    [...selected.value].sort((a, b) => a - b),
  )
}
</script>

<template>
  <section>
    <div class="cal-card">
      <h2 class="cal-card-title">Which clubs to calibrate?</h2>
      <p class="cal-card-desc">Pick the wedges you'll be hitting in this session.</p>

      <div class="cal-chip-grid">
        <button
          type="button"
          class="cal-chip"
          :class="{ 'is-active': allSelected }"
          data-test-id="club-select-all"
          @click="toggleAll"
        >
          All
        </button>
        <button
          v-for="(club, i) in clubs"
          :key="club"
          type="button"
          class="cal-chip"
          :class="{ 'is-active': selected.has(i) }"
          :data-test-id="`club-select-${i}`"
          @click="toggle(i)"
        >
          {{ displayLabels?.[i] ?? club }}
        </button>
      </div>
    </div>

    <div class="cal-footer">
      <button
        type="button"
        class="cal-btn cal-btn-next"
        data-test-id="club-next-button"
        @click="handleNext"
      >
        Next
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          aria-hidden="true"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  </section>
</template>
