<template>
  <v-container class="auth-view py-8" max-width="500">
    <v-card class="auth-card pa-6" color="surface">
      <v-card-title>Login</v-card-title>

      <v-form @submit.prevent="handleLogin">
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
          Login
        </v-btn>
      </v-form>
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

const email = ref("");
const password = ref("");

const rules = computed(() => ({
  email: { required, email: emailRule },
  password: { required, minLength: minLength(6) }
}));

const v$ = useVuelidate(rules, { email, password });

async function handleLogin() {
  const valid = await v$.value.$validate();

  if (!valid) return;

  await authStore.login(email.value, password.value);

  if (authStore.isStaff) {
    router.push("/staff");
  } else {
    router.push("/rooms");
  }
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
