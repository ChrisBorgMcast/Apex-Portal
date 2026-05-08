<template>
  <div>
    <h3 class="mb-4">Maintenance</h3>

    <v-alert
      v-if="authUser?.staffRole === 'admin' && rooms.length"
      type="warning"
      variant="tonal"
      class="mb-6"
    >
      <div class="font-weight-bold mb-2">Maintenance Notifications</div>
      <div>{{ rooms.length }} room issue{{ rooms.length === 1 ? "" : "s" }} need attention.</div>
    </v-alert>

    <v-card class="pa-4 mb-6 table-card">
      <v-table>
        <thead>
          <tr>
            <th>Room</th>
            <th>Floor</th>
            <th>Status</th>
            <th>Note</th>
            <th>Reported</th>
            <th>Assigned</th>
            <th>Cleared</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in rooms" :key="room.id">
            <td>{{ room.name }}</td>
            <td>{{ room.floor }}</td>
            <td>
              <v-chip :color="getMaintenanceColor(room)" size="small">
                {{ getMaintenanceLabel(room) }}
              </v-chip>
            </td>
            <td class="maintenance-note">{{ room.maintenanceNote || "No note provided" }}</td>
            <td>
              <div>{{ room.maintenanceReportedBy || "staff" }}</div>
              <div class="text-caption text-grey">{{ formatDate(room.maintenanceReportedAt) }}</div>
            </td>
            <td>
              <v-menu v-if="authUser?.staffRole === 'admin' && maintenanceStaff.length">
                <template v-slot:activator="{ props }">
                  <v-btn size="x-small" color="primary" variant="outlined" v-bind="props">
                    {{ getAssignedMaintenanceEmail(room.assignedMaintenance) || "Assign" }}
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="staff in maintenanceStaff"
                    :key="staff.uid"
                    @click="$emit('assign-maintenance', room, staff.uid)"
                  >
                    <v-list-item-title>{{ staff.email }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <span v-else>{{ getAssignedMaintenanceEmail(room.assignedMaintenance) || "Unassigned" }}</span>
            </td>
            <td>
              <div v-if="room.maintenanceStatus === 'cleared'">
                <div>{{ room.maintenanceClearedBy || "maintenance" }}</div>
                <div class="text-caption text-grey">{{ formatDate(room.maintenanceClearedAt) }}</div>
              </div>
              <span v-else>Pending</span>
            </td>
            <td>
              <div class="action-buttons">
                <v-btn
                  v-if="authUser?.staffRole === 'maintenance' && room.maintenanceStatus !== 'cleared'"
                  size="x-small"
                  color="success"
                  @click="$emit('mark-cleared', room)"
                >
                  Mark Fixed
                </v-btn>
                <v-btn
                  v-if="canReopenRoom && room.maintenanceStatus === 'cleared'"
                  size="x-small"
                  color="success"
                  @click="$emit('approve', room)"
                >
                  Reopen Room
                </v-btn>
                <v-btn
                  v-if="authUser?.staffRole === 'admin'"
                  size="x-small"
                  color="error"
                  variant="outlined"
                  @click="$emit('edit-note', room)"
                >
                  Edit Note
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div v-if="rooms.length === 0" class="pa-6 text-center">
        <p class="text-grey">No maintenance issues reported</p>
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
  canReopenRoom: {
    type: Boolean,
    required: true
  },
  maintenanceStaff: {
    type: Array,
    default: () => []
  },
  getAssignedMaintenanceEmail: {
    type: Function,
    required: true
  },
  getMaintenanceColor: {
    type: Function,
    required: true
  },
  getMaintenanceLabel: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  }
});

defineEmits(["mark-cleared", "approve", "edit-note", "assign-maintenance"]);
</script>

<style scoped>
.table-card {
  max-width: 100%;
  overflow-x: auto;
  width: 100%;
}

.maintenance-note {
  min-width: 220px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  min-width: 220px;
  max-width: 320px;
}

.table-card :deep(table) {
  min-width: 900px;
}

@media (max-width: 720px) {
  .table-card {
    padding: 0.5rem !important;
  }

  .maintenance-note {
    min-width: 180px;
  }

  .action-buttons :deep(.v-btn) {
    min-height: 34px;
    white-space: normal;
  }
}
</style>
