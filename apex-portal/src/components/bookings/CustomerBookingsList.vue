<template>
  <div>
    <h3 class="mb-4">Your Bookings</h3>

    <div v-if="bookings.length === 0" class="text-center py-8">
      <p class="text-grey">No bookings yet. Create one above!</p>
    </div>

    <transition-group name="booking" tag="div" class="space-y-4">
      <v-card
        v-for="booking in bookings"
        :key="booking.id"
        class="booking-card pa-6"
      >
        <v-row>
          <v-col cols="12" md="8">
            <h4>{{ getRoomName(booking.roomId) }}</h4>
            <p><strong>Check-in:</strong> {{ formatDate(booking.checkIn) }}</p>
            <p><strong>Check-out:</strong> {{ formatDate(booking.checkOut) }}</p>
            <p><strong>Nights:</strong> {{ calculateNights(booking.checkIn, booking.checkOut) }}</p>

            <div v-if="booking.amenities && booking.amenities.length">
              <strong>Amenities:</strong>
              <div class="mt-2">
                <v-chip
                  v-for="amenity in booking.amenities"
                  :key="amenity"
                  size="small"
                  class="me-2"
                >
                  {{ getAmenityTitle(amenity) }}
                </v-chip>
              </div>
            </div>

            <v-chip :color="getStatusColor(booking.status)" class="mt-3">
              {{ capitalize(booking.status) }}
            </v-chip>
          </v-col>

          <v-col cols="12" md="4" class="d-flex flex-column justify-end">
            <p class="text-h6 font-weight-bold mb-4">
              €{{ booking.totalPrice || "N/A" }}
            </p>

            <div class="d-flex gap-2 flex-wrap">
              <v-btn
                v-if="canEditBooking(booking)"
                size="small"
                @click="$emit('edit', booking)"
              >
                Edit
              </v-btn>

              <v-btn
                size="small"
                color="error"
                @click="$emit('cancel', booking)"
              >
                Cancel
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </transition-group>
  </div>
</template>

<script setup>
defineProps({
  bookings: {
    type: Array,
    required: true
  },
  calculateNights: {
    type: Function,
    required: true
  },
  canEditBooking: {
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
  },
  getAmenityTitle: {
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

defineEmits(["cancel", "edit"]);
</script>

<style scoped>
.booking-enter-active,
.booking-leave-active {
  transition: all 0.4s ease;
}

.booking-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.booking-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

@media (max-width: 599px) {
  .booking-card {
    padding: 1rem !important;
  }

  .booking-card :deep(.v-btn) {
    flex: 1 1 100%;
  }

  .booking-card :deep(.v-chip) {
    margin-bottom: 0.35rem;
  }
}
</style>
