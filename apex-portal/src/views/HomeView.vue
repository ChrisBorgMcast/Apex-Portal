<template>
  <v-container class="home-view">
    <section class="home-hero">
      <div>
        <p class="eyebrow">{{ authStore.isStaff ? "Staff Operations" : "Apex Hotel" }}</p>
        <h1>{{ title }}</h1>
        <p class="hero-copy">{{ subtitle }}</p>

        <div class="hero-actions">
          <v-btn
            v-if="authStore.isStaff"
            color="primary"
            to="/staff"
          >
            Open Dashboard
          </v-btn>
          <v-btn
            v-else
            color="primary"
            to="/rooms"
          >
            Browse Rooms
          </v-btn>
          <v-btn
            v-if="authStore.isLoggedIn && !authStore.isStaff"
            variant="outlined"
            to="/bookings"
          >
            My Bookings
          </v-btn>
        </div>
      </div>

      <div class="status-orbit" aria-hidden="true">
        <span class="pulse-ring"></span>
        <div class="status-core">
          <strong>{{ authStore.isStaff ? roomStore.roomCount : availableRoomCount }}</strong>
          <span>{{ authStore.isStaff ? "rooms tracked" : "rooms ready" }}</span>
        </div>
      </div>
    </section>

    <section v-if="authStore.isStaff" class="quick-grid">
      <v-card color="surface" class="pa-5">
        <p class="metric-label">Active Bookings</p>
        <p class="metric-value">{{ bookingStore.activeBookings.length }}</p>
      </v-card>
      <v-card color="surface" class="pa-5">
        <p class="metric-label">Cleaning Tasks</p>
        <p class="metric-value">{{ cleaningCount }}</p>
      </v-card>
      <v-card color="surface" class="pa-5">
        <p class="metric-label">Maintenance Issues</p>
        <p class="metric-value">{{ maintenanceCount }}</p>
      </v-card>
    </section>

    <section v-else class="quick-grid">
      <v-card color="surface" class="pa-5">
        <p class="metric-label">Available Rooms</p>
        <p class="metric-value">{{ availableRoomCount }}</p>
      </v-card>
      <v-card color="surface" class="pa-5">
        <p class="metric-label">Malta Weather</p>
        <p class="metric-value">{{ weatherLabel }}</p>
        <p class="metric-text">{{ weatherStatus }}</p>
      </v-card>
      <v-card color="surface" class="pa-5">
        <p class="metric-label">Easy Booking</p>
        <p class="metric-text">Choose a room, pick dates, add amenities, and confirm.</p>
      </v-card>
    </section>
  </v-container>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRoomStore } from "@/stores/roomStore";
import { useBookingStore } from "@/stores/bookingStore";

const authStore = useAuthStore();
const roomStore = useRoomStore();
const bookingStore = useBookingStore();
const weather = ref(null);
const weatherLoading = ref(false);
const weatherError = ref("");

const title = computed(() => {
  if (authStore.isStaff) return `Welcome back, ${authStore.user?.name || "team"}`;
  return "Welcome to Apex Hotel Portal";
});

const subtitle = computed(() => {
  if (authStore.isStaff) {
    return "Keep bookings, rooms, cleaning, and maintenance moving from one calm workspace.";
  }
  return "Find a room, choose your amenities, and manage your stay in a few clicks.";
});

const availableRoomCount = computed(() => {
  return roomStore.rooms.filter((room) => room.available && !room.isStaffOnly).length;
});

const cleaningCount = computed(() => {
  return roomStore.rooms.filter((room) => room.needsCleaning || room.state === "needs_cleaning").length;
});

const maintenanceCount = computed(() => {
  return roomStore.rooms.filter((room) => room.needsMaintenance).length;
});

const weatherLabel = computed(() => {
  if (weatherLoading.value) return "...";
  if (!weather.value) return "--";
  return `${Math.round(weather.value.temperature_2m)}°C`;
});

const weatherStatus = computed(() => {
  if (weatherLoading.value) return "Checking current conditions";
  if (weatherError.value) return weatherError.value;
  if (!weather.value) return "Live forecast unavailable";
  return `Wind ${Math.round(weather.value.wind_speed_10m)} km/h near the hotel`;
});

onMounted(() => {
  roomStore.subscribeToRooms();
  if (authStore.isStaff) bookingStore.subscribeToBookings();
  loadWeather();
});

onUnmounted(() => {
  roomStore.unsubscribeFromRooms();
  if (authStore.isStaff) bookingStore.unsubscribeFromBookings();
});

async function loadWeather() {
  weatherLoading.value = true;
  weatherError.value = "";

  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=35.8997&longitude=14.5146&current=temperature_2m,wind_speed_10m"
    );

    if (!response.ok) {
      throw new Error("Weather request failed");
    }

    const data = await response.json();
    weather.value = data.current;
  } catch (error) {
    weatherError.value = "Could not load live weather";
  } finally {
    weatherLoading.value = false;
  }
}
</script>

<style scoped>
.home-view {
  max-width: 1120px;
}

.home-hero {
  align-items: center;
  display: grid;
  gap: 2rem;
  grid-template-columns: minmax(0, 1fr) 260px;
  min-height: 360px;
  padding: 3rem 0;
}

.eyebrow {
  color: rgb(var(--v-theme-accent));
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

h1 {
  font-size: 3rem;
  line-height: 1.05;
  margin: 0 0 1rem;
}

.hero-copy {
  color: rgba(var(--v-theme-on-background), 0.72);
  font-size: 1.1rem;
  max-width: 620px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.status-orbit {
  align-items: center;
  display: flex;
  height: 240px;
  justify-content: center;
  position: relative;
}

.pulse-ring {
  animation: pulse 2.4s ease-in-out infinite;
  border: 2px solid rgba(var(--v-theme-accent), 0.5);
  border-radius: 50%;
  height: 190px;
  position: absolute;
  width: 190px;
}

.status-core {
  align-items: center;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  height: 150px;
  justify-content: center;
  width: 150px;
}

.status-core strong {
  font-size: 2.4rem;
}

.status-core span,
.metric-label,
.metric-text {
  color: rgba(var(--v-theme-on-surface), 0.68);
}

.quick-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

@keyframes pulse {
  0% {
    opacity: 0.45;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.45;
    transform: scale(0.9);
  }
}

@media (max-width: 760px) {
  .home-hero,
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .home-hero {
    min-height: auto;
    padding: 2rem 0 1rem;
  }

  h1 {
    font-size: 2.2rem;
  }

  .status-orbit {
    height: 180px;
  }

  .pulse-ring {
    height: 150px;
    width: 150px;
  }

  .status-core {
    height: 120px;
    width: 120px;
  }

  .status-core strong {
    font-size: 2rem;
  }
}

@media (max-width: 420px) {
  h1 {
    font-size: 1.9rem;
  }

  .hero-actions :deep(.v-btn) {
    width: 100%;
  }
}
</style>
