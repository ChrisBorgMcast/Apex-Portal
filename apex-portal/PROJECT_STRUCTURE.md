# Apex Portal Project Structure

This project is split so the main files are easier to explain during review.

## App Shell

- `src/main.js`
  Starts Vue, Pinia, Router, Vuetify, and Firebase auth initialisation.

- `src/App.vue`
  Main layout shell. It keeps the navbar, route transition, active page, and theme bar.

- `src/plugins/vuetify.js`
  Vuetify setup and all role-based light/dark themes.

## Components

- `src/components/AppNavbar.vue`
  Top navigation. It changes links depending on whether the user is customer, staff, or maintenance.

- `src/components/ThemeBar.vue`
  Bottom comfort-view bar. It switches between light and dark themes.

- `src/components/staff/BookingManagementTab.vue`
  Staff booking table, weekly revenue summary, filters, pagination, and booking details dialog.

- `src/components/staff/CleaningTasksTab.vue`
  Cleaning workflow UI for marking rooms cleaned, marking needs cleaning, assigning cleaners, and reporting maintenance.

- `src/components/staff/MaintenanceTab.vue`
  Maintenance workflow UI for open room issues, maintenance notes, fixed status, and room reopening.

- `src/components/staff/StaffManagementTab.vue`
  Admin staff workflow for promoting existing users, changing staff roles, and deleting staff records.

- `src/components/staff/SettingsTab.vue`
  Admin settings workflow for uploading and removing room images.

## Views

- `src/views/HomeView.vue`
  Landing page. Shows customer/staff dashboard cards and includes the public weather HTTP request.

- `src/views/LoginView.vue`
  Firebase login form using Vuelidate.

- `src/views/RegisterView.vue`
  Firebase registration form using Vuelidate, including required profile image upload.

- `src/views/RoomsView.vue`
  Room browsing and room status management. Includes filters, floors, pagination, cleaning and maintenance actions.

- `src/views/CustomerBookingsView.vue`
  Customer booking workflow. Handles room selection, date validation, amenities, pricing, editing, cancellation, and room availability updates.

- `src/views/StaffDashboardView.vue`
  Staff dashboard orchestrator. It owns the data, store subscriptions, and Firestore actions, then passes each workflow to a smaller staff tab component.

## Stores

- `src/stores/authStore.js`
  Login, registration, Firebase auth state, role data, and user profile image.

- `src/stores/roomStore.js`
  Real-time Firestore room data and room create/update/delete actions.

- `src/stores/bookingStore.js`
  Real-time Firestore booking data and booking create/update/delete actions.

## Utilities

- `src/utils/bookingPricing.js`
  Shared booking and amenity pricing rules.

- `src/utils/staffSetup.js`
  Helper utilities for staff account setup.
