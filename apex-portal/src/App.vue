<script setup>
import AppNavbar from "./components/AppNavbar.vue";
import ThemeBar from "./components/ThemeBar.vue";
</script>

<template>
  <v-app>
    <AppNavbar />

    <v-main class="app-main">
      <RouterView v-slot="{ Component, route }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </v-main>

    <ThemeBar />
  </v-app>
</template>

<style scoped>
.app-main {
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-on-background));
  min-height: 100vh;
  padding: 1rem 1rem 4.5rem;
  transition: background-color 0.25s ease, color 0.25s ease;
}

@media (max-width: 599px) {
  .app-main {
    padding: 0.75rem 0.5rem 5rem;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
