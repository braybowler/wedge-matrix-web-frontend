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
    <div class="brand">
      <div class="brand-mark" aria-hidden="true">
        <div class="brand-ring" />
      </div>
      <span class="brand-name">Wedge Matrix</span>
    </div>

    <nav class="nav-links">
      <span class="nav-category">Matrix</span>
      <RouterLink active-class="active-link" class="link" to="/matrix">
        <span class="link-dot" aria-hidden="true" />
        Wedge Matrix
      </RouterLink>
      <RouterLink active-class="active-link" class="link" to="/configure">
        <span class="link-dot" aria-hidden="true" />
        Configure
      </RouterLink>
      <RouterLink active-class="active-link" class="link" to="/calibrate">
        <span class="link-dot" aria-hidden="true" />
        Calibrate
      </RouterLink>

      <span class="nav-category">Practice</span>
      <RouterLink active-class="active-link" class="link" to="/practice">
        <span class="link-dot" aria-hidden="true" />
        Practice
      </RouterLink>

      <span class="nav-category">Socials</span>
      <a
        href="https://x.com/wedgematrixbray"
        target="_blank"
        rel="noopener noreferrer"
        class="link social-link"
        data-test-id="social-x-link"
        aria-label="Follow on X"
      >
        <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          />
        </svg>
      </a>
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
  background: linear-gradient(180deg, #0d1426, #0a0e1a);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 22px 18px;
  color: #f4f6fb;
  font-family: 'Archivo', system-ui, sans-serif;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 6px 8px 22px;
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: #8b8cf6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-ring {
  width: 13px;
  height: 13px;
  border: 2.5px solid #0a0e1a;
  border-radius: 50%;
}

.brand-name {
  font-weight: 800;
  letter-spacing: -0.015em;
  font-size: 16px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nav-category {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #5b6276;
  padding: 16px 8px 10px;
}

.nav-category:first-child {
  padding-top: 0;
}

.link {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 12px;
  border-radius: 11px;
  color: #aab2c5;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition:
    background 0.14s,
    color 0.14s;
}

.link-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #39415a;
  flex: none;
  transition: background 0.14s;
}

.link:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #f4f6fb;
}

.active-link {
  color: #f4f6fb;
  font-weight: 700;
  background: rgba(139, 140, 246, 0.1);
  box-shadow: inset 0 0 0 1px rgba(139, 140, 246, 0.4);
}

.active-link .link-dot {
  background: #8b8cf6;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin-left: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #aab2c5;
  transition:
    border-color 0.14s,
    color 0.14s;
}

.social-link:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #f4f6fb;
}

.social-icon {
  width: 18px;
  height: 18px;
}

.logout-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.icon-button {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aab2c5;
  border-radius: 11px;
  cursor: pointer;
  transition:
    border-color 0.14s,
    color 0.14s;
}

.icon-button:hover {
  border-color: rgba(255, 255, 255, 0.28);
  color: #f4f6fb;
  transform: none;
  background: rgba(255, 255, 255, 0.04);
}

.settings-button {
  cursor: pointer;
}

.icon {
  width: 17px;
  height: 17px;
}

.logout-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f4f6fb;
  border-radius: 11px;
  padding: 11px;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 600;
  width: auto;
  cursor: pointer;
  transition:
    border-color 0.14s,
    background 0.14s;
}

.logout-button:hover {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.06);
  transform: none;
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
