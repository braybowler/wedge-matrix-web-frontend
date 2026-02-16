<script setup lang="ts">
import { useUserStore } from '@/stores/user/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = async () => {
  userStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <footer class="footer">
    <button @click="handleLogout" class="logout-button" data-test-id="logout-button">Logout</button>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid #4b5563;
  padding: 16px;
  display: flex;
  justify-content: center;
}

.logout-button {
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  width: 150px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #4b5563;
  border-color: #818cf8;
  transform: translateY(-1px);
}
</style>
