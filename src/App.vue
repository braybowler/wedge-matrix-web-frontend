<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation.vue'
import NavigationHeader from '@/components/header/NavigationHeader.vue'
import MobileFooter from '@/components/footer/MobileFooter.vue'
import LoadingBar from '@/components/loading/LoadingBar.vue'
import router from '@/router'
import { publicRoutes } from '@/router'

const isLandingPage = computed(() => router.currentRoute.value.name === 'landing')
const isPublicRoute = computed(() => publicRoutes.includes(router.currentRoute.value.name))
</script>

<template>
  <LoadingBar />
  <template v-if="!isPublicRoute">
    <div class="authenticated-layout">
      <div class="mobile-header">
        <NavigationHeader />
      </div>
      <div class="main-body">
        <div class="desktop-sidebar">
          <SidebarNavigation />
        </div>
        <main class="page-content">
          <RouterView />
        </main>
      </div>
      <div class="mobile-footer">
        <MobileFooter />
      </div>
    </div>
  </template>
  <div v-else-if="isLandingPage" class="landing-layout">
    <RouterView />
  </div>
  <div v-else class="auth-layout">
    <RouterView />
  </div>
</template>

<style scoped>
.authenticated-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.page-content {
  flex: 1;
  overflow-y: auto;
}

.desktop-sidebar {
  display: none;
}

.mobile-footer {
  flex-shrink: 0;
}

.landing-layout {
  min-height: 100vh;
}

.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

@media (min-width: 768px) {
  .mobile-header,
  .mobile-footer {
    display: none;
  }

  .desktop-sidebar {
    display: block;
    width: 25%;
    min-width: 180px;
    flex-shrink: 0;
  }

  .page-content {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .page-content :deep(> *) {
    width: 60%;
    max-width: 480px;
  }
}
</style>
