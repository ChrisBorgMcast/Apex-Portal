<template>
  <v-container class="auth-view py-8" max-width="500">
    <v-card class="auth-card pa-6" color="surface">
      <v-card-title>Register</v-card-title>

      <form @submit.prevent="handleRegister">
        <v-text-field
          v-model="name"
          label="Full Name"
          :error-messages="v$.name.$errors.map(e => e.$message)"
          @blur="v$.name.$touch"
        />

        <v-text-field
          v-model="email"
          label="Email"
          :error-messages="v$.email.$errors.map(e => e.$message)"
          @blur="v$.email.$touch"
        />

        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          :error-messages="v$.password.$errors.map(e => e.$message)"
          @blur="v$.password.$touch"
        />

        <v-file-input
          v-model="profileImageFile"
          label="Profile Image"
          accept="image/*"
          prepend-icon="mdi-camera"
          :error-messages="v$.profileImageFile.$errors.map(e => e.$message)"
          @blur="v$.profileImageFile.$touch"
          @update:model-value="previewProfileImage"
        />

        <v-avatar v-if="profileImagePreview" size="96" class="mb-4">
          <v-img :src="profileImagePreview" alt="Profile preview" />
        </v-avatar>

        <v-alert v-if="authStore.error" type="error" class="mb-4">
          {{ authStore.error }}
        </v-alert>

        <v-btn
          type="submit"
          color="primary"
          block
          :loading="authStore.loading"
          :disabled="v$.$invalid"
        >
          Register
        </v-btn>
      </form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required, email as emailRule, minLength } from "@vuelidate/validators";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const profileImageFile = ref(null);
const profileImagePreview = ref(null);

const rules = computed(() => ({
  name: { required },
  email: { required, email: emailRule },
  password: { required, minLength: minLength(6) },
  profileImageFile: { required }
}));

const v$ = useVuelidate(rules, { name, email, password, profileImageFile });

function getSelectedImageFile() {
  return Array.isArray(profileImageFile.value)
    ? profileImageFile.value[0]
    : profileImageFile.value;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function previewProfileImage() {
  const file = getSelectedImageFile();
  profileImagePreview.value = file ? await readFileAsDataUrl(file) : null;
}

async function handleRegister() {
  const valid = await v$.value.$validate();

  if (!valid) return;

  const file = getSelectedImageFile();
  const profileImage = file ? await readFileAsDataUrl(file) : null;

  await authStore.register(name.value, email.value, password.value, profileImage);
  router.push("/rooms");
}
</script>

<style scoped>
.auth-view {
  padding-top: clamp(1.5rem, 6vw, 4rem) !important;
}

.auth-card {
  margin-inline: auto;
  width: 100%;
}

@media (max-width: 599px) {
  .auth-view {
    padding-inline: 0.75rem !important;
  }

  .auth-card {
    padding: 1rem !important;
  }
}
</style>
