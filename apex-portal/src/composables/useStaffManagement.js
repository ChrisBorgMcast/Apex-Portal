import { ref } from "vue";
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/firebase";

export const staffRoles = [
  { title: "Admin", value: "admin" },
  { title: "Receptionist", value: "receptionist" },
  { title: "Cleaner", value: "cleaner" },
  { title: "Maintenance", value: "maintenance" },
  { title: "Maid", value: "maid" }
];

export function useStaffManagement(authStore, snackbar, capitalize) {
  const staffMembers = ref([]);
  const promoteLoading = ref(false);
  const deleteDialog = ref(false);
  const staffToDelete = ref(null);

  const promoteUser = ref({
    email: "",
    staffRole: "receptionist"
  });

  async function loadStaffMembers() {
    try {
      const usersRef = collection(db, "users");
      const staffQuery = query(usersRef, where("role", "==", "staff"));
      const querySnapshot = await getDocs(staffQuery);
      staffMembers.value = querySnapshot.docs
        .map((docSnapshot) => ({
          uid: docSnapshot.id,
          ...docSnapshot.data()
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      snackbar.value = {
        show: true,
        message: "Error loading staff members",
        color: "error"
      };
    }
  }

  async function promoteExistingUser() {
    if (!promoteUser.value.email || !promoteUser.value.staffRole) {
      snackbar.value = {
        show: true,
        message: "Please enter an email and staff role",
        color: "error"
      };
      return;
    }

    promoteLoading.value = true;

    try {
      const usersRef = collection(db, "users");
      const userQuery = query(
        usersRef,
        where("email", "==", promoteUser.value.email.trim())
      );
      const snapshot = await getDocs(userQuery);

      if (snapshot.empty) {
        throw new Error("No registered user found with that email");
      }

      const userDoc = snapshot.docs[0];

      await updateDoc(doc(db, "users", userDoc.id), {
        role: "staff",
        staffRole: promoteUser.value.staffRole,
        promotedBy: authStore.user.email,
        promotedAt: new Date()
      });

      snackbar.value = {
        show: true,
        message: `${promoteUser.value.email} promoted to ${capitalize(promoteUser.value.staffRole)}`,
        color: "success"
      };

      promoteUser.value = {
        email: "",
        staffRole: "receptionist"
      };

      await loadStaffMembers();
    } catch (error) {
      snackbar.value = {
        show: true,
        message: error.message || "Error promoting user",
        color: "error"
      };
    } finally {
      promoteLoading.value = false;
    }
  }

  async function changeStaffRole(staff, newRole) {
    try {
      await updateDoc(doc(db, "users", staff.uid), {
        staffRole: newRole
      });

      snackbar.value = {
        show: true,
        message: `${staff.email} role changed to ${capitalize(newRole)}`,
        color: "success"
      };

      await loadStaffMembers();
    } catch (error) {
      snackbar.value = {
        show: true,
        message: "Error changing staff role",
        color: "error"
      };
    }
  }

  function deleteStaff(uid) {
    const staff = staffMembers.value.find((member) => member.uid === uid);

    if (!staff || staff.staffRole === "admin" || staff.uid === authStore.user?.uid) {
      snackbar.value = {
        show: true,
        message: "Admin accounts cannot be deleted",
        color: "error"
      };
      return;
    }

    staffToDelete.value = staff;
    deleteDialog.value = true;
  }

  async function deleteStaffConfirmed() {
    try {
      if (
        !staffToDelete.value ||
        staffToDelete.value.staffRole === "admin" ||
        staffToDelete.value.uid === authStore.user?.uid
      ) {
        snackbar.value = {
          show: true,
          message: "Admin accounts cannot be deleted",
          color: "error"
        };
        deleteDialog.value = false;
        staffToDelete.value = null;
        return;
      }

      await deleteDoc(doc(db, "users", staffToDelete.value.uid));

      snackbar.value = {
        show: true,
        message: `Staff member ${staffToDelete.value.email} deleted`,
        color: "success"
      };

      deleteDialog.value = false;
      staffToDelete.value = null;
      await loadStaffMembers();
    } catch (error) {
      snackbar.value = {
        show: true,
        message: "Error deleting staff member",
        color: "error"
      };
    }
  }

  function getRoleColor(role) {
    const colors = {
      admin: "blue",
      receptionist: "green",
      cleaner: "orange",
      maintenance: "red",
      maid: "purple"
    };
    return colors[role] || "grey";
  }

  return {
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
  };
}
