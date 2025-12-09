<script setup lang="ts">
import type { UserClub } from '@/types/matrix'
import { useMatrixConfigurationStore } from '@/stores/matrix/matrixConfigurationStore.ts'
import { storeToRefs } from 'pinia'

const matrixConfigurationStore = useMatrixConfigurationStore()
const { matrixColumns, matrixColumnHeaders, selectedRowDisplayOption } =
  storeToRefs(matrixConfigurationStore)

export interface WedgeMatrixProps {
  clubs: Array<UserClub>
}

const props = defineProps<WedgeMatrixProps>()

const handleClearMatrixButtonPress = () => {
  const userResponse = confirm('Are you sure you want to clear all records?')

  if (userResponse) {
    clearMatrix()
  }
}

const clearMatrix = () => {
  const inputs = document.getElementsByTagName('input')

  for (const input of inputs) {
    input.value = ''
  }
}
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
                  {{ matrixColumnHeaders[index]?.label }}
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
        <template v-for="club in props.clubs" :key="club.id">
          <tr>
            <td>
              <span class="row-label">
                {{ club.label }}
              </span>
            </td>
            <template v-for="numColumn in matrixColumns" :key="numColumn">
              <td v-if="selectedRowDisplayOption === 'Carry'">
                <input type="text" class="input" placeholder="C" data-test-id="carry-input" />
              </td>
              <td v-else-if="selectedRowDisplayOption === 'Total'">
                <input type="text" class="input" placeholder="T" data-test-id="total-input" />
              </td>
              <td v-else>
                <template class="input-pair-container">
                  <input type="text" class="input" placeholder="C" data-test-id="carry-input" />
                  <input type="text" class="input" placeholder="T" data-test-id="total-input" />
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

td {
  padding: 8px 0;
}

.component-container {
  background-color: #111827;
  padding: 16px;
}

.swing-percentage-container {
  display: flex;
  flex-direction: column;
}

.swing-percentage {
  color: #818cf8;
  font-size: 14px;
  font-weight: 700;
}

.swing-percentage-subheader {
  color: #9ca3af;
  font-size: 12px;
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
