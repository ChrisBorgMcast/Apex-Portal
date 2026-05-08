<template>
  <div class="theme-bar" :class="{ 'theme-bar-expanded': expanded }">
    <v-btn
      class="theme-arrow"
      color="accent"
      icon
      size="small"
      variant="text"
      :aria-label="expanded ? 'Collapse theme controls' : 'Open theme controls'"
      @click="expanded = !expanded"
    >
      <v-icon>{{ expanded ? "mdi-chevron-down" : "mdi-chevron-up" }}</v-icon>
    </v-btn>

    <span class="theme-bar-label">{{ expanded ? "Comfort view" : "Theme" }}</span>

    <Transition name="theme-options">
      <div v-if="expanded" class="theme-options">
        <v-switch
          v-model="darkMode"
          color="accent"
          density="compact"
          hide-details
          inset
          :label="darkMode ? 'Dark' : 'Light'"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useTheme } from "vuetify";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();
const theme = useTheme();
const expanded = ref(localStorage.getItem("apex-theme-bar-open") === "true");
const darkMode = ref(localStorage.getItem("apex-dark-mode") === "true");

const activeThemeName = computed(() => {
  if (authStore.isStaff) return darkMode.value ? "staffDarkTheme" : "staffTheme";
  return darkMode.value ? "customerDarkTheme" : "customerTheme";
});

watch(
  activeThemeName,
  (themeName) => {
    theme.global.name.value = themeName;
  },
  { immediate: true }
);

watch(darkMode, (value) => {
  localStorage.setItem("apex-dark-mode", String(value));
});

watch(expanded, (value) => {
  localStorage.setItem("apex-theme-bar-open", String(value));
});
</script>

<style scoped>
.theme-bar {
  align-items: center;
  backdrop-filter: blur(12px);
  background: rgba(var(--v-theme-surface), 0.94);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 999px;
  bottom: 0.75rem;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
  color: rgb(var(--v-theme-on-surface));
  display: flex;
  gap: 0.25rem;
  left: 50%;
  min-height: 44px;
  overflow: hidden;
  padding: 0.25rem 0.75rem 0.25rem 0.35rem;
  position: fixed;
  transform: translateX(-50%);
  transition: background-color 0.25s ease, border-color 0.25s ease, min-width 0.25s ease;
  z-index: 1008;
}

.theme-bar-expanded {
  gap: 0.65rem;
  padding-right: 0.55rem;
}

.theme-arrow {
  flex: 0 0 auto;
}

.theme-bar-label {
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.theme-options {
  align-items: center;
  display: flex;
}

.theme-options :deep(.v-selection-control) {
  min-height: 34px;
}

.theme-options-enter-active,
.theme-options-leave-active {
  transition: opacity 0.18s ease, max-width 0.18s ease;
}

.theme-options-enter-from,
.theme-options-leave-to {
  max-width: 0;
  opacity: 0;
}

.theme-options-enter-to,
.theme-options-leave-from {
  max-width: 110px;
  opacity: 1;
}

@media (max-width: 599px) {
  .theme-bar {
    bottom: 0.5rem;
    gap: 0.15rem;
    min-height: 38px;
    max-width: calc(100vw - 1.5rem);
    padding: 0.15rem 0.45rem 0.15rem 0.2rem;
  }

  .theme-bar-expanded {
    gap: 0.35rem;
    padding-right: 0.35rem;
  }

  .theme-arrow {
    height: 32px;
    width: 32px;
  }

  .theme-bar-label {
    font-size: 0.68rem;
  }

  .theme-options :deep(.v-label) {
    display: none;
  }

  .theme-options :deep(.v-switch .v-selection-control) {
    min-width: 46px;
  }
}
</style>
