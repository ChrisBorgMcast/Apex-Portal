<template>
  <v-dialog
    :model-value="modelValue"
    max-width="400"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <Transition name="delete-pop">
      <v-card v-if="modelValue">
        <v-card-title>Cancel Booking?</v-card-title>
        <v-card-text>
          <p class="mb-3">
            This will delete <strong>{{ roomName }}</strong> from Firestore.
          </p>
          <v-alert type="warning" variant="tonal">
            Confirm only if the guest no longer needs this booking.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="$emit('update:modelValue', false)">Keep</v-btn>
          <v-btn color="error" @click="$emit('confirm')">
            Delete Booking
          </v-btn>
        </v-card-actions>
      </v-card>
    </Transition>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  roomName: {
    type: String,
    required: true
  }
});

defineEmits(["confirm", "update:modelValue"]);
</script>

<style scoped>
.delete-pop-enter-active,
.delete-pop-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.delete-pop-enter-from,
.delete-pop-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
}
</style>
