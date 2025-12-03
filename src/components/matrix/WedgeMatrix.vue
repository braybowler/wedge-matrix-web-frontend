<script setup lang="ts">
type UserColumnHeaders = {
  swingPercentage: number
  id: number
}

const props = defineProps<{
  numColumns: number
  columnHeaders: Array<UserColumnHeaders>
  rowDisplayOption?: 'Carry' | 'Total' | 'Both'
}>()

const wedges = [
  {
    label: 'LW',
    id: 1,
  },
  {
    label: 'SW',
    id: 2,
  },
  {
    label: 'GW',
    id: 3,
  },
  {
    label: 'PW',
    id: 4,
  },
]
</script>

<template>
  <div class="bg-[#111827] p-4">
    <table class="w-full">
      <thead>
        <tr>
          <th>
            <span class="column-header"> Club </span>
          </th>
          <template v-for="columnHeader in props.columnHeaders" :key="columnHeader.id">
            <th>
              <div class="swing-percentage-container">
                <span class="swing-percentage"> {{ columnHeader.swingPercentage }}% </span>
                <span class="swing-percentage-subheader"> Carry </span>
              </div>
            </th>
          </template>
        </tr>
      </thead>
      <tbody>
        <template v-for="wedge in wedges" :key="wedge.id">
          <tr>
            <td>
              <span class="row-label">
                {{wedge.label}}
              </span>
            </td>
            <td>
              <span class="row-label">
                50
              </span>
            </td>
            <td>
              <span class="row-label">
                60
              </span>
            </td>
            <td>
              <span class="row-label">
                70
              </span>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

table {
  border-collapse: collapse;
  text-align: center;
  background-color: #4b5563;
  border-radius: 8px;
}

tr {
  border-bottom: 1px solid #4b5563;
  background-color: #1f2937;
}

tr:last-child {
  border-bottom: none;
}

th {
  padding: 4px;
  text-align: center;
  border-bottom: 1px solid #4b5563;
}

td {
  padding: 8px;
}

.swing-percentage-subheader {
  @apply text-[#9ca3af];
}

.swing-percentage-container {
  @apply flex flex-col
}

.swing-percentage {
  @apply text-[#818cf8];
}

.column-header {
  @apply text-[#f3f4f6];
}

.row-label {
  @apply text-[#f3f4f6];
}
</style>
