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
  orderBy
} from "firebase/firestore";

export const useRoomStore = defineStore("rooms", {
  state: () => ({
    rooms: [],
    loading: false,
    error: null,
    page: 1,
    pageSize: 6,
    unsubscribe: null
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.rooms.length / state.pageSize),
    
    paginatedRooms: (state) => {
      const start = (state.page - 1) * state.pageSize;
      const end = start + state.pageSize;
      return state.rooms.slice(start, end);
    },

    roomCount: (state) => state.rooms.length
  },

  actions: {
    /**
     * Subscribe to real-time room updates from Firestore
     */
    subscribeToRooms() {
      this.loading = true;
      this.error = null;

      try {
        const roomsRef = collection(db, "rooms");
        const q = query(roomsRef, orderBy("name"));

        this.unsubscribe = onSnapshot(q, (snapshot) => {
          this.rooms = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            available: doc.data().available ?? doc.data().availability ?? true
          }));
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
    unsubscribeFromRooms() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },

    /**
     * Add a new room (admin only)
     */
    async createRoom(roomData) {
      this.error = null;

      try {
        const roomsRef = collection(db, "rooms");
        const newRoom = {
          ...roomData,
          createdAt: new Date(),
          createdBy: roomData.createdBy,
          available: roomData.available ?? roomData.availability ?? true,
          // Cleaning and lifecycle status fields
          cleaningStatus: "clean", // clean, dirty, in-progress
          lastCleanedBy: null,
          lastCleanedAt: null,
          needsCleaning: false,
          // room lifecycle state: ready, booked, needs_cleaning, needs_room_service
          state: roomData.state || "ready",
          assignedCleaner: roomData.assignedCleaner || null,
          // Staff-only flag and available amenities for customer to book
          isStaffOnly: roomData.isStaffOnly || false,
          availableAmenities: roomData.availableAmenities || []
        };

        const docRef = await addDoc(roomsRef, newRoom);
        return docRef.id;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    /**
     * Update an existing room (staff only)
     */
    async updateRoom(roomId, roomData) {
      this.error = null;

      try {
        const roomRef = doc(db, "rooms", roomId);
        await updateDoc(roomRef, {
          ...roomData,
          updatedAt: new Date()
        });
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    /**
     * Delete a room (staff only)
     */
    async deleteRoom(roomId) {
      this.error = null;

      try {
        const roomRef = doc(db, "rooms", roomId);
        await deleteDoc(roomRef);
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
