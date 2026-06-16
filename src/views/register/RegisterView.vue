<script setup lang="ts">
import AuthBrandPanel from '@/components/shared/AuthBrandPanel.vue'
import RegisterForm from '@/components/register/RegisterForm.vue'
</script>

<template>
  <main class="wm-auth-shell">
    <AuthBrandPanel
      eyebrow="Precision short game"
      headline="Your number on every wedge shot."
      body="Create an account to build your personalized yardage matrix, calibrate it on the range, and take dead aim inside 130 yards."
      :third-stat="{ value: 'free', label: 'to start' }"
    />
    <RegisterForm />
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
