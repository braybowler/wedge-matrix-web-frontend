<script setup lang="ts">
import WedgeMatrix from '@/components/matrix/WedgeMatrix.vue'
import type { UserClub } from '@/types/matrix'

const tempWedges: Array<UserClub> = [
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
  <main>
    <WedgeMatrix :clubs="tempWedges" />
  </main>
</template>
