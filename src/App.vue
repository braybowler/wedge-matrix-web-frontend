<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavigationHeader from '@/components/header/NavigationHeader.vue'
import router from '@/router'
import { publicRoutes } from '@/router'
</script>

<template>
  <NavigationHeader v-if="!publicRoutes.includes(router.currentRoute.value.name)" />
  <RouterView />
</template>

<style scoped></style>
