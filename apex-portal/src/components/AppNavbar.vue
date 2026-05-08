<template>
  <v-app-bar color="primary" dark>
    <v-app-bar-title class="app-title">Apex Hotel Portal</v-app-bar-title>

    <v-spacer />

    <div v-if="mdAndUp" class="nav-links">
      <v-btn
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        color="surface"
        variant="text"
      >
        {{ item.title }}
      </v-btn>
    </div>

    <v-menu v-else>
      <template v-slot:activator="{ props }">
        <v-btn icon color="surface" variant="text" v-bind="props" aria-label="Open navigation">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <template v-if="authStore.isLoggedIn">
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn color="surface" variant="text" v-bind="props" class="profile-button mx-2">
            <v-avatar size="28" class="me-2">
              <v-img
                v-if="authStore.user.profileImage"
                :src="authStore.user.profileImage"
                alt="Profile image"
              />
              <span v-else>{{ userInitial }}</span>
            </v-avatar>
            <span v-if="smAndUp" class="profile-name">{{ authStore.user.name || authStore.user.email }}</span>
            <span v-if="authStore.isStaff && mdAndUp" class="text-caption ms-2">({{ authStore.user.staffRole }})</span>
          </v-btn>
        </template>
        <v-list>
          <v-list-item disabled>
            <v-list-item-title>{{ authStore.user.email }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="profileDialog = true">
            <v-list-item-title>Change Profile Image</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="logout">
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

  </v-app-bar>

  <v-dialog v-model="profileDialog" max-width="460">
    <v-card>
      <v-card-title>Profile Image</v-card-title>
      <v-card-text>
        <div class="d-flex align-center ga-4 mb-4">
          <v-avatar size="72">
            <v-img
              v-if="profilePreview || authStore.user?.profileImage"
              :src="profilePreview || authStore.user.profileImage"
              alt="Profile image preview"
            />
            <span v-else>{{ userInitial }}</span>
          </v-avatar>
          <div>
            <div class="font-weight-bold">{{ authStore.user?.name || authStore.user?.email }}</div>
            <div class="text-caption text-grey">Used in the account menu and staff lists.</div>
          </div>
        </div>

        <v-file-input
          v-model="profileImageFile"
          label="Choose new profile image"
          accept="image/*"
          prepend-icon="mdi-camera"
          @update:model-value="previewProfileImage"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="closeProfileDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!profilePreview"
          :loading="authStore.loading"
          @click="saveProfileImage"
        >
          Save Image
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="2500"
  >
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useDisplay } from "vuetify";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();
const { mdAndUp, smAndUp } = useDisplay();
const profileDialog = ref(false);
const profileImageFile = ref(null);
const profilePreview = ref(null);
const snackbar = ref({
  show: false,
  message: "",
  color: "success"
});

const userInitial = computed(() => {
  const label = authStore.user?.name || authStore.user?.email || "?";
  return label.charAt(0).toUpperCase();
});

const canAccessRooms = computed(() => {
  if (!authStore.isStaff) return true;
  return ["admin", "receptionist"].includes(authStore.user?.staffRole);
});

const navItems = computed(() => {
  const items = [{ title: "Home", to: "/" }];

  if (!authStore.isLoggedIn) {
    return [
      ...items,
      { title: "Login", to: "/login" },
      { title: "Register", to: "/register" }
    ];
  }

  if (canAccessRooms.value) {
    items.push({ title: "Rooms", to: "/rooms" });
  }

  if (!authStore.isStaff) {
    items.push({ title: "My Bookings", to: "/bookings" });
  }

  if (authStore.isStaff) {
    items.push({ title: "Staff Dashboard", to: "/staff" });
  }

  return items;
});

function getSelectedProfileImageFile() {
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
  const file = getSelectedProfileImageFile();
  profilePreview.value = file ? await readFileAsDataUrl(file) : null;
}

function closeProfileDialog() {
  profileDialog.value = false;
  profileImageFile.value = null;
  profilePreview.value = null;
}

async function saveProfileImage() {
  if (!profilePreview.value) return;

  try {
    await authStore.updateProfileImage(profilePreview.value);
    snackbar.value = {
      show: true,
      message: "Profile image updated",
      color: "success"
    };
    closeProfileDialog();
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error updating profile image",
      color: "error"
    };
  }
}

async function logout() {
  await authStore.logout();
  router.push("/login");
}
</script>

<style scoped>
.app-title {
  min-width: 0;
}

.nav-links {
  align-items: center;
  display: flex;
  gap: 0.25rem;
}

.profile-button {
  max-width: min(34vw, 320px);
}

.profile-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 599px) {
  .app-title :deep(.v-app-bar-title__content) {
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-button {
    min-width: 44px;
    padding-inline: 0.35rem;
  }
}
</style>
