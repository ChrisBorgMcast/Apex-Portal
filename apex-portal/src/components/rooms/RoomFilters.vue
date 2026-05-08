<template>
  <div>
    <v-card class="pa-4 mb-6">
      <v-row align="center">
        <v-col cols="12" md="4">
          <v-text-field
            :model-value="search"
            label="Search rooms"
            clearable
            density="compact"
            hide-details
            @update:model-value="$emit('update:search', $event)"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            :model-value="selectedFloor"
            :items="floorOptions"
            label="Floor"
            density="compact"
            hide-details
            @update:model-value="$emit('update:selectedFloor', $event)"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            :model-value="statusFilter"
            :items="statusOptions"
            label="Status"
            density="compact"
            hide-details
            @update:model-value="$emit('update:statusFilter', $event)"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-tabs
      :model-value="selectedFloor"
      class="mb-6"
      show-arrows
      @update:model-value="$emit('update:selectedFloor', $event)"
    >
      <v-tab
        v-for="floor in floorOptions"
        :key="floor.value"
        :value="floor.value"
      >
        {{ floor.title }}
      </v-tab>
    </v-tabs>

    <div class="rooms-count-row d-flex justify-space-between align-center mb-4">
      <p class="text-caption text-grey mb-0">
        Showing {{ visibleCount }} of {{ filteredCount }} rooms
      </p>
      <v-select
        :model-value="pageSize"
        :items="[8, 12, 16, 24]"
        label="Per page"
        density="compact"
        hide-details
        class="page-size-select"
        @update:model-value="$emit('update:pageSize', $event)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  filteredCount: {
    type: Number,
    required: true
  },
  floorOptions: {
    type: Array,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  },
  search: {
    type: String,
    required: true
  },
  selectedFloor: {
    type: [String, Number],
    required: true
  },
  statusFilter: {
    type: String,
    required: true
  },
  statusOptions: {
    type: Array,
    required: true
  },
  visibleCount: {
    type: Number,
    required: true
  }
});

defineEmits([
  "update:pageSize",
  "update:search",
  "update:selectedFloor",
  "update:statusFilter"
]);
</script>

<style scoped>
.page-size-select {
  max-width: 160px;
}

@media (max-width: 599px) {
  .rooms-count-row {
    align-items: stretch !important;
    flex-direction: column;
    gap: 0.75rem;
  }

  .page-size-select {
    max-width: none;
    width: 100%;
  }

  :deep(.v-tab) {
    font-size: 0.78rem;
    min-width: auto;
    padding-inline: 0.75rem;
  }
}
</style>
