<template>
  <v-container>
    <h2 class="mb-6">Rooms</h2>

    <RoomFilters
      v-model:page-size="pageSize"
      v-model:search="search"
      v-model:selected-floor="selectedFloor"
      v-model:status-filter="statusFilter"
      :filtered-count="filteredRooms.length"
      :floor-options="floorOptions"
      :status-options="statusOptions"
      :visible-count="paginatedRooms.length"
    />

    <RoomsGrid
      v-model:page="page"
      :capitalize="capitalize"
      :filtered-count="filteredRooms.length"
      :get-cleaning-color="getCleaningColor"
      :is-staff="authStore.isStaff"
      :rooms="paginatedRooms"
      :staff-role="authStore.user?.staffRole"
      :total-pages="totalPages"
      @book-room="bookRoom"
      @delete-room="confirmDelete"
      @mark-cleaned="markRoomCleaned"
      @mark-needs-cleaning="markRoomNeedsCleaning"
      @mark-needs-maintenance="markRoomNeedsMaintenance"
      @toggle-availability="toggleAvailability"
    />

    <DeleteRoomDialog
      v-model="deleteDialog"
      :room="roomToDelete"
      @confirm="deleteRoomConfirmed"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useRoomStore } from "@/stores/roomStore";
import { useAuthStore } from "@/stores/authStore";
import DeleteRoomDialog from "@/components/rooms/DeleteRoomDialog.vue";
import RoomFilters from "@/components/rooms/RoomFilters.vue";
import RoomsGrid from "@/components/rooms/RoomsGrid.vue";

const router = useRouter();
const roomStore = useRoomStore();
const authStore = useAuthStore();

const deleteDialog = ref(false);
const roomToDelete = ref(null);
const selectedFloor = ref("all");
const statusFilter = ref("all");
const search = ref("");
const page = ref(1);
const pageSize = ref(12);

const snackbar = ref({
  show: false,
  message: "",
  color: "success"
});

const visibleRooms = computed(() => {
  return roomStore.rooms.filter((room) => {
    if (!authStore.isStaff && room.isStaffOnly) return false;
    return true;
  });
});

const floorOptions = computed(() => {
  const floors = [...new Set(visibleRooms.value.map((room) => room.floor))]
    .sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { numeric: true })
    );

  return [
    { title: "All Floors", value: "all" },
    ...floors.map((floor) => ({ title: `Floor ${floor}`, value: floor }))
  ];
});

const statusOptions = [
  { title: "All Rooms", value: "all" },
  { title: "Available", value: "available" },
  { title: "Unavailable", value: "unavailable" },
  { title: "Needs Cleaning", value: "cleaning" },
  { title: "Maintenance", value: "maintenance" },
  { title: "Staff Facilities", value: "staff" }
];

const filteredRooms = computed(() => {
  const searchTerm = search.value?.toLowerCase().trim();

  return visibleRooms.value.filter((room) => {
    if (selectedFloor.value !== "all" && room.floor !== selectedFloor.value) return false;
    if (statusFilter.value === "available" && !room.available) return false;
    if (statusFilter.value === "unavailable" && room.available) return false;
    if (statusFilter.value === "cleaning" && !room.needsCleaning) return false;
    if (statusFilter.value === "maintenance" && !room.needsMaintenance) return false;
    if (statusFilter.value === "staff" && !room.isStaffOnly) return false;

    if (searchTerm) {
      const haystack = `${room.name || ""} ${room.floor || ""}`.toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }

    return true;
  });
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredRooms.value.length / pageSize.value));
});

const paginatedRooms = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRooms.value.slice(start, start + pageSize.value);
});

watch([selectedFloor, statusFilter, search, pageSize], () => {
  page.value = 1;
});

watch(totalPages, () => {
  if (page.value > totalPages.value) page.value = totalPages.value;
});

onMounted(() => {
  roomStore.subscribeToRooms();
});

onUnmounted(() => {
  roomStore.unsubscribeFromRooms();
});

function confirmDelete(room) {
  roomToDelete.value = room;
  deleteDialog.value = true;
}

async function deleteRoomConfirmed() {
  try {
    await roomStore.deleteRoom(roomToDelete.value.id);

    snackbar.value = {
      show: true,
      message: "Room deleted successfully!",
      color: "success"
    };

    deleteDialog.value = false;
    roomToDelete.value = null;
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error deleting room",
      color: "error"
    };
  }
}

async function toggleAvailability(room) {
  if (room.needsMaintenance) {
    snackbar.value = {
      show: true,
      message: "Maintenance issue must be cleared before this room can be opened",
      color: "error"
    };
    return;
  }

  if (!room.available && (room.needsCleaning || room.cleaningStatus === "dirty")) {
    snackbar.value = {
      show: true,
      message: "Room must be cleaned before it can be opened",
      color: "error"
    };
    return;
  }

  try {
    const nextAvailable = !room.available;

    await roomStore.updateRoom(room.id, {
      available: nextAvailable,
      state: nextAvailable ? "ready" : "unavailable"
    });

    snackbar.value = {
      show: true,
      message: `Room marked as ${!room.available ? "available" : "unavailable"}`,
      color: "success"
    };
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error updating room",
      color: "error"
    };
  }
}

async function markRoomCleaned(room) {
  try {
    await roomStore.updateRoom(room.id, {
      cleaningStatus: "clean",
      needsCleaning: false,
      available: !room.needsMaintenance && !room.isStaffOnly,
      state: room.needsMaintenance ? "needs_maintenance" : "ready",
      lastCleanedBy: authStore.user.email,
      lastCleanedAt: new Date()
    });

    snackbar.value = {
      show: true,
      message: "Room marked as cleaned!",
      color: "success"
    };
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error updating room",
      color: "error"
    };
  }
}

async function markRoomNeedsCleaning(room) {
  try {
    await roomStore.updateRoom(room.id, {
      cleaningStatus: "dirty",
      needsCleaning: true,
      available: false,
      state: room.needsMaintenance ? "needs_maintenance" : "needs_cleaning"
    });

    snackbar.value = {
      show: true,
      message: "Room marked as needing cleaning!",
      color: "success"
    };
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error updating room",
      color: "error"
    };
  }
}

async function markRoomNeedsMaintenance(room) {
  try {
    await roomStore.updateRoom(room.id, {
      state: "needs_maintenance",
      available: false,
      needsMaintenance: true,
      maintenanceStatus: "open",
      maintenanceNote: room.maintenanceNote || "Maintenance requested from rooms view",
      maintenanceReportedBy: authStore.user.email,
      maintenanceReportedAt: new Date(),
      maintenanceClearedAt: null,
      maintenanceClearedBy: null,
      maintenanceResolvedAt: null,
      maintenanceResolvedBy: null
    });

    snackbar.value = {
      show: true,
      message: "Room marked as needing maintenance",
      color: "success"
    };
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error updating room",
      color: "error"
    };
  }
}

function getCleaningColor(status) {
  const colors = {
    clean: "green",
    dirty: "red",
    "in-progress": "blue"
  };
  return colors[status] || "grey";
}

function capitalize(str) {
  if (!str) return "";
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function bookRoom(room) {
  router.push({
    name: "bookings",
    query: { roomId: room.id }
  });
}
</script>
