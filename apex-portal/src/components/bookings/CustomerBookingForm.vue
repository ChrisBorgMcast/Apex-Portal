<template>
  <v-card class="booking-form-card pa-6 mb-8">
    <v-card-title>Create New Booking</v-card-title>

    <form @submit.prevent="$emit('submit')">
      <v-select
        v-model="booking.roomId"
        :items="availableRooms"
        item-title="name"
        item-value="id"
        label="Select Room"
        :error-messages="formErrors.roomId ? ['Please select a room'] : []"
        @update:model-value="$emit('room-select')"
      />

      <div v-if="selectedRoom" class="my-4 pa-3 booking-summary rounded">
        <p><strong>Floor:</strong> {{ selectedRoom.floor }}</p>
        <p v-if="amenityPricePerNight > 0">
          <strong>Amenities per night:</strong> €{{ formatMoney(amenityPricePerNight) }}
        </p>
        <p><strong>Price per night:</strong> €{{ selectedRoom.price }}</p>
        <p v-if="nights > 0" class="font-weight-bold">
          <strong>Total:</strong> €{{ formatMoney(bookingTotal) }}
        </p>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="booking.checkIn"
            label="Check-in Date"
            type="date"
            :min="today"
            :error-messages="formErrors.checkIn ? ['Please select a check-in date'] : []"
            @update:model-value="$emit('validate-dates')"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="booking.checkOut"
            label="Check-out Date"
            type="date"
            :min="booking.checkIn || today"
            :error-messages="formErrors.checkOut ? ['Check-out must be after check-in'] : []"
            @update:model-value="$emit('validate-dates')"
          />
        </v-col>
      </v-row>

      <div class="my-4">
        <label class="font-weight-bold mb-2 d-block">Amenities</label>
        <v-checkbox
          v-for="amenity in amenities"
          :key="amenity"
          v-model="booking.amenities"
          :label="getAmenityLabel(amenity)"
          :value="amenity"
        />
      </div>

      <v-btn
        type="submit"
        color="primary"
        :loading="loading"
        :disabled="!isFormValid"
      >
        Create Booking
      </v-btn>
    </form>
  </v-card>
</template>

<script setup>
defineProps({
  amenityPricePerNight: {
    type: Number,
    required: true
  },
  amenities: {
    type: Array,
    required: true
  },
  availableRooms: {
    type: Array,
    required: true
  },
  booking: {
    type: Object,
    required: true
  },
  bookingTotal: {
    type: Number,
    required: true
  },
  formErrors: {
    type: Object,
    required: true
  },
  isFormValid: {
    type: Boolean,
    required: true
  },
  loading: {
    type: Boolean,
    required: true
  },
  nights: {
    type: Number,
    required: true
  },
  selectedRoom: {
    type: Object,
    default: null
  },
  today: {
    type: String,
    required: true
  },
  formatMoney: {
    type: Function,
    required: true
  },
  getAmenityLabel: {
    type: Function,
    required: true
  }
});

defineEmits(["room-select", "submit", "validate-dates"]);
</script>

<style scoped>
.booking-summary {
  background: rgba(var(--v-theme-primary), 0.08);
}

@media (max-width: 599px) {
  .booking-form-card {
    padding: 1rem !important;
  }

  .booking-form-card :deep(.v-btn) {
    width: 100%;
  }
}
</style>
