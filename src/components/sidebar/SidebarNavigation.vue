<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user/userStore'
import { useRouter } from 'vue-router'
import AccountSettingsModal from '@/components/account/AccountSettingsModal.vue'

const userStore = useUserStore()
const router = useRouter()

const showAccountSettings = ref(false)

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
      <RouterLink active-class="active-link" class="link" to="/calibrate">Calibrate</RouterLink>
    </nav>
    <div class="logout-container">
      <div class="tooltip-wrapper">
        <a
          href="https://buymeacoffee.com/wedgematrix"
          target="_blank"
          rel="noopener noreferrer"
          class="icon-button"
          aria-label="Support WedgeMatrix"
          data-test-id="buy-me-a-coffee-link"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="icon"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M2 4.5A1.5 1.5 0 0 1 3.5 3h11A1.5 1.5 0 0 1 16 4.5v.5h.5A2.5 2.5 0 0 1 19 7.5v1A2.5 2.5 0 0 1 16.5 11H16v.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 2 11.5v-7Zm14 2v3h.5a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H16ZM2 15.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5Z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
        <span class="tooltip tooltip-left">Support WedgeMatrix</span>
      </div>
      <button @click="handleLogout" class="logout-button" data-test-id="logout-button">
        Logout
      </button>
      <div class="tooltip-wrapper">
        <button
          @click="showAccountSettings = true"
          class="icon-button settings-button"
          aria-label="Account Settings"
          data-test-id="account-settings-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="icon"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <span class="tooltip tooltip-right">Account Settings</span>
      </div>
    </div>
  </aside>

  <AccountSettingsModal :visible="showAccountSettings" @close="showAccountSettings = false" />
</template>

<style scoped>
@reference "tailwindcss";

.sidebar {
  background-color: #1f2937;
  border-right: 1px solid #4b5563;
  width: 100%;
  height: 100%;
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
}

.settings-button {
  cursor: pointer;
}

.icon {
  width: 16px;
  height: 16px;
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
.tooltip-left {
  left: 0;
  transform: none;
}

.tooltip-right {
  left: auto;
  right: 0;
  transform: none;
}
</style>
