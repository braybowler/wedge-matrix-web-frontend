<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarNavigation from '@/components/sidebar/SidebarNavigation.vue'
import NavigationHeader from '@/components/header/NavigationHeader.vue'
import MobileFooter from '@/components/footer/MobileFooter.vue'
import router from '@/router'
import { publicRoutes } from '@/router'
</script>

<template>
  <template v-if="!publicRoutes.includes(router.currentRoute.value.name)">
    <div class="mobile-layout">
      <NavigationHeader />
      <main class="mobile-content">
        <RouterView />
      </main>
      <MobileFooter />
    </div>
    <div class="desktop-layout">
      <SidebarNavigation />
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </template>
  <div v-else class="auth-layout">
    <RouterView />
  </div>
</template>

<style scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
}

.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.desktop-layout {
  display: none;
}

@media (min-width: 768px) {
  .mobile-layout {
    display: none;
  }

  .desktop-layout {
    display: flex;
    height: 100vh;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .main-content :deep(> *) {
    width: 60%;
    max-width: 480px;
  }
}
</style>
