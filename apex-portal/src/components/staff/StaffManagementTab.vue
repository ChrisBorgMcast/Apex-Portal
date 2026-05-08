<template>
  <div>
    <h3 class="mb-6">Staff Management</h3>

    <v-alert type="info" variant="tonal" class="mb-8">
      Register the person as a normal user first, then promote them here. This keeps Firebase from switching the current admin session into the new account.
    </v-alert>

    <h3 class="mb-6 mt-6">Promote Existing User</h3>

    <v-card class="pa-6 mb-8">
      <form @submit.prevent="$emit('promote-user')">
        <v-row>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="promoteUser.email"
              label="Existing User Email"
              type="email"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="promoteUser.staffRole"
              :items="staffRoles"
              label="New Staff Role"
              required
            />
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-btn
              type="submit"
              color="primary"
              :loading="promoteLoading"
              class="mt-4"
            >
              Promote User
            </v-btn>
          </v-col>
        </v-row>
      </form>
    </v-card>

    <h3 class="mb-4">All Staff Members</h3>

    <v-card class="staff-table-card">
      <v-table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="staff in staffMembers" :key="staff.uid">
            <td>{{ staff.email }}</td>
            <td>
              <v-chip
                :color="getRoleColor(staff.staffRole)"
                text-color="white"
                size="small"
              >
                {{ capitalize(staff.staffRole) }}
              </v-chip>
            </td>
            <td>{{ formatDate(staff.createdAt) }}</td>
            <td>
              <div class="d-flex gap-2">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn size="x-small" color="info" v-bind="props">
                      Change Role
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="role in staffRoles"
                      :key="role.value"
                      @click="$emit('change-role', staff, role.value)"
                    >
                      <v-list-item-title>{{ role.title }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <v-btn
                  v-if="canDeleteStaff(staff)"
                  size="x-small"
                  color="error"
                  @click="$emit('delete-staff', staff.uid)"
                >
                  Delete
                </v-btn>
                <v-chip v-else size="x-small" color="grey">Protected</v-chip>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div v-if="staffMembers.length === 0" class="pa-6 text-center">
        <p class="text-grey">No staff members found</p>
      </div>
    </v-card>

    <v-dialog :model-value="deleteDialog" max-width="400" @update:model-value="$emit('update:deleteDialog', $event)">
      <v-card>
        <v-card-title>Delete Staff Member?</v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ staffToDelete?.email }}</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="$emit('update:deleteDialog', false)">Cancel</v-btn>
          <v-btn color="error" @click="$emit('confirm-delete')">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  staffMembers: {
    type: Array,
    required: true
  },
  staffRoles: {
    type: Array,
    required: true
  },
  promoteUser: {
    type: Object,
    required: true
  },
  promoteLoading: {
    type: Boolean,
    required: true
  },
  deleteDialog: {
    type: Boolean,
    required: true
  },
  staffToDelete: {
    type: Object,
    default: null
  },
  currentUser: {
    type: Object,
    default: null
  },
  capitalize: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  getRoleColor: {
    type: Function,
    required: true
  }
});

function canDeleteStaff(staff) {
  return staff.staffRole !== "admin" && staff.uid !== props.currentUser?.uid;
}

defineEmits([
  "promote-user",
  "change-role",
  "delete-staff",
  "confirm-delete",
  "update:deleteDialog"
]);
</script>

<style scoped>
.staff-table-card {
  max-width: 100%;
  overflow-x: auto;
  width: 100%;
}

.staff-table-card :deep(table) {
  min-width: 680px;
}

@media (max-width: 720px) {
  .staff-table-card :deep(.v-btn),
  .staff-table-card :deep(.v-chip) {
    min-height: 32px;
    white-space: normal;
  }
}
</style>
