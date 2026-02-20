<script setup lang="ts">
import ConfirmationModal from '@/components/matrix/ConfirmationModal.vue'
import YardageInput from '@/components/matrix/YardageInput.vue'
import TutorialHighlight from '@/components/tutorial/TutorialHighlight.vue'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { useTutorialStore } from '@/stores/tutorial/tutorialStore.ts'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setYardageValue, clearYardageValues } = matrixConfigurationStore
const {
  matrixColumns,
  matrixColumnHeaders,
  selectedRowDisplayOption,
  yardageValues,
  syncError,
  selectedClubs,
} = storeToRefs(matrixConfigurationStore)

const showClearConfirm = ref(false)

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

const clubs = selectedClubs

const emit = defineEmits<{
  finishTutorial: []
}>()

const tutorialStore = useTutorialStore()
const showMatrixHighlight = computed(() => tutorialStore.tutorialStep === 5)

function handleFinishTutorial() {
  emit('finishTutorial')
}
</script>

<template>
  <div class="component-container">
    <p v-if="syncError" class="error-message" data-test-id="sync-error-message">
      {{ syncError }}
    </p>
    <TutorialHighlight
      :visible="showMatrixHighlight"
      message="Enter your yardage values to build your personalized distance chart."
      button-label="Finish Tutorial"
      @dismiss="handleFinishTutorial"
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
          <template v-for="(club, clubIndex) in clubs" :key="club">
            <tr>
              <td>
                <span class="row-label">
                  {{ club }}
                </span>
              </td>
              <template v-for="(numColumn, colIndex) in matrixColumns" :key="numColumn">
                <td v-if="selectedRowDisplayOption === 'Carry'">
                  <YardageInput
                    field="carry_value"
                    placeholder="C"
                    data-test-id="carry-input"
                    :value="yardageValues[clubIndex]?.[colIndex]?.carry_value ?? null"
                    @change="setYardageValue($event[0], $event[1], clubIndex, colIndex)"
                  />
                </td>
                <td v-else-if="selectedRowDisplayOption === 'Total'">
                  <YardageInput
                    field="total_value"
                    placeholder="T"
                    data-test-id="total-input"
                    :value="yardageValues[clubIndex]?.[colIndex]?.total_value ?? null"
                    @change="setYardageValue($event[0], $event[1], clubIndex, colIndex)"
                  />
                </td>
                <td v-else>
                  <div class="input-pair-container">
                    <YardageInput
                      field="carry_value"
                      placeholder="C"
                      data-test-id="carry-input"
                      :value="yardageValues[clubIndex]?.[colIndex]?.carry_value ?? null"
                      @change="setYardageValue($event[0], $event[1], clubIndex, colIndex)"
                    />
                    <YardageInput
                      field="total_value"
                      placeholder="T"
                      data-test-id="total-input"
                      :value="yardageValues[clubIndex]?.[colIndex]?.total_value ?? null"
                      @change="setYardageValue($event[0], $event[1], clubIndex, colIndex)"
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
      <button @click="handleClearMatrixButtonPress" class="button" data-test-id="clear-all-button">
        Clear Matrix
      </button>
    </div>
  </div>
</template>

<style scoped>
.error-message {
  color: #818cf8;
  font-size: 14px;
  text-align: center;
  margin-bottom: 12px;
}

table {
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button {
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  margin-top: 12px;
  padding: 6px 16px;
  font-size: 16px;
  font-weight: 500;
  width: 150px;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: #4b5563;
  border-color: #818cf8;
  cursor: pointer;
  transform: translateY(-1px);
}
</style>
