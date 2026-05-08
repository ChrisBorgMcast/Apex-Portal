<template>
  <div>
    <h3 class="mb-6">Settings</h3>

    <v-card class="pa-6 mb-8">
      <h4 class="mb-4">Room Images</h4>

      <v-row>
        <v-col cols="12" md="6">
          <v-select
            :model-value="roomId"
            :items="rooms"
            item-title="name"
            item-value="id"
            label="Select Room or Facility"
            @update:model-value="$emit('update:roomId', $event); $emit('load-image')"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-file-input
            :model-value="imageFile"
            label="Upload Room Image"
            accept="image/*"
            prepend-icon="mdi-image"
            @update:model-value="$emit('update:imageFile', $event); $emit('preview-image')"
          />
        </v-col>
      </v-row>

      <v-img
        v-if="imagePreview"
        :src="imagePreview"
        height="220"
        cover
        class="settings-image-preview mb-4"
      />

      <div class="d-flex gap-2">
        <v-btn
          color="primary"
          :disabled="!roomId || !imagePreview"
          :loading="loading"
          @click="$emit('save-image')"
        >
          Save Image
        </v-btn>
        <v-btn
          color="error"
          variant="outlined"
          :disabled="!roomId"
          :loading="loading"
          @click="$emit('remove-image')"
        >
          Remove Image
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
defineProps({
  rooms: {
    type: Array,
    required: true
  },
  roomId: {
    type: [String, null],
    default: null
  },
  imageFile: {
    type: [Array, Object, null],
    default: null
  },
  imagePreview: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    required: true
  }
});

defineEmits([
  "update:roomId",
  "update:imageFile",
  "load-image",
  "preview-image",
  "save-image",
  "remove-image"
]);
</script>

<style scoped>
.settings-image-preview {
  border-radius: 8px;
}
</style>
