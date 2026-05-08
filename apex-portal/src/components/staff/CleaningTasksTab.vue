<template>
  <div>
    <h3 class="mb-4">{{ authUser?.staffRole === "maid" ? "Room Service" : "Cleaning Tasks" }}</h3>

    <v-card class="pa-4 mb-6 table-card">
      <v-table>
        <thead>
          <tr>
            <th>Room</th>
            <th>Floor</th>
            <th>Cleaning Status</th>
            <th>Needs Cleaning</th>
            <th>Last Cleaned</th>
            <th>Assigned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in rooms" :key="room.id">
            <td>{{ room.name }}</td>
            <td>{{ room.floor }}</td>
            <td>
              <v-chip :color="getCleaningColor(room.cleaningStatus)" size="small">
                {{ capitalize(room.cleaningStatus || "clean") }}
              </v-chip>
            </td>
            <td>
              <v-chip v-if="room.needsCleaning" color="orange" size="small">Yes</v-chip>
              <span v-else>No</span>
            </td>
            <td>{{ formatDate(room.lastCleanedAt) }}</td>
            <td>{{ getCleanerEmail(room.assignedCleaner) }}</td>
            <td>
              <div class="action-buttons">
                <v-btn
                  v-if="authUser?.staffRole === 'cleaner' || authUser?.staffRole === 'admin'"
                  size="x-small"
                  color="success"
                  @click="$emit('mark-cleaned', room)"
                >
                  Mark Cleaned
                </v-btn>

                <v-btn
                  v-if="authUser?.staffRole === 'receptionist' || authUser?.staffRole === 'admin'"
                  size="x-small"
                  color="warning"
                  @click="$emit('mark-needs-cleaning', room)"
                >
                  Needs Cleaning
                </v-btn>
                <v-btn
                  v-if="authUser?.staffRole === 'receptionist' || authUser?.staffRole === 'admin'"
                  size="x-small"
                  color="secondary"
                  @click="$emit('mark-room-service', room)"
                >
                  Room Service
                </v-btn>
                <v-btn
                  size="x-small"
                  color="error"
                  variant="outlined"
                  @click="$emit('report-maintenance', room)"
                >
                  Report Maintenance
                </v-btn>

                <v-btn
                  v-if="authUser?.staffRole === 'maid' && room.state === 'needs_room_service'"
                  size="x-small"
                  color="primary"
                  @click="$emit('mark-service-done', room)"
                >
                  Complete Room Service
                </v-btn>
                <v-menu v-if="authUser?.staffRole === 'admin'">
                  <template v-slot:activator="{ props }">
                    <v-btn size="x-small" color="primary" v-bind="props">Assign</v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="cleaner in cleaners"
                      :key="cleaner.uid"
                      @click="$emit('assign-cleaner', room, cleaner.uid)"
                    >
                      <v-list-item-title>{{ cleaner.email }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div v-if="rooms.length === 0" class="pa-6 text-center">
        <p class="text-grey">No rooms require cleaning</p>
      </div>
    </v-card>
  </div>
</template>

<script setup>
defineProps({
  authUser: {
    type: Object,
    default: null
  },
  rooms: {
    type: Array,
    required: true
  },
  cleaners: {
    type: Array,
    required: true
  },
  getCleanerEmail: {
    type: Function,
    required: true
  },
  getCleaningColor: {
    type: Function,
    required: true
  },
  capitalize: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  }
});

defineEmits([
  "mark-cleaned",
  "mark-needs-cleaning",
  "mark-room-service",
  "report-maintenance",
  "mark-service-done",
  "assign-cleaner"
]);
</script>

<style scoped>
.table-card {
  max-width: 100%;
  overflow-x: auto;
  width: 100%;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  min-width: 260px;
  max-width: 360px;
}

.table-card :deep(table) {
  min-width: 820px;
}

@media (max-width: 720px) {
  .table-card {
    padding: 0.5rem !important;
  }

  .action-buttons {
    min-width: 220px;
  }

  .action-buttons :deep(.v-btn) {
    min-height: 34px;
    white-space: normal;
  }
}
</style>
