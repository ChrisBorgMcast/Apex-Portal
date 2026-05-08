<template>
  <v-card class="pa-4 mb-6">
    <div class="d-flex justify-space-between align-center mb-3">
      <div>
        <h3 class="mb-1">Staff Alerts</h3>
        <p class="text-caption text-grey mb-0">Assigned work and important room updates for your role.</p>
      </div>
      <v-chip color="secondary" size="small">{{ alerts.length }}</v-chip>
    </div>

    <div v-if="alerts.length" class="alert-list">
      <v-alert
        v-for="alert in alerts"
        :key="alert.id"
        :type="alert.type"
        variant="tonal"
        density="compact"
      >
        <div class="d-flex justify-space-between align-center alert-row">
          <div>
            <div class="font-weight-bold">{{ alert.title }}</div>
            <div class="text-caption">{{ alert.message }}</div>
          </div>
          <v-btn
            size="x-small"
            color="primary"
            variant="outlined"
            @click="$emit('open-alert', alert)"
          >
            Open
          </v-btn>
        </div>
      </v-alert>
    </div>

    <v-alert v-else type="success" variant="tonal" density="compact">
      No assigned alerts right now.
    </v-alert>
  </v-card>
</template>

<script setup>
defineProps({
  alerts: {
    type: Array,
    required: true
  }
});

defineEmits(["open-alert"]);
</script>

<style scoped>
.alert-list {
  display: grid;
  gap: 0.75rem;
}

.alert-row {
  gap: 1rem;
}
</style>
