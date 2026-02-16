<script setup lang="ts">
import LoginForm from '@/components/login/LoginForm.vue'
</script>

<template>
  <main class="auth-container">
    <LoginForm />
  </main>
</template>

<style scoped>
.auth-container {
  min-width: 320px;
  max-width: 380px;
  margin: 0 auto;
}
</style>
