<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isOpen = ref(false)

watch(
  () => route.path,
  () => {
    isOpen.value = false
  },
)
</script>

<template>
  <header class="header">
    <button
      class="hamburger-button"
      aria-label="Open navigation menu"
      data-test-id="hamburger-button"
      @click="isOpen = true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="hamburger-icon"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </header>

  <Transition name="overlay">
    <div v-if="isOpen" class="overlay" @click="isOpen = false" />
  </Transition>

  <Transition name="drawer">
    <nav v-if="isOpen" class="drawer" data-test-id="mobile-drawer">
      <div class="drawer-header">
        <button
          class="close-button"
          aria-label="Close navigation menu"
          data-test-id="close-drawer-button"
          @click="isOpen = false"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="close-icon"
            aria-hidden="true"
          >
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
        </button>
      </div>

      <div class="nav-links">
        <span class="nav-category">Matrix</span>
        <RouterLink active-class="active-link" class="link" to="/matrix">Wedge Matrix</RouterLink>
        <RouterLink active-class="active-link" class="link" to="/configure">Configure</RouterLink>
        <RouterLink active-class="active-link" class="link" to="/calibrate">Calibrate</RouterLink>

        <span class="nav-category">Practice</span>
        <RouterLink active-class="active-link" class="link" to="/practice">Practice</RouterLink>
      </div>
    </nav>
  </Transition>
</template>

<style scoped>
.header {
  border-bottom: 1px solid #4b5563;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.hamburger-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.hamburger-button:hover {
  color: #f3f4f6;
}

.hamburger-icon {
  width: 24px;
  height: 24px;
}

.overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 80vw;
  background-color: #1f2937;
  border-right: 1px solid #4b5563;
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.drawer-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #f3f4f6;
}

.close-icon {
  width: 24px;
  height: 24px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-category {
  color: #6b7280;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 12px 8px;
  border-bottom: 1px solid #818cf8;
}

.nav-category:not(:first-child) {
  margin-top: 16px;
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

/* Drawer slide transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}

/* Overlay fade transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
