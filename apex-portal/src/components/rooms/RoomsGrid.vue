<template>
  <div>
    <transition-group name="room" tag="div" class="room-grid mb-6">
        <div
          v-for="room in rooms"
          :key="room.id"
        >
          <v-card class="h-100 d-flex flex-column pa-4">
            <v-img
              v-if="room.image"
              :src="room.image"
              height="150"
              cover
              class="room-image mb-3"
            />
            <div v-else class="room-image-placeholder mb-3">
              {{ room.isStaffOnly ? "Staff Facility" : "Room Image" }}
            </div>

            <div class="mb-2">
              <h3 class="text-h6">{{ room.name }}</h3>
              <p class="text-caption text-grey mb-0">Floor {{ room.floor }}</p>
            </div>

            <p v-if="!room.isStaffOnly" class="text-h5 font-weight-bold mb-3">
              €{{ room.price }}/night
            </p>
            <p v-else class="text-caption text-grey mb-3">Staff Area</p>

            <div class="mb-3">
              <v-chip
                :color="room.available ? 'green' : 'red'"
                size="small"
                class="mb-2"
              >
                {{ room.available ? "Available" : "Unavailable" }}
              </v-chip>

              <v-chip
                v-if="isStaff"
                :color="getCleaningColor(room.cleaningStatus)"
                size="small"
                class="mb-2 ms-2"
              >
                {{ capitalize(room.cleaningStatus || "clean") }}
              </v-chip>

              <v-chip
                v-if="room.needsCleaning && isStaff"
                color="orange"
                size="small"
                class="mb-2 ms-2"
              >
                Needs Cleaning
              </v-chip>
            </div>

            <div v-if="room.availableAmenities?.length" class="mb-3">
              <div class="text-caption font-weight-bold mb-1">Amenities:</div>
              <v-chip
                v-for="amenity in room.availableAmenities"
                :key="amenity"
                size="x-small"
                class="me-1"
              >
                {{ capitalize(amenity) }}
              </v-chip>
            </div>

            <div class="mt-auto">
              <div v-if="isStaff" class="d-flex flex-column gap-2">
                <v-btn
                  v-if="staffRole === 'admin'"
                  size="small"
                  variant="outlined"
                  @click="$emit('toggle-availability', room)"
                >
                  Toggle Status
                </v-btn>

                <v-btn
                  v-if="staffRole === 'admin'"
                  size="small"
                  color="error"
                  variant="outlined"
                  @click="$emit('delete-room', room)"
                >
                  Delete
                </v-btn>

                <v-btn
                  v-if="staffRole === 'receptionist'"
                  size="small"
                  variant="outlined"
                  @click="$emit('toggle-availability', room)"
                >
                  Toggle Available
                </v-btn>

                <v-btn
                  v-if="staffRole === 'cleaner' || staffRole === 'maid'"
                  size="small"
                  color="success"
                  variant="outlined"
                  @click="$emit('mark-cleaned', room)"
                >
                  Mark Cleaned
                </v-btn>

                <v-btn
                  v-if="(staffRole === 'cleaner' || staffRole === 'maid') && !room.needsCleaning"
                  size="small"
                  color="warning"
                  variant="outlined"
                  @click="$emit('mark-needs-cleaning', room)"
                >
                  Needs Cleaning
                </v-btn>

                <v-btn
                  v-if="staffRole === 'receptionist' || staffRole === 'admin'"
                  size="small"
                  color="warning"
                  variant="outlined"
                  @click="$emit('mark-needs-cleaning', room)"
                >
                  Needs Cleaning
                </v-btn>

                <v-btn
                  v-if="staffRole === 'receptionist' || staffRole === 'maid' || staffRole === 'admin'"
                  size="small"
                  color="error"
                  variant="outlined"
                  @click="$emit('mark-needs-maintenance', room)"
                >
                  Needs Maintenance
                </v-btn>
              </div>

              <div v-if="!isStaff && room.available && !room.isStaffOnly">
                <v-btn
                  size="small"
                  color="success"
                  class="w-100"
                  @click="$emit('book-room', room)"
                >
                  Book Room
                </v-btn>
              </div>
            </div>
          </v-card>
        </div>
    </transition-group>

    <div v-if="filteredCount === 0" class="text-center py-8">
      <p class="text-grey">No rooms match the selected filters.</p>
    </div>

    <div v-if="totalPages > 1" class="d-flex justify-center align-center ga-3 mb-8">
      <v-btn
        variant="outlined"
        :disabled="page === 1"
        @click="$emit('update:page', page - 1)"
      >
        Previous
      </v-btn>
      <span>Page {{ page }} / {{ totalPages }}</span>
      <v-btn
        variant="outlined"
        :disabled="page === totalPages"
        @click="$emit('update:page', page + 1)"
      >
        Next
      </v-btn>
    </div>
  </div>
</template>

<script setup>
defineProps({
  capitalize: {
    type: Function,
    required: true
  },
  filteredCount: {
    type: Number,
    required: true
  },
  getCleaningColor: {
    type: Function,
    required: true
  },
  isStaff: {
    type: Boolean,
    required: true
  },
  page: {
    type: Number,
    required: true
  },
  rooms: {
    type: Array,
    required: true
  },
  staffRole: {
    type: String,
    default: null
  },
  totalPages: {
    type: Number,
    required: true
  }
});

defineEmits([
  "book-room",
  "delete-room",
  "mark-cleaned",
  "mark-needs-cleaning",
  "mark-needs-maintenance",
  "toggle-availability",
  "update:page"
]);
</script>

<style scoped>
.room-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.room-enter-active,
.room-leave-active {
  transition: all 0.4s ease;
}

.room-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.room-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.room-image,
.room-image-placeholder {
  border-radius: 6px;
}

.room-image-placeholder {
  align-items: center;
  background: #eeeeee;
  color: #666;
  display: flex;
  font-weight: 600;
  height: 150px;
  justify-content: center;
}

@media (max-width: 599px) {
  .room-grid {
    grid-template-columns: 1fr;
  }

  .room-grid :deep(.v-btn) {
    min-height: 40px;
    white-space: normal;
  }
}
</style>
