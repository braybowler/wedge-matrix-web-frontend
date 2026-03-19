<script setup lang="ts">
import ConfirmationModal from '@/components/matrix/ConfirmationModal.vue'
import MatrixSelector from '@/components/matrix/MatrixSelector.vue'
import YardageInput from '@/components/matrix/YardageInput.vue'
import TutorialHighlight from '@/components/tutorial/TutorialHighlight.vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const matrixConfigurationStore = useMatrixConfigurationStore()
const { setYardageValue, clearYardageValues, downloadMatrix } = matrixConfigurationStore
const {
  matrixColumns,
  matrixColumnHeaders,
  selectedRowDisplayOption,
  yardageValues,
  syncError,
  selectedClubs,
  displayLabels,
} = storeToRefs(matrixConfigurationStore)

const showClearConfirm = ref(false)
const isDownloading = ref(false)

const handleClearMatrixButtonPress = () => {
  showClearConfirm.value = true
}

const handleClearConfirm = async () => {
  clearYardageValues()
  showClearConfirm.value = false
  await matrixConfigurationStore.synchronizeValues()
}

const handleClearCancel = () => {
  showClearConfirm.value = false
}

const handleDownload = async () => {
  if (isDownloading.value) return
  isDownloading.value = true
  try {
    await downloadMatrix()
  } finally {
    isDownloading.value = false
  }
}

const emit = defineEmits<{
  finishTutorial: []
}>()

const tutorialStore = useTutorialStore()
const showMultiMatrixHighlight = computed(() => tutorialStore.tutorialStep === 6)
const showMatrixHighlight = computed(() => tutorialStore.tutorialStep === 7)

function handleStepFiveBack() {
  tutorialStore.previousStep()
  router.push('/configure')
}

function handleFinishTutorial() {
  emit('finishTutorial')
}
</script>

<template>
  <div class="component-container">
    <TutorialHighlight
      :visible="showMultiMatrixHighlight"
      message="Create multiple matrices to track different setups. Use the buttons to add, rename, or delete matrices."
      button-label="Next"
      show-back
      @dismiss="tutorialStore.nextStep()"
      @back="handleStepFiveBack"
    >
      <MatrixSelector />
    </TutorialHighlight>
    <p v-if="syncError" class="error-message" data-test-id="sync-error-message">
      {{ syncError }}
    </p>
    <TutorialHighlight
      :visible="showMatrixHighlight"
      message="Enter your yardage values to build your personalized distance chart."
      button-label="Finish Tutorial"
      show-back
      @dismiss="handleFinishTutorial"
      @back="tutorialStore.previousStep()"
    >
      <table>
        <thead>
          <tr>
            <th>
              <span class="column-header"> Club </span>
            </th>
            <template v-for="(numColumn, index) in matrixColumns" :key="numColumn">
              <th>
                <div data-test-id="swing-percentage-container" class="swing-percentage-container">
                  <span class="swing-percentage">
                    {{ matrixColumnHeaders[index] }}
                  </span>
                  <template v-if="selectedRowDisplayOption != 'Both'">
                    <span class="swing-percentage-subheader"> {{ selectedRowDisplayOption }} </span>
                  </template>
                  <template v-else>
                    <span class="swing-percentage-subheader"> Carry </span>
                    <span class="swing-percentage-subheader"> Total </span>
                  </template>
                </div>
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <template v-for="(club, clubIndex) in selectedClubs" :key="club">
            <tr>
              <td>
                <span class="row-label">
                  {{ displayLabels[clubIndex] }}
                </span>
              </td>
              <template v-for="(numColumn, colIndex) in matrixColumns" :key="numColumn">
                <td v-if="selectedRowDisplayOption === 'Carry'">
                  <YardageInput
                    field="carry_value"
                    placeholder="C"
                    data-test-id="carry-input"
                    :value="yardageValues[clubIndex]?.[colIndex]?.carry_value ?? null"
                    @change="(field, raw) => setYardageValue(field, raw, clubIndex, colIndex)"
                  />
                </td>
                <td v-else-if="selectedRowDisplayOption === 'Total'">
                  <YardageInput
                    field="total_value"
                    placeholder="T"
                    data-test-id="total-input"
                    :value="yardageValues[clubIndex]?.[colIndex]?.total_value ?? null"
                    @change="(field, raw) => setYardageValue(field, raw, clubIndex, colIndex)"
                  />
                </td>
                <td v-else>
                  <div class="input-pair-container">
                    <YardageInput
                      field="carry_value"
                      placeholder="C"
                      data-test-id="carry-input"
                      :value="yardageValues[clubIndex]?.[colIndex]?.carry_value ?? null"
                      @change="(field, raw) => setYardageValue(field, raw, clubIndex, colIndex)"
                    />
                    <YardageInput
                      field="total_value"
                      placeholder="T"
                      data-test-id="total-input"
                      :value="yardageValues[clubIndex]?.[colIndex]?.total_value ?? null"
                      @change="(field, raw) => setYardageValue(field, raw, clubIndex, colIndex)"
                    />
                  </div>
                </td>
              </template>
            </tr>
          </template>
        </tbody>
      </table>
    </TutorialHighlight>

    <ConfirmationModal
      :visible="showClearConfirm"
      title="Clear Matrix"
      message="Are you sure you want to clear all records?"
      @confirm="handleClearConfirm"
      @cancel="handleClearCancel"
    />

    <div class="button-container">
      <div class="tooltip-wrapper">
        <button
          @click="handleClearMatrixButtonPress"
          class="icon-button"
          aria-label="Clear Matrix"
          data-test-id="clear-all-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="icon"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H4.28a.75.75 0 0 0-.75.75v3.952a.75.75 0 0 0 1.5 0v-2.146l.312.311a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.384Zm.074-4.024a.75.75 0 0 0 .75-.75V2.698a.75.75 0 0 0-1.5 0v2.146l-.312-.311a7 7 0 0 0-11.712 3.138.75.75 0 0 0 1.449.384 5.5 5.5 0 0 1 9.201-2.466l.312.311H11.14a.75.75 0 1 0 0 1.5h3.952Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <span class="tooltip">Clear Matrix</span>
      </div>
      <div class="tooltip-wrapper">
        <button
          @click="handleDownload"
          class="icon-button"
          aria-label="Download PDF"
          data-test-id="download-pdf-button"
          :disabled="isDownloading"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="icon"
            aria-hidden="true"
          >
            <path
              d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z"
            />
            <path
              d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z"
            />
          </svg>
        </button>
        <span class="tooltip">Download PDF</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-message {
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-bottom: 12px;
}

table {
  margin-top: 8px;
  width: 100%;
  border-radius: 8px;
  border-collapse: collapse;
  text-align: center;
  background-color: #4b5563;
  overflow: hidden;
}

tr {
  border-bottom: 1px solid #4b5563;
  background-color: #1f2937;
}

tr:last-child {
  border-bottom: none;
}

th {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #4b5563;
}

th:last-child {
  padding: 8px;
  padding-right: 16px;
}

td {
  padding: 8px 0;
}

td:last-child {
  padding-right: 8px;
}

.component-container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.swing-percentage-container {
  display: flex;
  flex-direction: column;
}

.swing-percentage {
  color: #818cf8;
  font-size: 12px;
  font-weight: 700;
}

.swing-percentage-subheader {
  color: #9ca3af;
  font-size: 10px;
  font-weight: 300;
}

.column-header {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 700;
}

.row-label {
  color: #f3f4f6;
  font-size: 16px;
  font-weight: 500;
}

.input-pair-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.button-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
