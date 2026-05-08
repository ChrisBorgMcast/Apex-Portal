import { defineStore } from "pinia";
import { db } from "@/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy
} from "firebase/firestore";

export const useBookingStore = defineStore("bookings", {
  state: () => ({
    bookings: [],
    loading: false,
    error: null,
    page: 1,
    pageSize: 8,
    unsubscribe: null
  }),

  getters: {
    /**
     * Get bookings for the current user
     */
    customerBookings: (state) => (userId) => {
      return state.bookings.filter((booking) => booking.customerId === userId);
    },

    /**
     * Get all bookings (for staff)
     */
    allBookings: (state) => state.bookings,

    /**
     * Get active bookings that still need front-desk attention
     */
    activeBookings: (state) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return state.bookings.filter(
        (booking) =>
          ["confirmed", "checked_in"].includes(booking.status) &&
          new Date(booking.checkOut) >= today
      );
    },

    /**
     * Get total bookings count
     */
    bookingCount: (state) => state.bookings.length,

    totalPages: (state) => Math.ceil(state.bookings.length / state.pageSize),

    paginatedBookings: (state) => {
      const start = (state.page - 1) * state.pageSize;
      const end = start + state.pageSize;
      return state.bookings.slice(start, end);
    }
  },

  actions: {
    /**
     * Subscribe to real-time booking updates from Firestore
     */
    subscribeToBookings() {
      this.loading = true;
      this.error = null;

      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, orderBy("checkIn", "desc"));

        this.unsubscribe = onSnapshot(q, (snapshot) => {
          this.bookings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Ensure dates are proper format
            checkIn: doc.data().checkIn?.toDate?.() || doc.data().checkIn,
            checkOut: doc.data().checkOut?.toDate?.() || doc.data().checkOut
          }));
          this.loading = false;
        }, (error) => {
          this.error = error.message;
          this.loading = false;
        });
      } catch (error) {
        this.error = error.message;
        this.loading = false;
      }
    },

    /**
     * Subscribe to customer's bookings only
     */
    subscribeToCustomerBookings(customerId) {
      this.loading = true;
      this.error = null;

      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("customerId", "==", customerId));

        this.unsubscribe = onSnapshot(q, (snapshot) => {
          this.bookings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            checkIn: doc.data().checkIn?.toDate?.() || doc.data().checkIn,
            checkOut: doc.data().checkOut?.toDate?.() || doc.data().checkOut
          })).sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
          this.loading = false;
        }, (error) => {
          this.error = error.message;
          this.loading = false;
        });
      } catch (error) {
        this.error = error.message;
        this.loading = false;
      }
    },

    /**
     * Unsubscribe from real-time updates
     */
    unsubscribeFromBookings() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },

    /**
     * Create a new booking
     */
    async createBooking(bookingData) {
      this.error = null;
      this.loading = true;

      try {
        const bookingsRef = collection(db, "bookings");
        const newBooking = {
          ...bookingData,
          createdAt: new Date(),
          status: "confirmed"
        };

        const docRef = await addDoc(bookingsRef, newBooking);
        return docRef.id;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Update an existing booking
     */
    async updateBooking(bookingId, bookingData) {
      this.error = null;

      try {
        const bookingRef = doc(db, "bookings", bookingId);
        await updateDoc(bookingRef, {
          ...bookingData,
          updatedAt: new Date()
        });
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    /**
     * Cancel a booking by deleting it from Firestore
     */
    async cancelBooking(bookingId) {
      this.error = null;
      this.loading = true;

      try {
        const bookingRef = doc(db, "bookings", bookingId);
        await deleteDoc(bookingRef);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Delete a booking permanently
     */
    async deleteBooking(bookingId) {
      this.error = null;

      try {
        const bookingRef = doc(db, "bookings", bookingId);
        await deleteDoc(bookingRef);
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    /**
     * Set pagination page
     */
    setPage(pageNumber) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.page = pageNumber;
      }
    },

    /**
     * Reset to first page
     */
    resetPage() {
      this.page = 1;
    }
  }
});
