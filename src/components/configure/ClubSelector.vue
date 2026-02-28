<script setup lang="ts">
import { CLUB_LABELS } from '@/types/matrix'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setSelectedClubs } = matrixConfigurationStore
const { selectedClubs } = storeToRefs(matrixConfigurationStore)

const toggleClub = (club: (typeof CLUB_LABELS)[number]) => {
  const current = selectedClubs.value
  const index = current.indexOf(club)

  if (index >= 0) {
    if (current.length <= 1) return
    setSelectedClubs(current.filter((c) => c !== club))
  } else {
    setSelectedClubs([...current, club])
  }
}
</script>

<template>
  <section>
    <h2 class="section-title">Clubs</h2>

    <section class="selector-section">
      <div
        v-for="club in CLUB_LABELS"
        :key="club"
        :class="selectedClubs.includes(club) ? 'tile-active' : 'tile'"
        data-test-id="club-selector"
        @click="toggleClub(club)"
      >
        <div>{{ club }}</div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}

.selector-section {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

@media (max-width: 480px) {
  .selector-section {
    margin-top: 4px;
    gap: 6px;
  }
}
</style>
