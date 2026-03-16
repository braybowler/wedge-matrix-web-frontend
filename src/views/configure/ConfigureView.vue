<script setup lang="ts">
import MatrixSelector from '@/components/matrix/MatrixSelector.vue'
import ClubSelector from '@/components/configure/ClubSelector.vue'
import ClubDisplaySettings from '@/components/configure/ClubDisplaySettings.vue'
import SwingPercentageColumnSelector from '@/components/configure/SwingPercentageColumnSelector.vue'
import ColumnHeaderLabelInput from '@/components/configure/ColumnHeaderLabelInput.vue'
import RowDisplayOptionSelector from '@/components/configure/RowDisplayOptionSelector.vue'
import TutorialHighlight from '@/components/tutorial/TutorialHighlight.vue'
import { computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'
import { storeToRefs } from 'pinia'

const router = useRouter()
const matrixConfigurationStore = useMatrixConfigurationStore()
const tutorialStore = useTutorialStore()
const { syncError } = storeToRefs(matrixConfigurationStore)

const showClubHighlight = computed(() => tutorialStore.tutorialStep === 1)
const showClubDisplayHighlight = computed(() => tutorialStore.tutorialStep === 2)
const showSwingHighlight = computed(() => tutorialStore.tutorialStep === 3)
const showLabelHighlight = computed(() => tutorialStore.tutorialStep === 4)
const showRowDisplayHighlight = computed(() => tutorialStore.tutorialStep === 5)

function advanceStep() {
  tutorialStore.nextStep()
}

function finishConfiguration() {
  tutorialStore.nextStep()
  router.push('/matrix')
}

onBeforeUnmount(async () => {
  await matrixConfigurationStore.synchronizeValues()
})
</script>

<template>
  <main class="configure-wrapper wide-page-content">
    <div class="configure-container">
      <MatrixSelector :readonly="true" label="Current Matrix" />
      <p v-if="syncError" class="error-message" data-test-id="sync-error-message">
        {{ syncError }}
      </p>
      <div class="settings-group">
        <TutorialHighlight
          :visible="showClubHighlight"
          message="Start by selecting the wedges in your bag."
          button-label="Next"
          @dismiss="advanceStep"
        >
          <ClubSelector />
        </TutorialHighlight>
        <TutorialHighlight
          :visible="showClubDisplayHighlight"
          message="Choose how club labels appear on your matrix — by club name or by loft degree."
          button-label="Next"
          show-back
          @dismiss="advanceStep"
          @back="tutorialStore.previousStep()"
        >
          <ClubDisplaySettings />
        </TutorialHighlight>
      </div>
      <div class="settings-group">
        <TutorialHighlight
          :visible="showSwingHighlight"
          message="Select the number of shots you have, or would like to have, with each wedge."
          button-label="Next"
          show-back
          @dismiss="advanceStep"
          @back="tutorialStore.previousStep()"
        >
          <SwingPercentageColumnSelector />
        </TutorialHighlight>
        <TutorialHighlight
          :visible="showLabelHighlight"
          message="Choose between the Percentage system for swing effort levels (25%–100%) or the Clock system for backswing positions (7:00–12:00), then set your column labels."
          button-label="Next"
          tooltip-position="above"
          show-back
          @dismiss="advanceStep"
          @back="tutorialStore.previousStep()"
        >
          <ColumnHeaderLabelInput />
        </TutorialHighlight>
      </div>
      <TutorialHighlight
        :visible="showRowDisplayHighlight"
        message="Choose whether to track carry distance, total distance, or both."
        button-label="Finish Configuration"
        tooltip-position="above"
        show-back
        @dismiss="finishConfiguration"
        @back="tutorialStore.previousStep()"
      >
        <RowDisplayOptionSelector />
      </TutorialHighlight>
    </div>
  </main>
</template>

<style scoped>
.configure-wrapper {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-bottom: 12px;
}

.configure-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background-color: #1f2937;
  border-radius: 8px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid #374151;
  border-radius: 8px;
  background-color: #111827;
}

@media (max-width: 480px) {
  .configure-container {
    gap: 10px;
    padding: 12px;
  }

  .settings-group {
    padding: 12px;
    gap: 10px;
  }
}
</style>
