<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title>Edit Booking</v-card-title>
      <v-card-text v-if="booking">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="booking.checkIn"
              label="Check-in Date"
              type="date"
              :min="today"
              :error-messages="errors.checkIn ? ['Please select a valid check-in date'] : []"
              @update:model-value="$emit('validate')"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="booking.checkOut"
              label="Check-out Date"
              type="date"
              :min="booking.checkIn || today"
              :error-messages="errors.checkOut ? ['Check-out must be after check-in'] : []"
              @update:model-value="$emit('validate')"
            />
          </v-col>
        </v-row>

        <div class="my-4">
          <label class="font-weight-bold mb-2 d-block">Amenities</label>
          <v-checkbox
            v-for="amenity in amenities"
            :key="amenity"
            v-model="booking.amenities"
            :label="getAmenityLabel(amenity, room)"
            :value="amenity"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" :disabled="!isValid" @click="$emit('save')">
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  amenities: {
    type: Array,
    required: true
  },
  booking: {
    type: Object,
    default: null
  },
  errors: {
    type: Object,
    required: true
  },
  isValid: {
    type: Boolean,
    required: true
  },
  modelValue: {
    type: Boolean,
    required: true
  },
  room: {
    type: Object,
    default: null
  },
  today: {
    type: String,
    required: true
  },
  getAmenityLabel: {
    type: Function,
    required: true
  }
});

defineEmits(["save", "update:modelValue", "validate"]);
</script>
