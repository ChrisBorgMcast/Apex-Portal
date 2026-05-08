<template>
  <div>
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center">
          <p class="text-grey">Total Bookings</p>
          <p class="text-h4">{{ bookingCount }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center">
          <p class="text-grey">Active Bookings</p>
          <p class="text-h4 text-success">{{ activeBookings.length }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center">
          <p class="text-grey">Total Rooms</p>
          <p class="text-h4">{{ roomCount }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center">
          <p class="text-grey">Weekly Revenue</p>
          <p class="text-h4 text-primary">€{{ totalRevenue }}</p>
          <p class="text-caption text-grey">{{ weeklyRevenueRange }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="pa-4 mb-6">
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            :model-value="filterStatus"
            :items="statusOptions"
            label="Filter by Status"
            @update:model-value="$emit('update:filterStatus', $event)"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            :model-value="searchEmail"
            label="Search by Customer Email"
            clearable
            @update:model-value="$emit('update:searchEmail', $event)"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card class="booking-table-card">
      <v-table>
        <thead>
          <tr>
            <th>Customer Email</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Nights</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.id">
            <td>{{ booking.customerEmail }}</td>
            <td>{{ getRoomName(booking.roomId) }}</td>
            <td>{{ formatDate(booking.checkIn) }}</td>
            <td>{{ formatDate(booking.checkOut) }}</td>
            <td>{{ booking.nights }}</td>
            <td>€{{ booking.totalPrice }}</td>
            <td>
              <v-chip :color="getStatusColor(booking.status)" size="small">
                {{ capitalize(booking.status) }}
              </v-chip>
            </td>
            <td>
              <div class="d-flex gap-2">
                <v-btn
                  v-if="booking.status === 'confirmed' && canManageFrontDesk"
                  size="x-small"
                  color="info"
                  @click="$emit('move-status', booking, 'checked_in')"
                >
                  Check In
                </v-btn>

                <v-btn
                  v-if="booking.status === 'checked_in' && canManageFrontDesk"
                  size="x-small"
                  color="warning"
                  @click="$emit('move-status', booking, 'checked_out')"
                >
                  Check Out
                </v-btn>

                <v-btn
                  v-if="booking.status !== 'cancelled' && booking.status !== 'checked_out' && canManageFrontDesk"
                  size="x-small"
                  color="error"
                  variant="outlined"
                  @click="$emit('move-status', booking, 'cancelled')"
                >
                  Cancel
                </v-btn>

                <v-btn size="x-small" @click="$emit('view-details', booking)">
                  Details
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <div class="booking-mobile-list">
      <v-card
        v-for="booking in bookings"
        :key="booking.id"
        class="pa-4 booking-mobile-card"
      >
        <div class="d-flex justify-space-between ga-3 mb-3">
          <div class="min-width-0">
            <div class="font-weight-bold text-truncate">{{ booking.customerEmail }}</div>
            <div class="text-caption text-grey">{{ getRoomName(booking.roomId) }}</div>
          </div>
          <v-chip :color="getStatusColor(booking.status)" size="small">
            {{ capitalize(booking.status) }}
          </v-chip>
        </div>

        <div class="booking-mobile-grid">
          <div>
            <span class="text-caption text-grey">Check-in</span>
            <strong>{{ formatDate(booking.checkIn) }}</strong>
          </div>
          <div>
            <span class="text-caption text-grey">Check-out</span>
            <strong>{{ formatDate(booking.checkOut) }}</strong>
          </div>
          <div>
            <span class="text-caption text-grey">Nights</span>
            <strong>{{ booking.nights }}</strong>
          </div>
          <div>
            <span class="text-caption text-grey">Total</span>
            <strong>€{{ booking.totalPrice }}</strong>
          </div>
        </div>

        <div class="booking-mobile-actions">
          <v-btn
            v-if="booking.status === 'confirmed' && canManageFrontDesk"
            size="small"
            color="info"
            @click="$emit('move-status', booking, 'checked_in')"
          >
            Check In
          </v-btn>

          <v-btn
            v-if="booking.status === 'checked_in' && canManageFrontDesk"
            size="small"
            color="warning"
            @click="$emit('move-status', booking, 'checked_out')"
          >
            Check Out
          </v-btn>

          <v-btn
            v-if="booking.status !== 'cancelled' && booking.status !== 'checked_out' && canManageFrontDesk"
            size="small"
            color="error"
            variant="outlined"
            @click="$emit('move-status', booking, 'cancelled')"
          >
            Cancel
          </v-btn>

          <v-btn size="small" @click="$emit('view-details', booking)">
            Details
          </v-btn>
        </div>
      </v-card>
    </div>

    <div class="mt-6 d-flex justify-center">
      <v-btn
        :disabled="page === 1"
        @click="$emit('update:page', Math.max(1, page - 1))"
      >
        Prev
      </v-btn>

      <span class="mx-4">
        Page {{ page }} / {{ totalPages }}
      </span>

      <v-btn
        :disabled="page === totalPages"
        @click="$emit('update:page', Math.min(totalPages, page + 1))"
      >
        Next
      </v-btn>
    </div>

    <v-dialog
      :model-value="detailsDialog"
      max-width="600"
      @update:model-value="$emit('update:detailsDialog', $event)"
    >
      <v-card>
        <v-card-title>Booking Details</v-card-title>
        <v-card-text v-if="selectedBooking">
          <v-row>
            <v-col cols="12" md="6">
              <p><strong>Customer:</strong> {{ selectedBooking.customerEmail }}</p>
              <p><strong>Room:</strong> {{ getRoomName(selectedBooking.roomId) }}</p>
              <p><strong>Status:</strong> {{ capitalize(selectedBooking.status) }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <p><strong>Check-in:</strong> {{ formatDate(selectedBooking.checkIn) }}</p>
              <p><strong>Check-out:</strong> {{ formatDate(selectedBooking.checkOut) }}</p>
              <p><strong>Nights:</strong> {{ selectedBooking.nights }}</p>
            </v-col>
          </v-row>

          <div v-if="selectedBooking.amenities && selectedBooking.amenities.length" class="mt-4">
            <strong>Amenities:</strong>
            <div class="mt-2">
              <v-chip
                v-for="amenity in selectedBooking.amenities"
                :key="amenity"
                size="small"
                class="me-2"
              >
                {{ capitalize(amenity) }}
              </v-chip>
            </div>
          </div>

          <div class="mt-4">
            <p><strong>Total Price:</strong> €{{ selectedBooking.totalPrice }}</p>
          </div>

          <v-divider v-if="canManageFrontDesk" class="my-4" />

          <div v-if="canManageFrontDesk && bookingEdit">
            <h4 class="mb-3">Update Booking</h4>

            <v-select
              v-model="bookingEdit.status"
              :items="bookingStatusOptions"
              label="Booking Status"
              density="compact"
            />

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="bookingEdit.checkIn"
                  label="Check-in Date"
                  type="date"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="bookingEdit.checkOut"
                  label="Check-out Date"
                  type="date"
                  density="compact"
                />
              </v-col>
            </v-row>

            <div class="my-2">
              <label class="text-caption font-weight-bold">Amenities</label>
              <v-checkbox
                v-for="amenity in amenityOptions"
                :key="amenity.value"
                v-model="bookingEdit.amenities"
                :label="getAmenityLabel(amenity.value, selectedBookingRoom)"
                :value="amenity.value"
                density="compact"
                hide-details
              />
            </div>
          </div>

          <div v-if="selectedBooking.status === 'cancelled'" class="mt-4">
            <p class="text-error">
              <strong>Cancelled at:</strong> {{ formatDate(selectedBooking.cancelledAt) }}
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="$emit('update:detailsDialog', false)">Close</v-btn>
          <v-btn
            v-if="canManageFrontDesk"
            color="primary"
            :loading="bookingUpdateLoading"
            @click="$emit('save-update')"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
defineProps({
  activeBookings: {
    type: Array,
    required: true
  },
  amenityOptions: {
    type: Array,
    required: true
  },
  bookingCount: {
    type: Number,
    required: true
  },
  bookingEdit: {
    type: Object,
    default: null
  },
  bookingStatusOptions: {
    type: Array,
    required: true
  },
  bookingUpdateLoading: {
    type: Boolean,
    required: true
  },
  bookings: {
    type: Array,
    required: true
  },
  canManageFrontDesk: {
    type: Boolean,
    required: true
  },
  detailsDialog: {
    type: Boolean,
    required: true
  },
  filterStatus: {
    type: [String, null],
    default: null
  },
  page: {
    type: Number,
    required: true
  },
  roomCount: {
    type: Number,
    required: true
  },
  searchEmail: {
    type: String,
    required: true
  },
  selectedBooking: {
    type: Object,
    default: null
  },
  selectedBookingRoom: {
    type: Object,
    default: null
  },
  statusOptions: {
    type: Array,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  totalRevenue: {
    type: String,
    required: true
  },
  weeklyRevenueRange: {
    type: String,
    required: true
  },
  capitalize: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  getAmenityLabel: {
    type: Function,
    required: true
  },
  getRoomName: {
    type: Function,
    required: true
  },
  getStatusColor: {
    type: Function,
    required: true
  }
});

defineEmits([
  "move-status",
  "save-update",
  "update:detailsDialog",
  "update:filterStatus",
  "update:page",
  "update:searchEmail",
  "view-details"
]);
</script>

<style scoped>
.booking-table-card {
  max-width: 100%;
  overflow-x: auto;
  width: 100%;
}

.booking-table-card :deep(table) {
  min-width: 860px;
}

.booking-mobile-list {
  display: none;
}

.booking-mobile-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.booking-mobile-grid > div {
  display: flex;
  flex-direction: column;
}

.booking-mobile-actions {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 1rem;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 720px) {
  .booking-table-card {
    display: none;
  }

  .booking-mobile-list {
    display: grid;
    gap: 1rem;
  }

  .booking-mobile-actions {
    grid-template-columns: 1fr;
  }
}
</style>
