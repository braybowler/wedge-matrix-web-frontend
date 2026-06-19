<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  columnHeaders: string[]
  columns: number
}>()

const emit = defineEmits<{
  select: [indices: number[]]
  back: []
}>()

const headers = computed(() => props.columnHeaders.slice(0, props.columns))

const selected = ref<Set<number>>(new Set(headers.value.map((_, i) => i)))

const allSelected = computed(() => selected.value.size === headers.value.length)

function toggleAll() {
  if (allSelected.value) {
    selected.value = new Set([0])
  } else {
    selected.value = new Set(headers.value.map((_, i) => i))
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
      <h2 class="cal-card-title">Which swing types to calibrate?</h2>
      <p class="cal-card-desc">Choose the swing lengths to dial in for each club.</p>

      <div class="cal-chip-grid">
        <button
          type="button"
          class="cal-chip"
          :class="{ 'is-active': allSelected }"
          data-test-id="swing-select-all"
          @click="toggleAll"
        >
          All
        </button>
        <button
          v-for="(header, i) in headers"
          :key="i"
          type="button"
          class="cal-chip"
          :class="{ 'is-active': selected.has(i) }"
          :data-test-id="`swing-select-${i}`"
          @click="toggle(i)"
        >
          {{ header || `Col ${i + 1}` }}
        </button>
      </div>
    </div>

    <div class="cal-footer">
      <button
        type="button"
        class="cal-btn cal-btn-back"
        data-test-id="swing-back-button"
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
      <button
        type="button"
        class="cal-btn cal-btn-next"
        data-test-id="swing-next-button"
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
