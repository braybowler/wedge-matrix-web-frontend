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
    <table>
      <thead>
        <tr>
          <th>
            <span class="column-header"> Club </span>
          </th>
          <template v-for="columnHeader in props.columnHeaders" :key="columnHeader.id">
            <th class="">
              <span class="swing-percentage"> {{ columnHeader.swingPercentage }}% </span>
              <span class="swing-percentage-subheader"> Carry </span>
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
            <td>50</td>
            <td>60</td>
            <td>70</td>
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
  border-top: 1px solid #4b5563;
}

tr {
  border-bottom: 1px solid #4b5563;
}

.swing-percentage-subheader {
  @apply text-[#9ca3af];
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
