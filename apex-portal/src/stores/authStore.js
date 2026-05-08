import { defineStore } from "pinia";
import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    initialized: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isStaff: (state) => state.user?.role === "staff",
    isCustomer: (state) => state.user?.role === "customer"
  },

  actions: {
    async register(name, email, password, profileImage = null) {
      this.loading = true;
      this.error = null;

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userData = {
          uid: userCredential.user.uid,
          name: name,
          email: userCredential.user.email,
          role: "customer",
          staffRole: null, // Only set for staff users
          profileImage,
          createdAt: new Date()
        };

        await setDoc(doc(db, "users", userCredential.user.uid), userData);

        this.user = userData;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(email, password) {
      this.loading = true;
      this.error = null;

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

        if (userDoc.exists()) {
          this.user = userDoc.data();
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createStaffUser(name, email, password, staffRole) {
      this.loading = true;
      this.error = null;

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userData = {
          uid: userCredential.user.uid,
          name: name,
          email: userCredential.user.email,
          role: "staff",
          staffRole: staffRole, // admin, receptionist, or cleaner
          createdAt: new Date()
        };

        await setDoc(doc(db, "users", userCredential.user.uid), userData);

        return userData;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      await signOut(auth);
      this.user = null;
    },

    async updateProfileImage(profileImage) {
      if (!this.user?.uid) return;

      this.loading = true;
      this.error = null;

      try {
        await updateDoc(doc(db, "users", this.user.uid), {
          profileImage,
          profileImageUpdatedAt: new Date()
        });

        this.user = {
          ...this.user,
          profileImage,
          profileImageUpdatedAt: new Date()
        };
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    init() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (firebaseUser) => {
          // When auth state changes, attach a real-time listener to the user's Firestore doc
          if (this._userUnsub) {
            this._userUnsub();
            this._userUnsub = null;
          }

          if (firebaseUser) {
            const userRef = doc(db, "users", firebaseUser.uid);
            this._userUnsub = onSnapshot(userRef, (snap) => {
              if (snap.exists()) {
                this.user = snap.data();
              }
              this.initialized = true;
              resolve();
            });
          } else {
            this.user = null;
            this.initialized = true;
            resolve();
          }
        });
      });
    }
  }
});
