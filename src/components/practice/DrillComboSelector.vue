<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DrillCombo } from '@/types/practice'

const props = defineProps<{
  combos: DrillCombo[]
}>()

const emit = defineEmits<{
  'update:selected': [combos: DrillCombo[]]
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

watch(
  selected,
  (next) => {
    const indices = [...next].sort((a, b) => a - b)
    emit(
      'update:selected',
      indices.map((i) => props.combos[i]).filter((c): c is DrillCombo => c !== undefined),
    )
  },
  { immediate: true, deep: true },
)

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
</script>

<template>
  <div class="step-body">
    <h2 class="step-title">Which combos to drill?</h2>
    <p class="step-desc">Pick the club and swing combinations to rotate through.</p>

    <div class="select-all-row">
      <button
        type="button"
        class="all-chip"
        :class="{ 'is-active': allSelected }"
        data-test-id="combo-select-all"
        @click="toggleAll"
      >
        All Clubs and Swings
      </button>
    </div>

    <div class="club-list">
      <div v-for="group in clubGroups" :key="group.clubIndex" class="club-section">
        <span class="club-label">{{ group.clubLabel }}</span>
        <div class="swing-toggles">
          <button
            type="button"
            class="swing"
            :class="{ 'is-active': isClubFullySelected(group) }"
            :data-test-id="`combo-club-${group.clubIndex}`"
            @click="toggleClub(group)"
          >
            All
          </button>
          <button
            v-for="swing in group.swings"
            :key="swing.flatIndex"
            type="button"
            class="swing"
            :class="{ 'is-active': selected.has(swing.flatIndex) }"
            :data-test-id="`combo-select-${swing.flatIndex}`"
            @click="toggle(swing.flatIndex)"
          >
            {{ swing.combo.swingLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-body {
  animation: prcStep 0.28s ease both;
}

.step-title {
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  text-align: center;
  color: #f4f6fb;
}

.step-desc {
  font-size: 15px;
  color: #aab2c5;
  line-height: 1.55;
  margin: 0 0 22px;
  text-align: center;
}

.select-all-row {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.all-chip {
  font-weight: 700;
  font-size: 14.5px;
  padding: 11px 24px;
  border-radius: 11px;
  cursor: pointer;
  border: 1px solid rgba(139, 140, 246, 0.4);
  background: rgba(139, 140, 246, 0.14);
  color: #cdd3e0;
  transition: all 0.14s;
}

.all-chip.is-active {
  background: #8b8cf6;
  border-color: #8b8cf6;
  color: #0a0e1a;
}

.club-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 480px;
  margin: 0 auto;
}

.club-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.club-label {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.01em;
  color: #f4f6fb;
}

.swing-toggles {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.swing {
  min-width: 64px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 14px;
  padding: 11px 16px;
  border-radius: 11px;
  cursor: pointer;
  border: 1px solid rgba(139, 140, 246, 0.3);
  background: rgba(255, 255, 255, 0.03);
  color: #aab2c5;
  transition: all 0.14s;
}

.swing:hover {
  border-color: rgba(255, 255, 255, 0.28);
  color: #f4f6fb;
}

.swing.is-active {
  background: #8b8cf6;
  border-color: #8b8cf6;
  color: #0a0e1a;
}
</style>
