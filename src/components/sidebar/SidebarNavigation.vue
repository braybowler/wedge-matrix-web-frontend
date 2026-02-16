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
  <aside class="sidebar">
    <nav class="nav-links">
      <RouterLink active-class="active-link" class="link" to="/matrix">Wedge Matrix</RouterLink>
      <RouterLink active-class="active-link" class="link" to="/configure">Configure</RouterLink>
    </nav>
    <div class="logout-container">
      <button @click="handleLogout" class="logout-button" data-test-id="logout-button">
        Logout
      </button>
    </div>
  </aside>
</template>

<style scoped>
@reference "tailwindcss";

.sidebar {
  background-color: #1f2937;
  border-right: 1px solid #4b5563;
  width: 25%;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link {
  color: #9ca3af;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.link:hover {
  background-color: #374151;
}

.active-link {
  color: #818cf8;
  font-weight: 700;
}

.logout-container {
  padding-top: 16px;
}

.logout-button {
  background-color: #374151;
  color: #f3f4f6;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  transition: all 0.2s ease;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #4b5563;
  border-color: #818cf8;
  transform: translateY(-1px);
}
</style>
