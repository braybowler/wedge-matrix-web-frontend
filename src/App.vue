<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="bg-[#111827]">
      <nav class="flex items-center justify-around p-4">
        <RouterLink
          active-class="active-link"
          class="link"
          to="/matrix"
        >
          Wedge Matrix
        </RouterLink>
        <RouterLink
          active-class="active-link"
          class="link"
          to="/configure"
        >
          Configure
        </RouterLink>
      </nav>
    </div>
  </header>

  <RouterView/>
</template>

<style scoped>
@reference "tailwindcss";

 .link {
   @apply text-[#9ca3af];
 }

 .active-link {
   @apply text-[#818cf8];
 }
</style>
