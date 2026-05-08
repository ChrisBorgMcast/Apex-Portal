import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import RoomsView from "@/views/RoomsView.vue";
import CustomerBookingsView from "@/views/CustomerBookingsView.vue";
import StaffDashboardView from "@/views/StaffDashboardView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  {
    path: "/login",
    name: "login",
    component: LoginView
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView
  },
  {
    path: "/rooms",
    name: "rooms",
    component: RoomsView,
    meta: { requiresAuth: true }
  },
  {
    path: "/bookings",
    name: "bookings",
    component: CustomerBookingsView,
    meta: { requiresAuth: true }
  },
  {
    path: "/staff",
    name: "staff",
    component: StaffDashboardView,
    meta: { requiresAuth: true, requiresStaff: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

let authInitialized = false;

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authInitialized) {
    await authStore.init();
    authInitialized = true;
  }

  if (!authStore.initialized) {
    return false;
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return "/login";
  }

  if (to.meta.requiresStaff && !authStore.isStaff) {
    return "/rooms";
  }

  if (
    to.name === "rooms" &&
    authStore.isStaff &&
    !["admin", "receptionist"].includes(authStore.user?.staffRole)
  ) {
    return "/staff";
  }
});

export default router;
