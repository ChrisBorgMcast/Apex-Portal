<template>
  <v-container class="staff-dashboard">
    <h2 class="mb-6">Staff Dashboard</h2>

    <StaffAlertsPanel
      :alerts="staffAlerts"
      @open-alert="openStaffAlert"
    />

    <!-- TABS -->
    <v-tabs v-model="activeTab" class="staff-tabs mb-6" show-arrows>
      <v-tab v-if="canViewBookings" value="bookings">Booking Management</v-tab>
      <v-tab v-if="canViewCleaning" value="cleaning">{{ isMaidOnly ? "Room Service" : "Cleaning Tasks" }}</v-tab>
      <v-tab v-if="canViewMaintenance" value="maintenance">Maintenance</v-tab>
      <v-tab v-if="authStore.user?.staffRole === 'admin'" value="staff">Staff Management</v-tab>
      <v-tab v-if="authStore.user?.staffRole === 'admin'" value="settings">Settings</v-tab>
    </v-tabs>

    <!-- BOOKINGS TAB -->
    <v-window v-model="activeTab">
      <v-window-item v-if="canViewBookings" value="bookings">
        <BookingManagementTab
          v-model:details-dialog="detailsDialog"
          v-model:filter-status="filterStatus"
          v-model:page="page"
          v-model:search-email="searchEmail"
          :active-bookings="activeBookings"
          :amenity-options="amenityOptions"
          :booking-count="staffBookingCount"
          :booking-edit="bookingEdit"
          :booking-status-options="bookingStatusOptions"
          :booking-update-loading="bookingUpdateLoading"
          :bookings="paginatedBookings"
          :can-manage-front-desk="canManageFrontDesk"
          :capitalize="capitalize"
          :format-date="formatDate"
          :get-amenity-label="getAmenityLabel"
          :get-room-name="getRoomName"
          :get-status-color="getStatusColor"
          :room-count="roomStore.roomCount"
          :selected-booking="selectedBooking"
          :selected-booking-room="selectedBookingRoom"
          :status-options="statusOptions"
          :total-pages="totalPages"
          :total-revenue="totalRevenue"
          :weekly-revenue-range="weeklyRevenueRange"
          @move-status="moveBookingToStatus"
          @save-update="saveBookingUpdate"
          @view-details="viewDetails"
        />
      </v-window-item>

      <v-window-item v-if="canViewCleaning" value="cleaning">
        <CleaningTasksTab
          :auth-user="authStore.user"
          :rooms="cleaningRooms"
          :cleaners="cleanersList"
          :get-cleaner-email="getCleanerEmail"
          :get-cleaning-color="getCleaningColor"
          :capitalize="capitalize"
          :format-date="formatDate"
          @mark-cleaned="markRoomCleaned"
          @mark-needs-cleaning="markNeedsCleaningFromDashboard"
          @mark-room-service="markNeedsRoomService"
          @report-maintenance="openMaintenanceDialog"
          @mark-service-done="markRoomServiceDone"
          @assign-cleaner="assignCleaner"
        />
      </v-window-item>

      <v-window-item value="maintenance">
        <MaintenanceTab
          :auth-user="authStore.user"
          :rooms="maintenanceRooms"
          :can-reopen-room="canReopenMaintenanceRoom"
          :maintenance-staff="maintenanceStaffList"
          :get-assigned-maintenance-email="getStaffEmail"
          :get-maintenance-color="getMaintenanceColor"
          :get-maintenance-label="getMaintenanceLabel"
          :format-date="formatDate"
          @mark-cleared="markMaintenanceCleared"
          @approve="approveMaintenance"
          @edit-note="openMaintenanceDialog"
          @assign-maintenance="assignMaintenance"
        />
      </v-window-item>

      <v-window-item value="staff">
        <StaffManagementTab
          v-model:delete-dialog="deleteDialog"
          :staff-members="staffMembers"
          :staff-roles="staffRoles"
          :promote-user="promoteUser"
          :promote-loading="promoteLoading"
          :staff-to-delete="staffToDelete"
          :current-user="authStore.user"
          :capitalize="capitalize"
          :format-date="formatDate"
          :get-role-color="getRoleColor"
          @promote-user="promoteExistingUser"
          @change-role="changeStaffRole"
          @delete-staff="deleteStaff"
          @confirm-delete="deleteStaffConfirmed"
        />
      </v-window-item>

      <v-window-item value="settings">
        <SettingsTab
          v-model:room-id="settingsRoomId"
          v-model:image-file="settingsRoomImageFile"
          :rooms="roomStore.rooms"
          :image-preview="settingsRoomImagePreview"
          :loading="settingsLoading"
          @load-image="loadSelectedRoomImage"
          @preview-image="previewSettingsRoomImage"
          @save-image="saveRoomImage"
          @remove-image="removeRoomImage"
        />
      </v-window-item>


    </v-window>

    <v-dialog v-model="maintenanceDialog" max-width="520">
      <v-card>
        <v-card-title>Report Maintenance Issue</v-card-title>
        <v-card-text>
          <p v-if="maintenanceRoom" class="mb-4">
            Room: <strong>{{ maintenanceRoom.name }}</strong>
          </p>
          <v-textarea
            v-model="maintenanceNote"
            label="Issue note"
            rows="4"
            auto-grow
            placeholder="Example: Air conditioner leaking, broken light, damaged lock"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="maintenanceDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            :disabled="!maintenanceNote.trim()"
            @click="submitMaintenanceReport"
          >
            Send Report
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR -->
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useBookingStore } from "@/stores/bookingStore";
import { useRoomStore } from "@/stores/roomStore";
import { useAuthStore } from "@/stores/authStore";
import BookingManagementTab from "@/components/staff/BookingManagementTab.vue";
import CleaningTasksTab from "@/components/staff/CleaningTasksTab.vue";
import MaintenanceTab from "@/components/staff/MaintenanceTab.vue";
import SettingsTab from "@/components/staff/SettingsTab.vue";
import StaffAlertsPanel from "@/components/staff/StaffAlertsPanel.vue";
import StaffManagementTab from "@/components/staff/StaffManagementTab.vue";
import { staffRoles, useStaffManagement } from "@/composables/useStaffManagement";
import { useRoomImageSettings } from "@/composables/useRoomImageSettings";
import {
  AMENITY_OPTIONS,
  calculateBookingTotal,
  formatMoney,
  getAmenityPrice
} from "@/utils/bookingPricing";

const bookingStore = useBookingStore();
const roomStore = useRoomStore();
const authStore = useAuthStore();

const activeTab = ref("bookings");
const filterStatus = ref(null);
const searchEmail = ref("");
const page = ref(1);
const pageSize = 10;

const detailsDialog = ref(false);
const selectedBooking = ref(null);
const bookingEdit = ref(null);
const bookingUpdateLoading = ref(false);
const maintenanceDialog = ref(false);
const maintenanceRoom = ref(null);
const maintenanceNote = ref("");

const snackbar = ref({
  show: false,
  message: "",
  color: "success"
});

const {
  staffMembers,
  promoteLoading,
  deleteDialog,
  staffToDelete,
  promoteUser,
  loadStaffMembers,
  promoteExistingUser,
  changeStaffRole,
  deleteStaff,
  deleteStaffConfirmed,
  getRoleColor
} = useStaffManagement(authStore, snackbar, capitalize);

const {
  settingsRoomId,
  settingsRoomImageFile,
  settingsRoomImagePreview,
  settingsLoading,
  loadSelectedRoomImage,
  previewSettingsRoomImage,
  saveRoomImage,
  removeRoomImage
} = useRoomImageSettings(roomStore, authStore, snackbar);

const statusOptions = [
  { title: "All", value: null },
  { title: "Confirmed", value: "confirmed" },
  { title: "Checked In", value: "checked_in" },
  { title: "Checked Out", value: "checked_out" }
];

const bookingStatusOptions = [
  { title: "Confirmed", value: "confirmed" },
  { title: "Checked In", value: "checked_in" },
  { title: "Checked Out", value: "checked_out" }
];

const amenityOptions = AMENITY_OPTIONS;

const canManageFrontDesk = computed(() => {
  return ["admin", "receptionist"].includes(authStore.user?.staffRole);
});

const isMaintenanceOnly = computed(() => authStore.user?.staffRole === "maintenance");
const isMaidOnly = computed(() => authStore.user?.staffRole === "maid");

const canViewBookings = computed(() => {
  return ["admin", "receptionist"].includes(authStore.user?.staffRole);
});

const canViewCleaning = computed(() => {
  return ["admin", "receptionist", "cleaner", "maid"].includes(authStore.user?.staffRole);
});

const canViewMaintenance = computed(() => {
  return ["admin", "maintenance", "receptionist"].includes(authStore.user?.staffRole);
});

watch(
  () => authStore.user?.staffRole,
  (role) => {
    if (role === "maintenance") {
      activeTab.value = "maintenance";
    } else if (role === "maid" || role === "cleaner") {
      activeTab.value = "cleaning";
    }
  },
  { immediate: true }
);

const canReopenMaintenanceRoom = computed(() => {
  return ["admin", "receptionist"].includes(authStore.user?.staffRole);
});

const selectedBookingRoom = computed(() => {
  if (!selectedBooking.value?.roomId) return null;
  return roomStore.rooms.find((r) => r.id === selectedBooking.value.roomId);
});

const maintenanceRooms = computed(() => {
  return roomStore.rooms
    .filter((room) => room.needsMaintenance || room.maintenanceStatus === "cleared")
    .sort((a, b) => new Date(b.maintenanceReportedAt || 0) - new Date(a.maintenanceReportedAt || 0));
});

const activeBookings = computed(() => {
  return bookingStore.activeBookings;
});

const staffBookingCount = computed(() => {
  return bookingStore.allBookings.filter((booking) => booking.status !== "cancelled").length;
});

const filteredBookings = computed(() => {
  let filtered = bookingStore.allBookings.filter((booking) => booking.status !== "cancelled");

  if (filterStatus.value) {
    filtered = filtered.filter((b) => b.status === filterStatus.value);
  }

  if (searchEmail.value) {
    filtered = filtered.filter((b) =>
      b.customerEmail.toLowerCase().includes(searchEmail.value.toLowerCase())
    );
  }

  return filtered.sort(
    (a, b) => new Date(b.checkIn) - new Date(a.checkIn)
  );
});

const paginatedBookings = computed(() => {
  const start = (page.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredBookings.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredBookings.value.length / pageSize);
});

const totalRevenue = computed(() => {
  return bookingStore.allBookings
    .filter((b) => b.status !== "cancelled" && isBookingInCurrentWeek(b))
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
    .toFixed(2);
});

const weeklyRevenueRange = computed(() => {
  const { start, end } = getCurrentWeekRange();
  return `${formatDate(start)} - ${formatDate(end)}`;
});

// Cleaners list and rooms that need attention (needsCleaning OR not cleaned in last 24h)
const cleanersList = computed(() => {
  return staffMembers.value.filter((s) => s.staffRole === "cleaner");
});

const maintenanceStaffList = computed(() => {
  return staffMembers.value.filter((s) => s.staffRole === "maintenance");
});

const cleaningRooms = computed(() => {
  const now = Date.now();
  const role = authStore.user?.staffRole;
  return roomStore.rooms.filter((r) => {
    if (role === "maid") {
      return r.state === "needs_room_service";
    }

    const last = r.lastCleanedAt ? new Date(r.lastCleanedAt).getTime() : 0;
    const needsOld = r.isStaffOnly && (!r.lastCleanedAt || now - last > 24 * 3600 * 1000);
    // include rooms explicitly marked needsCleaning, or rooms with lifecycle state indicating cleaning/service
    return (
      r.needsCleaning ||
      r.state === "needs_cleaning" ||
      r.state === "needs_room_service" ||
      needsOld
    );
  });
});

const staffAlerts = computed(() => {
  const role = authStore.user?.staffRole;
  const uid = authStore.user?.uid;
  const alerts = [];

  if (!role) return alerts;

  roomStore.rooms.forEach((room) => {
    if ((role === "admin" || role === "receptionist") && room.maintenanceStatus === "cleared") {
      alerts.push({
        id: `maintenance-approval-${room.id}`,
        type: "warning",
        tab: "maintenance",
        title: `${room.name} maintenance fixed`,
        message: "Maintenance marked this as fixed. Approval is needed before the room reopens."
      });
    }

    if (role === "admin" && room.needsMaintenance && room.maintenanceStatus !== "cleared") {
      alerts.push({
        id: `maintenance-admin-${room.id}`,
        type: "error",
        tab: "maintenance",
        title: `${room.name} maintenance request`,
        message: room.maintenanceNote || "A staff member reported a maintenance issue."
      });
    }

    if (role === "maintenance" && room.needsMaintenance && room.maintenanceStatus !== "cleared" && (!room.assignedMaintenance || room.assignedMaintenance === uid)) {
      alerts.push({
        id: `maintenance-assigned-${room.id}`,
        type: "error",
        tab: "maintenance",
        title: `${room.name} needs maintenance`,
        message: room.assignedMaintenance === uid ? "Assigned to you." : "Unassigned maintenance request."
      });
    }

    if (role === "cleaner" && room.needsCleaning && (!room.assignedCleaner || room.assignedCleaner === uid)) {
      alerts.push({
        id: `cleaning-${room.id}`,
        type: "info",
        tab: "cleaning",
        title: `${room.name} needs cleaning`,
        message: room.assignedCleaner === uid ? "Assigned to you." : "Unassigned cleaning task."
      });
    }

    if (role === "maid" && room.state === "needs_room_service") {
      alerts.push({
        id: `room-service-${room.id}`,
        type: "info",
        tab: "cleaning",
        title: `${room.name} room service`,
        message: "Room service has been requested for this room."
      });
    }
  });

  return alerts.slice(0, 6);
});

function getCleanerEmail(uid) {
  return getStaffEmail(uid);
}

function getStaffEmail(uid) {
  if (!uid) return "";
  const s = staffMembers.value.find((x) => x.uid === uid);
  return s ? s.email : "";
}

function openStaffAlert(alert) {
  if (alert.tab) {
    activeTab.value = alert.tab;
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
      lastCleanedAt: new Date(),
      assignedCleaner: authStore.user.uid
    });

    snackbar.value = { show: true, message: "Room marked as cleaned!", color: "success" };
  } catch (error) {
    snackbar.value = { show: true, message: "Error marking room cleaned", color: "error" };
  }
}

async function markNeedsCleaningFromDashboard(room) {
  try {
    await roomStore.updateRoom(room.id, {
      cleaningStatus: "dirty",
      needsCleaning: true,
      available: false,
      state: room.needsMaintenance ? "needs_maintenance" : "needs_cleaning",
      requestedBy: authStore.user.email,
      requestedAt: new Date()
    });

    snackbar.value = { show: true, message: "Room marked as needing cleaning!", color: "success" };
  } catch (error) {
    snackbar.value = { show: true, message: "Error marking needs cleaning", color: "error" };
  }
}

async function markNeedsRoomService(room) {
  try {
    await roomStore.updateRoom(room.id, {
      state: "needs_room_service",
      available: false,
      requestedBy: authStore.user.email,
      requestedAt: new Date()
    });

    snackbar.value = { show: true, message: "Room marked for room service", color: "success" };
  } catch (error) {
    snackbar.value = { show: true, message: "Error marking room service", color: "error" };
  }
}

function openMaintenanceDialog(room) {
  maintenanceRoom.value = room;
  maintenanceNote.value = room.maintenanceNote || "";
  maintenanceDialog.value = true;
}

async function submitMaintenanceReport() {
  if (!maintenanceRoom.value || !maintenanceNote.value.trim()) return;

  try {
    await roomStore.updateRoom(maintenanceRoom.value.id, {
      state: "needs_maintenance",
      available: false,
      needsMaintenance: true,
      maintenanceNote: maintenanceNote.value.trim(),
      maintenanceReportedBy: authStore.user.email,
      maintenanceReportedAt: new Date(),
      maintenanceStatus: "open",
      maintenanceClearedAt: null,
      maintenanceClearedBy: null,
      maintenanceResolvedAt: null,
      maintenanceResolvedBy: null
    });

    snackbar.value = {
      show: true,
      message: "Maintenance issue sent to admin",
      color: "success"
    };

    maintenanceDialog.value = false;
    maintenanceRoom.value = null;
    maintenanceNote.value = "";
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error reporting maintenance issue",
      color: "error"
    };
  }
}

async function markMaintenanceCleared(room) {
  try {
    await roomStore.updateRoom(room.id, {
      state: "maintenance_cleared",
      available: false,
      needsMaintenance: true,
      maintenanceStatus: "cleared",
      maintenanceClearedBy: authStore.user.email,
      maintenanceClearedAt: new Date()
    });

    snackbar.value = {
      show: true,
      message: `${room.name} marked as fixed. Admin approval required.`,
      color: "success"
    };
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error marking maintenance fixed",
      color: "error"
    };
  }
}

async function approveMaintenance(room) {
  try {
    await roomStore.updateRoom(room.id, {
      state: room.needsCleaning ? "needs_cleaning" : "ready",
      available: !room.needsCleaning && !room.isStaffOnly,
      needsMaintenance: false,
      maintenanceStatus: "resolved",
      maintenanceResolvedBy: authStore.user.email,
      maintenanceResolvedAt: new Date()
    });

    snackbar.value = {
      show: true,
      message: `${room.name} maintenance approved and room reopened`,
      color: "success"
    };
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error approving maintenance issue",
      color: "error"
    };
  }
}

async function markRoomServiceDone(room) {
  try {
    await roomStore.updateRoom(room.id, {
      state: room.needsMaintenance ? "needs_maintenance" : "ready",
      available: !room.needsMaintenance && !room.isStaffOnly,
      needsCleaning: false,
      cleaningStatus: "clean",
      lastCleanedBy: authStore.user.email,
      lastCleanedAt: new Date()
    });

    snackbar.value = { show: true, message: "Room service completed", color: "success" };
  } catch (error) {
    snackbar.value = { show: true, message: "Error completing room service", color: "error" };
  }
}

async function assignCleaner(room, cleanerUid) {
  try {
    await roomStore.updateRoom(room.id, { assignedCleaner: cleanerUid });
    snackbar.value = { show: true, message: `Assigned ${getCleanerEmail(cleanerUid)} to ${room.name}`, color: "success" };
  } catch (error) {
    snackbar.value = { show: true, message: "Error assigning cleaner", color: "error" };
  }
}

async function assignMaintenance(room, maintenanceUid) {
  try {
    await roomStore.updateRoom(room.id, { assignedMaintenance: maintenanceUid });
    snackbar.value = {
      show: true,
      message: `Assigned ${getStaffEmail(maintenanceUid)} to ${room.name}`,
      color: "success"
    };
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error assigning maintenance staff",
      color: "error"
    };
  }
}

onMounted(() => {
  roomStore.subscribeToRooms();
  if (!isMaintenanceOnly.value) {
    bookingStore.subscribeToBookings();
  }
  if (authStore.isStaff) {
    loadStaffMembers();
  }
});

onUnmounted(() => {
  roomStore.unsubscribeFromRooms();
  bookingStore.unsubscribeFromBookings();
});

function getRoomName(roomId) {
  const room = roomStore.rooms.find((r) => r.id === roomId);
  return room ? room.name : "Unknown Room";
}

function formatDate(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-IE", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function getCurrentWeekRange() {
  const start = new Date();
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function isBookingInCurrentWeek(booking) {
  const bookingDate = booking.createdAt || booking.checkIn;
  const date = bookingDate?.toDate?.() || bookingDate;
  const bookingTime = new Date(date).getTime();

  if (Number.isNaN(bookingTime)) return false;

  const { start, end } = getCurrentWeekRange();
  return bookingTime >= start.getTime() && bookingTime <= end.getTime();
}

function getStatusColor(status) {
  const colors = {
    confirmed: "orange",
    checked_in: "green",
    checked_out: "blue",
    cancelled: "red"
  };
  return colors[status] || "grey";
}

function getCleaningColor(status) {
  const colors = {
    clean: "green",
    dirty: "red",
    "in-progress": "blue"
  };
  return colors[status] || "grey";
}

function getMaintenanceLabel(room) {
  if (room.maintenanceStatus === "cleared") return "Fixed - Admin Review";
  return "Open Issue";
}

function getMaintenanceColor(room) {
  if (room.maintenanceStatus === "cleared") return "blue";
  return "red";
}

function getAmenityLabel(amenity, room) {
  const option = AMENITY_OPTIONS.find((item) => item.value === amenity);
  const price = getAmenityPrice(amenity, room);
  const title = option?.title || capitalize(amenity);
  return price === 0 ? `${title} (included)` : `${title} (+€${formatMoney(price)}/night)`;
}

function capitalize(str) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function viewDetails(booking) {
  selectedBooking.value = booking;
  bookingEdit.value = {
    status: booking.status,
    checkIn: toDateInputValue(booking.checkIn),
    checkOut: toDateInputValue(booking.checkOut),
    amenities: [...(booking.amenities || [])]
  };
  detailsDialog.value = true;
}

function toDateInputValue(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split("T")[0];
}

function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

async function updateRoomForBookingStatus(booking, status) {
  const room = roomStore.rooms.find((r) => r.id === booking.roomId);
  if (!room) return;

  const updatesByStatus = {
    confirmed: {
      available: false,
      state: "booked"
    },
    checked_in: {
      available: false,
      state: "booked",
      cleaningStatus: "clean",
      needsCleaning: false
    },
    checked_out: {
      available: false,
      state: "needs_cleaning",
      cleaningStatus: "dirty",
      needsCleaning: true,
      requestedBy: authStore.user.email,
      requestedAt: new Date()
    },
    cancelled: {
      available: !room.needsMaintenance && !room.needsCleaning && room.cleaningStatus !== "dirty",
      state: room.needsMaintenance
        ? "needs_maintenance"
        : room.needsCleaning || room.cleaningStatus === "dirty"
          ? "needs_cleaning"
          : "ready"
    }
  };

  await roomStore.updateRoom(room.id, updatesByStatus[status]);
}

async function moveBookingToStatus(booking, status) {
  try {
    if (status === "cancelled") {
      await updateRoomForBookingStatus(booking, status);
      await bookingStore.deleteBooking(booking.id);

      snackbar.value = {
        show: true,
        message: "Booking cancelled and deleted",
        color: "success"
      };

      detailsDialog.value = false;
      return;
    }

    const statusPayload = {
      status,
      ...(status === "checked_in" ? { checkedInAt: new Date() } : {}),
      ...(status === "checked_out" ? { checkedOutAt: new Date() } : {})
    };

    await bookingStore.updateBooking(booking.id, statusPayload);
    await updateRoomForBookingStatus(booking, status);

    snackbar.value = {
      show: true,
      message: `Booking marked as ${capitalize(status)}`,
      color: "success"
    };

    detailsDialog.value = false;
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error updating booking status",
      color: "error"
    };
  }
}

async function saveBookingUpdate() {
  if (!selectedBooking.value || !bookingEdit.value) return;

  if (new Date(bookingEdit.value.checkOut) <= new Date(bookingEdit.value.checkIn)) {
    snackbar.value = {
      show: true,
      message: "Check-out must be after check-in",
      color: "error"
    };
    return;
  }

  bookingUpdateLoading.value = true;

  try {
    if (bookingEdit.value.status === "cancelled") {
      await updateRoomForBookingStatus(selectedBooking.value, "cancelled");
      await bookingStore.deleteBooking(selectedBooking.value.id);

      snackbar.value = {
        show: true,
        message: "Booking cancelled and deleted",
        color: "success"
      };

      detailsDialog.value = false;
      return;
    }

    const room = roomStore.rooms.find((r) => r.id === selectedBooking.value.roomId);
    const nights = calculateNights(bookingEdit.value.checkIn, bookingEdit.value.checkOut);
    const totalPrice = room
      ? calculateBookingTotal(room, nights, bookingEdit.value.amenities)
      : selectedBooking.value.totalPrice;

    await bookingStore.updateBooking(selectedBooking.value.id, {
      status: bookingEdit.value.status,
      checkIn: new Date(bookingEdit.value.checkIn),
      checkOut: new Date(bookingEdit.value.checkOut),
      amenities: bookingEdit.value.amenities,
      nights,
      totalPrice,
      managedBy: authStore.user.email,
      managedAt: new Date()
    });

    await updateRoomForBookingStatus(selectedBooking.value, bookingEdit.value.status);

    snackbar.value = {
      show: true,
      message: "Booking updated successfully",
      color: "success"
    };

    detailsDialog.value = false;
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error saving booking update",
      color: "error"
    };
  } finally {
    bookingUpdateLoading.value = false;
  }
}

</script>

<style scoped>
.text-grey {
  color: #666;
}

.text-error {
  color: #d32f2f;
}

.gap-2 {
  gap: 0.5rem;
}

.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.table-card {
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  min-width: 260px;
  max-width: 360px;
}

.action-buttons :deep(.v-btn) {
  min-width: auto;
}

.maintenance-note {
  max-width: 280px;
  white-space: normal;
}

.settings-image-preview {
  border-radius: 6px;
}

.staff-tabs {
  max-width: 100%;
}

.staff-dashboard {
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.staff-dashboard :deep(.v-window),
.staff-dashboard :deep(.v-window__container),
.staff-dashboard :deep(.v-window-item) {
  max-width: 100%;
  min-width: 0;
  overflow: visible;
}

.staff-dashboard :deep(.v-card) {
  max-width: 100%;
  min-width: 0;
}

@media (max-width: 720px) {
  .staff-dashboard {
    padding-inline: 0.75rem;
  }

  .staff-tabs :deep(.v-tab) {
    font-size: 0.78rem;
    min-width: auto;
    padding-inline: 0.75rem;
  }

  .staff-dashboard :deep(.v-window),
  .staff-dashboard :deep(.v-window__container),
  .staff-dashboard :deep(.v-window-item) {
    overflow-x: hidden;
  }
}
</style>
