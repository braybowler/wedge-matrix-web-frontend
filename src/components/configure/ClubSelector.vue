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
        :class="selectedClubs.includes(club) ? 'selector-container-active' : 'selector-container'"
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
  justify-content: space-evenly;
  margin-top: 8px;
}

.selector-container {
  background-color: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 6px 8px;
  color: #9ca3af;
  font-size: 14px;
}

.selector-container:hover {
  background-color: #4b5563;
  border-color: #818cf8;
  border-radius: 8px;
  padding: 6px 8px;
  color: #9ca3af;
  cursor: pointer;
  transform: translateY(-1px);
}

.selector-container-active {
  background-color: #818cf8;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 6px 8px;
  color: #f3f4f6;
  font-size: 14px;
}

.selector-container-active:hover {
  background-color: #818cf8;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 6px 8px;
  color: #f3f4f6;
  cursor: pointer;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .selector-section {
    margin-top: 4px;
    gap: 6px;
  }

  .selector-container,
  .selector-container:hover,
  .selector-container-active,
  .selector-container-active:hover {
    padding: 6px 8px;
    font-size: 13px;
  }
}
</style>
