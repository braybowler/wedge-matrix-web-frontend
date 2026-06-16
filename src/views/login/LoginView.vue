<script setup lang="ts">
import AuthBrandPanel from '@/components/shared/AuthBrandPanel.vue'
import LoginForm from '@/components/login/LoginForm.vue'
</script>

<template>
  <main class="wm-auth-shell">
    <AuthBrandPanel
      eyebrow="Welcome back"
      headline="Your matrix is waiting."
      body="Pick up right where you left off — your wedges, your swings, your numbers, all dialled in inside 130 yards."
      :third-stat="{ value: '&plusmn;3', label: 'yard dispersion' }"
    />
    <LoginForm />
  </main>
</template>

<style scoped>
@reference "tailwindcss";

.wm-auth-shell {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  min-height: 100vh;
  width: 100%;
  align-self: stretch;
  background: #090d18;
  color: #f4f6fb;
  font-family: 'Archivo', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@media (max-width: 880px) {
  .wm-auth-shell {
    grid-template-columns: 1fr;
  }

  .wm-auth-shell :deep(.wm-brandside) {
    display: none;
  }
}
</style>
