<script setup lang="ts">
import { CLUB_LABELS, type ClubLabel } from '@/types/matrix'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'
import TileSelector from '@/components/shared/TileSelector.vue'

const clubOptions: ClubLabel[] = [...CLUB_LABELS]

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setSelectedClubs } = matrixConfigurationStore
const { selectedClubs } = storeToRefs(matrixConfigurationStore)

const toggleClub = (club: ClubLabel) => {
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
    <TileSelector
      :options="clubOptions"
      :model-value="selectedClubs"
      test-id-prefix="club-selector-"
      @update:model-value="toggleClub"
    />
  </section>
</template>

<style scoped>
.section-title {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}
</style>
