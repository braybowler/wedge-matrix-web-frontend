<script setup lang="ts">
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'
import { ref } from 'vue'

const columnHeaders = ref([
  {
    swingPercentage: 25,
    id: 1,
  },
  {
    swingPercentage: 50,
    id: 2,
  },
  {
    swingPercentage: 75,
    id: 3,
  },
])
</script>

<template>
  <main class="bg-[#111827] h-auto">
    <WedgeMatrix :num-columns="3" :column-headers="columnHeaders" />
  </main>
</template>
