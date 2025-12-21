<script setup lang="ts">
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'
import { onUnmounted } from 'vue'

const matrixConfigurationStore = useMatrixConfigurationStore()
const { setYardageValue, clearYardageValues } = matrixConfigurationStore
const { matrixColumns, matrixColumnHeaders, selectedRowDisplayOption, yardageValues } =
  storeToRefs(matrixConfigurationStore)

onUnmounted(async () => {
  await matrixConfigurationStore.synchronizeValues()
})

const handleClearMatrixButtonPress = () => {
  const userResponse = confirm('Are you sure you want to clear all records?')

  if (userResponse) {
    clearYardageValues()
  }
}

const clubs = ['LW', 'SW', 'GW', 'PW']
</script>

<template>
  <div class="component-container">
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
                <input
                  name="yardage-input"
                  type="number"
                  class="input"
                  placeholder="C"
                  data-test-id="carry-input"
                  :value="yardageValues[clubIndex]?.[colIndex]?.carry_value ?? null"
                  @change="
                    setYardageValue(
                      'carry_value',
                      ($event.target as HTMLInputElement).value,
                      clubIndex,
                      colIndex,
                    )
                  "
                />
              </td>
              <td v-else-if="selectedRowDisplayOption === 'Total'">
                <input
                  name="yardage-input"
                  type="number"
                  class="input"
                  placeholder="T"
                  data-test-id="total-input"
                  :value="yardageValues[clubIndex]?.[colIndex]?.total_value ?? null"
                  @change="
                    setYardageValue(
                      'total_value',
                      ($event.target as HTMLInputElement).value,
                      clubIndex,
                      colIndex,
                    )
                  "
                />
              </td>
              <td v-else>
                <template class="input-pair-container">
                  <input
                    name="yardage-input"
                    type="number"
                    class="input"
                    placeholder="C"
                    data-test-id="carry-input"
                    :value="yardageValues[clubIndex]?.[colIndex]?.carry_value ?? null"
                    @change="
                      setYardageValue(
                        'carry_value',
                        ($event.target as HTMLInputElement).value,
                        clubIndex,
                        colIndex,
                      )
                    "
                  />
                  <input
                    name="yardage-input"
                    type="number"
                    class="input"
                    placeholder="T"
                    data-test-id="total-input"
                    :value="yardageValues[clubIndex]?.[colIndex]?.total_value ?? null"
                    @change="
                      setYardageValue(
                        'total_value',
                        ($event.target as HTMLInputElement).value,
                        clubIndex,
                        colIndex,
                      )
                    "
                  />
                </template>
              </td>
            </template>
          </tr>
        </template>
      </tbody>
    </table>

    <div class="button-container">
      <button @click="handleClearMatrixButtonPress" class="button" data-test-id="clear-all-button">
        Clear Matrix
      </button>
    </div>
  </div>
</template>

<style scoped>
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
  padding: 8px;
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

.input {
  background-color: #374151;
  padding: 2px 0px;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  max-width: 50px;
}

.input:nth-child(2) {
  margin-top: 4px;
}

.input:focus {
  background-color: #374151;
  padding: 2px 0px;
  color: #f3f4f6;
  border: 1px solid #818cf8;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  max-width: 50px;
}

.input:focus::placeholder {
  color: transparent;
}

.input-pair-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.button:hover {
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  margin-top: 12px;
  padding: 6px 16px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
</style>
