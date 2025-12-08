<script setup lang="ts"></script>

<template>
  <header class="header">
    <nav class="navigation-container">
      <RouterLink active-class="active-link" class="link" to="/matrix"> Wedge Matrix </RouterLink>
      <RouterLink active-class="active-link" class="link" to="/configure"> Configure </RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.header {
  border-bottom: 1px solid #4b5563;
}

.navigation-container {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-around;
  padding: 16px;
}

.link {
  color: #9ca3af;
}

.active-link {
  color: #818cf8;
  font-weight: 700;
}
</style>
