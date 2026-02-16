<script setup lang="ts">
import RegisterForm from '@/components/register/RegisterForm.vue'
</script>

<template>
  <main class="auth-container">
    <RegisterForm />
  </main>
</template>

<style scoped>
.auth-container {
  min-width: 320px;
  max-width: 380px;
  margin: 0 auto;
}
</style>
