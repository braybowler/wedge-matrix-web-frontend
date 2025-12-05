<script setup lang="ts">
import type {
  AllowableMatrixColumnNumber,
  RowDisplayOption,
  UserClub,
  UserColumnHeader,
} from '@/types/matrix'

export interface WedgeMatrixProps {
  numColumns: AllowableMatrixColumnNumber
  columnHeaders: Array<UserColumnHeader>
  clubs: Array<UserClub>
  rowDisplayOption?: RowDisplayOption
}

const props = defineProps<WedgeMatrixProps>()

const handleClearMatrixButtonPress = () => {
  const userResponse = confirm('Are you sure you want to clear all records?')

  if (userResponse) {
    clearMatrix()
  }
}

const clearMatrix = () => {
  console.log('matrix cleared')
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
          <template
            v-for="columnHeader in props.columnHeaders"
            :key="columnHeader.id"
          >
            <th>
              <div
                data-test-id="swing-percentage-container"
                class="swing-percentage-container"
              >
                <span class="swing-percentage"> {{ columnHeader.swingPercentage }}% </span>
                <span class="swing-percentage-subheader"> Carry </span>
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
            <td>
              <input type="text" class="input" placeholder="C" />
            </td>
            <td>
              <input type="text" class="input" placeholder="C" />
            </td>
            <td>
              <input type="text" class="input" placeholder="C" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <div class="button-container">
      <button @click="handleClearMatrixButtonPress" class="button">Clear Matrix</button>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

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
  padding: 8px;
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
  @apply bg-[#374151] text-[#f3f4f6] border border-[#4b5563] rounded-lg;
  padding: 2px 0px;
  color: #f3f4f6;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  width: 85%;
}

.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button {
  @apply mt-4 bg-[#374151] text-[#f3f4f6] border border-[#4b5563] rounded-lg;
  padding: 8px 20px;
  font-size: 16px;
  font-weight: 500;
}
</style>
