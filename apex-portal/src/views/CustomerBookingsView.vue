<template>
  <v-container>
    <h2 class="mb-6">My Bookings</h2>

    <CustomerBookingForm
      :amenity-price-per-night="amenityPricePerNight"
      :amenities="amenityValues"
      :available-rooms="availableRooms"
      :booking="newBooking"
      :booking-total="bookingTotal"
      :form-errors="formErrors"
      :format-money="formatMoney"
      :get-amenity-label="getAmenityLabel"
      :is-form-valid="isFormValid"
      :loading="bookingStore.loading"
      :nights="nights"
      :selected-room="selectedRoom"
      :today="today"
      @room-select="onRoomSelect"
      @submit="createNewBooking"
      @validate-dates="validateDates"
    />

    <CustomerBookingsList
      :bookings="userBookings"
      :calculate-nights="calculateNights"
      :can-edit-booking="canEditBooking"
      :capitalize="capitalize"
      :format-date="formatDate"
      :get-amenity-title="getAmenityTitle"
      :get-room-name="getRoomName"
      :get-status-color="getStatusColor"
      @cancel="confirmCancel"
      @edit="editBooking"
    />

    <BookingEditDialog
      v-model="editDialog"
      :amenities="amenityValues"
      :booking="editingBooking"
      :errors="editErrors"
      :get-amenity-label="getAmenityLabel"
      :is-valid="isEditValid"
      :room="editingRoom"
      :today="today"
      @save="saveEdit"
      @validate="validateEditDates"
    />

    <BookingCancelDialog
      v-model="cancelDialog"
      :room-name="getRoomName(bookingToCancel?.roomId)"
      @confirm="cancelBookingConfirmed"
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBookingStore } from "@/stores/bookingStore";
import { useRoomStore } from "@/stores/roomStore";
import { useAuthStore } from "@/stores/authStore";
import BookingCancelDialog from "@/components/bookings/BookingCancelDialog.vue";
import BookingEditDialog from "@/components/bookings/BookingEditDialog.vue";
import CustomerBookingForm from "@/components/bookings/CustomerBookingForm.vue";
import CustomerBookingsList from "@/components/bookings/CustomerBookingsList.vue";
import {
  AMENITY_OPTIONS,
  calculateAmenityTotal,
  calculateBookingTotal,
  formatMoney,
  getAmenityPrice
} from "@/utils/bookingPricing";

const bookingStore = useBookingStore();
const roomStore = useRoomStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const today = new Date().toISOString().split("T")[0];
const amenityValues = AMENITY_OPTIONS.map((option) => option.value);

const newBooking = ref({
  roomId: null,
  checkIn: "",
  checkOut: "",
  amenities: []
});

const editDialog = ref(false);
const editingBooking = ref(null);
const editingBookingId = ref(null);
const editErrors = ref({
  checkIn: false,
  checkOut: false
});

const cancelDialog = ref(false);
const bookingToCancel = ref(null);

const snackbar = ref({
  show: false,
  message: "",
  color: "success"
});

const formErrors = ref({
  roomId: false,
  checkIn: false,
  checkOut: false
});

const userBookings = computed(() => {
  return bookingStore.customerBookings(authStore.user.uid).filter(
    (booking) => booking.status !== "cancelled"
  );
});

const selectedRoom = computed(() => {
  if (!newBooking.value.roomId) return null;
  return roomStore.rooms.find((room) => room.id === newBooking.value.roomId);
});

const availableRooms = computed(() => {
  return roomStore.rooms.filter(
    (room) => room.available && !room.isStaffOnly && !room.needsMaintenance
  );
});

const nights = computed(() => {
  if (!newBooking.value.checkIn || !newBooking.value.checkOut) return 0;
  return calculateNights(newBooking.value.checkIn, newBooking.value.checkOut);
});

const amenityPricePerNight = computed(() => {
  return calculateAmenityTotal(newBooking.value.amenities, selectedRoom.value);
});

const bookingTotal = computed(() => {
  return calculateBookingTotal(
    selectedRoom.value,
    nights.value,
    newBooking.value.amenities
  );
});

const editingRoom = computed(() => {
  if (!editingBooking.value?.roomId) return null;
  return roomStore.rooms.find((room) => room.id === editingBooking.value.roomId);
});

const isFormValid = computed(() => {
  return (
    newBooking.value.roomId &&
    newBooking.value.checkIn &&
    newBooking.value.checkOut &&
    new Date(newBooking.value.checkOut) > new Date(newBooking.value.checkIn)
  );
});

const isEditValid = computed(() => {
  if (!editingBooking.value) return false;
  return (
    editingBooking.value.checkIn &&
    editingBooking.value.checkOut &&
    new Date(editingBooking.value.checkOut) > new Date(editingBooking.value.checkIn) &&
    new Date(editingBooking.value.checkIn) >= new Date(today)
  );
});

onMounted(() => {
  roomStore.subscribeToRooms();
  bookingStore.subscribeToCustomerBookings(authStore.user.uid);
  applySelectedRoomFromRoute();
});

onUnmounted(() => {
  roomStore.unsubscribeFromRooms();
  bookingStore.unsubscribeFromBookings();
});

watch(
  () => route.query.roomId,
  () => {
    applySelectedRoomFromRoute();
  }
);

function onRoomSelect() {
  formErrors.value.roomId = false;
}

function applySelectedRoomFromRoute() {
  const roomId = route.query.roomId;
  if (typeof roomId === "string") {
    newBooking.value.roomId = roomId;
    formErrors.value.roomId = false;
  }
}

function validateDates() {
  formErrors.value.checkIn = !newBooking.value.checkIn;
  formErrors.value.checkOut = !newBooking.value.checkOut;
}

function validateEditDates() {
  if (!editingBooking.value) return;
  editErrors.value.checkIn =
    !editingBooking.value.checkIn ||
    new Date(editingBooking.value.checkIn) < new Date(today);
  editErrors.value.checkOut =
    !editingBooking.value.checkOut ||
    new Date(editingBooking.value.checkOut) <=
      new Date(editingBooking.value.checkIn);
}

async function createNewBooking() {
  if (!isFormValid.value) {
    snackbar.value = {
      show: true,
      message: "Please fill in all required fields",
      color: "error"
    };
    return;
  }

  try {
    const room = selectedRoom.value;
    if (
      !room?.available ||
      room.needsMaintenance ||
      room.needsCleaning ||
      room.isStaffOnly
    ) {
      snackbar.value = {
        show: true,
        message: "This room is no longer available. Please choose another room.",
        color: "error"
      };
      return;
    }

    await bookingStore.createBooking({
      roomId: newBooking.value.roomId,
      customerId: authStore.user.uid,
      customerEmail: authStore.user.email,
      checkIn: new Date(newBooking.value.checkIn),
      checkOut: new Date(newBooking.value.checkOut),
      amenities: newBooking.value.amenities,
      totalPrice: bookingTotal.value,
      nights: nights.value
    });

    await roomStore.updateRoom(room.id, {
      available: false,
      state: "booked",
      reservedBy: authStore.user.uid,
      reservedAt: new Date()
    });

    snackbar.value = {
      show: true,
      message: "Booking created successfully!",
      color: "success"
    };

    newBooking.value = {
      roomId: null,
      checkIn: "",
      checkOut: "",
      amenities: []
    };
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error creating booking",
      color: "error"
    };
  }
}

function canEditBooking(booking) {
  return new Date(booking.checkIn) > new Date();
}

function editBooking(booking) {
  editingBookingId.value = booking.id;
  editingBooking.value = {
    checkIn: formatDateInput(booking.checkIn),
    checkOut: formatDateInput(booking.checkOut),
    amenities: [...(booking.amenities || [])],
    roomId: booking.roomId
  };
  validateEditDates();
  editDialog.value = true;
}

async function saveEdit() {
  validateEditDates();
  if (!isEditValid.value) {
    snackbar.value = {
      show: true,
      message: "Please fix the booking dates before saving",
      color: "error"
    };
    return;
  }

  try {
    const room = roomStore.rooms.find(
      (room) => room.id === editingBooking.value.roomId
    );
    const updatedNights = calculateNights(
      editingBooking.value.checkIn,
      editingBooking.value.checkOut
    );

    await bookingStore.updateBooking(editingBookingId.value, {
      checkIn: new Date(editingBooking.value.checkIn),
      checkOut: new Date(editingBooking.value.checkOut),
      amenities: editingBooking.value.amenities,
      nights: updatedNights,
      totalPrice: calculateBookingTotal(
        room,
        updatedNights,
        editingBooking.value.amenities
      ),
      updatedAt: new Date()
    });

    snackbar.value = {
      show: true,
      message: "Booking updated successfully!",
      color: "success"
    };

    editDialog.value = false;
    editingBooking.value = null;
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error updating booking",
      color: "error"
    };
  }
}

function confirmCancel(booking) {
  bookingToCancel.value = booking;
  cancelDialog.value = true;
}

async function cancelBookingConfirmed() {
  try {
    const cancelledBooking = bookingToCancel.value;
    await bookingStore.cancelBooking(cancelledBooking.id);
    await reopenRoomAfterBookingRemoved(cancelledBooking);

    snackbar.value = {
      show: true,
      message: "Booking deleted. Redirecting to rooms.",
      color: "success"
    };

    cancelDialog.value = false;
    bookingToCancel.value = null;
    router.push("/rooms");
  } catch (error) {
    snackbar.value = {
      show: true,
      message: "Error cancelling booking",
      color: "error"
    };
  }
}

async function reopenRoomAfterBookingRemoved(booking) {
  const room = roomStore.rooms.find((room) => room.id === booking?.roomId);
  if (!room) return;

  await roomStore.updateRoom(room.id, {
    available:
      !room.needsMaintenance &&
      !room.needsCleaning &&
      room.cleaningStatus !== "dirty" &&
      !room.isStaffOnly,
    state: room.needsMaintenance
      ? "needs_maintenance"
      : room.needsCleaning || room.cleaningStatus === "dirty"
        ? "needs_cleaning"
        : "ready",
    reservedBy: null,
    reservedAt: null
  });
}

function getRoomName(roomId) {
  const room = roomStore.rooms.find((room) => room.id === roomId);
  return room ? room.name : "Unknown Room";
}

function formatDate(date) {
  if (!date) return "";
  const formattedDate = date instanceof Date ? date : new Date(date);
  return formattedDate.toLocaleDateString("en-IE", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatDateInput(date) {
  if (date instanceof Date) return date.toISOString().split("T")[0];
  return date;
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

function getStatusColor(status) {
  const colors = {
    confirmed: "green",
    cancelled: "red",
    checked_in: "blue"
  };
  return colors[status] || "grey";
}

function getAmenityTitle(amenity) {
  return (
    AMENITY_OPTIONS.find((option) => option.value === amenity)?.title ||
    capitalize(amenity)
  );
}

function getAmenityLabel(amenity, room = selectedRoom.value) {
  const price = getAmenityPrice(amenity, room);
  const title = getAmenityTitle(amenity);
  return price === 0
    ? `${title} (included)`
    : `${title} (+€${formatMoney(price)}/night)`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
</script>
