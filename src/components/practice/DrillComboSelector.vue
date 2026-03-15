<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DrillCombo } from '@/types/practice'

const props = defineProps<{
  combos: DrillCombo[]
}>()

const emit = defineEmits<{
  select: [combos: DrillCombo[]]
  back: []
}>()

type ClubGroup = {
  clubLabel: string
  clubIndex: number
  swings: { combo: DrillCombo; flatIndex: number }[]
}

const clubGroups = computed<ClubGroup[]>(() => {
  const map = new Map<number, ClubGroup>()
  props.combos.forEach((combo, i) => {
    let group = map.get(combo.clubIndex)
    if (!group) {
      group = { clubLabel: combo.clubLabel, clubIndex: combo.clubIndex, swings: [] }
      map.set(combo.clubIndex, group)
    }
    group.swings.push({ combo, flatIndex: i })
  })
  return [...map.values()]
})

const selected = ref<Set<number>>(new Set(props.combos.map((_, i) => i)))

const allSelected = computed(() => selected.value.size === props.combos.length)

function toggleAll() {
  if (allSelected.value) {
    selected.value = new Set()
  } else {
    selected.value = new Set(props.combos.map((_, i) => i))
  }
}

function toggle(index: number) {
  const next = new Set(selected.value)
  if (next.has(index)) {
    next.delete(index)
  } else {
    next.add(index)
  }
  selected.value = next
}

function isClubFullySelected(group: ClubGroup): boolean {
  return group.swings.every((s) => selected.value.has(s.flatIndex))
}

function toggleClub(group: ClubGroup) {
  const next = new Set(selected.value)
  if (isClubFullySelected(group)) {
    for (const s of group.swings) next.delete(s.flatIndex)
  } else {
    for (const s of group.swings) next.add(s.flatIndex)
  }
  selected.value = next
}

function handleNext() {
  const indices = [...selected.value].sort((a, b) => a - b)
  emit(
    'select',
    indices.map((i) => props.combos[i]).filter((c): c is DrillCombo => c !== undefined),
  )
}
</script>

<template>
  <section class="component-container">
    <h2 class="section-title">Which combos to drill?</h2>

    <div class="select-all-row">
      <div
        :class="allSelected ? 'tile-active' : 'tile'"
        data-test-id="combo-select-all"
        @click="toggleAll"
      >
        All Clubs and Swings
      </div>
    </div>

    <div class="club-list">
      <div v-for="group in clubGroups" :key="group.clubIndex" class="club-section">
        <span class="club-label">{{ group.clubLabel }}</span>
        <div class="swing-toggles">
          <div
            :class="isClubFullySelected(group) ? 'swing-active' : 'swing'"
            :data-test-id="`combo-club-${group.clubIndex}`"
            @click="toggleClub(group)"
          >
            All
          </div>
          <div
            v-for="swing in group.swings"
            :key="swing.flatIndex"
            :class="selected.has(swing.flatIndex) ? 'swing-active' : 'swing'"
            :data-test-id="`combo-select-${swing.flatIndex}`"
            @click="toggle(swing.flatIndex)"
          >
            {{ swing.combo.swingLabel }}
          </div>
        </div>
      </div>
    </div>

    <div class="button-row">
      <button
        class="button button-secondary"
        data-test-id="combo-back-button"
        @click="emit('back')"
      >
        Back
      </button>
      <button
        class="button button-primary"
        data-test-id="combo-next-button"
        :disabled="selected.size === 0"
        @click="handleNext"
      >
        Next
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

.select-all-row {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.club-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 12px;
}

.club-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.club-label {
  color: #f3f4f6;
  font-size: 15px;
  font-weight: 700;
}

.swing-toggles {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.swing,
.swing-active {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.swing {
  background-color: #374151;
  color: #6b7280;
  border: 1px solid #4b5563;
}

.swing:hover {
  border-color: #818cf8;
  color: #9ca3af;
}

.swing-active {
  background-color: rgba(129, 140, 248, 0.15);
  color: #818cf8;
  border: 1px solid #818cf8;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 12px;
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

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.button-primary {
  background-color: #818cf8;
  color: #f3f4f6;
  border: 1px solid #818cf8;
}

.button-primary:hover:not(:disabled) {
  background-color: #6366f1;
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
</style>
