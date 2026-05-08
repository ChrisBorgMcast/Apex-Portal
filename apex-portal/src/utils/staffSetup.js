import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

/**
 * Manually promote a user to staff role
 * Usage: setUserAsStaff("user-email@example.com")
 */
export async function setUserAsStaff(userEmail) {
  try {
    // Query would be needed here - for now, you need to know the UID
    // Better approach: use the UID directly
    console.warn("Use setUserAsStaffByUID(uid) for direct UID-based updates");
    throw new Error("Use setUserAsStaffByUID(uid) instead");
  } catch (error) {
    console.error("Error setting user as staff:", error);
    throw error;
  }
}

/**
 * Set a user as staff using their UID
 * @param {string} uid - User's Firebase UID
 */
export async function setUserAsStaffByUID(uid) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      role: "staff"
    });
    console.log(`User ${uid} promoted to staff`);
  } catch (error) {
    console.error("Error promoting user to staff:", error);
    throw error;
  }
}

/**
 * Get a user's UID from Firestore by email
 * Note: Requires a compound index on users collection by email
 */
export async function getUserUIDByEmail(email) {
  try {
    const { getDocs, query, where, collection } = await import("firebase/firestore");
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error(`No user found with email: ${email}`);
    }
    
    return querySnapshot.docs[0].id;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
}

// Quick setup: Log current user info to console
export function logCurrentUserInfo() {
  console.log("To promote a user to staff, use:");
  console.log("1. Get the UID from Firebase Console → Firestore → users collection");
  console.log("2. Run in console: setUserAsStaffByUID('the-uid-here')");
  console.log("3. Or import and use: import { setUserAsStaffByUID } from '@/utils/staffSetup'");
}
