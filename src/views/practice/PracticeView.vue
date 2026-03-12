<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePracticeStore } from '@/stores/practice/practiceStore.ts'
import { storeToRefs } from 'pinia'
import PracticeShotCountSelector from '@/components/practice/PracticeShotCountSelector.vue'
import PracticeProgress from '@/components/practice/PracticeProgress.vue'
import PracticeShotEntry from '@/components/practice/PracticeShotEntry.vue'
import PracticeReview from '@/components/practice/PracticeReview.vue'
import PracticeLog from '@/components/practice/PracticeLog.vue'
import ConfirmationModal from '@/components/matrix/ConfirmationModal.vue'
import type { PracticeShotCount } from '@/types/practice'

const practiceStore = usePracticeStore()
const showQuitModal = ref(false)
const showShotCountSelector = ref(false)

const {
  session,
  isActive,
  isComplete,
  totalShots,
  currentShotNumber,
  currentShot,
  progressPercent,
  averageDifference,
  practiceLog,
  logError,
} = storeToRefs(practiceStore)

onMounted(() => {
  if (!session.value) {
    practiceStore.fetchPracticeLog()
  }
})

function handleSelectShotCount(shotCount: PracticeShotCount) {
  practiceStore.startPractice(shotCount)
  showShotCountSelector.value = false
}

function handleQuitConfirm() {
  practiceStore.clearSession()
  showQuitModal.value = false
  practiceStore.fetchPracticeLog()
}

async function handleSave() {
  await practiceStore.saveSession()
}

function handleDiscard() {
  practiceStore.clearSession()
  practiceStore.fetchPracticeLog()
}
</script>

<template>
  <main class="practice-wrapper">
    <div class="practice-container">
      <!-- No active session: show log or shot count selector -->
      <template v-if="!session">
        <PracticeShotCountSelector v-if="showShotCountSelector" @select="handleSelectShotCount" />

        <template v-else>
          <div class="new-session-row">
            <button
              class="button button-primary"
              data-test-id="new-practice-session-button"
              @click="showShotCountSelector = true"
            >
              New Session
            </button>
          </div>

          <PracticeLog
            :sessions="practiceLog"
            :error="logError"
            @delete="practiceStore.deleteSession($event)"
            @retry="practiceStore.fetchPracticeLog()"
          />
        </template>
      </template>

      <!-- Active session — shot entry -->
      <template v-else-if="isActive && currentShot">
        <PracticeProgress
          :current-shot="currentShotNumber"
          :total-shots="totalShots"
          :percent="progressPercent"
        />
        <PracticeShotEntry
          :shot="currentShot"
          :is-first-shot="session.currentShotIndex === 0"
          @update-carry="practiceStore.setActualCarry($event)"
          @next="practiceStore.advanceShot()"
          @back="practiceStore.goBackShot()"
          @quit="showQuitModal = true"
        />
      </template>

      <!-- Completed — review -->
      <PracticeReview
        v-else-if="isComplete && session"
        :shots="session.shots"
        :average-difference="averageDifference"
        @save="handleSave"
        @discard="handleDiscard"
      />
    </div>

    <ConfirmationModal
      :visible="showQuitModal"
      title="Quit Practice"
      message="Are you sure you want to quit? All practice progress will be lost."
      @confirm="handleQuitConfirm"
      @cancel="showQuitModal = false"
    />
  </main>
</template>

<style scoped>
.practice-wrapper {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.practice-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: #1f2937;
  border-radius: 8px;
}

.new-session-row {
  display: flex;
  justify-content: center;
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

.button-primary {
  background-color: #818cf8;
  color: #f3f4f6;
  border: 1px solid #818cf8;
}

.button-primary:hover {
  background-color: #6366f1;
}

@media (max-width: 480px) {
  .practice-container {
    gap: 10px;
    padding: 12px;
  }
}
</style>
