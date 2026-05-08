# Apex Portal - Staff Roles System

## User Roles & Permissions

### 1. **Customer** (`role: "customer"`)
- Can view available rooms
- Can create bookings
- Can edit/cancel bookings (before check-in)
- Can view their own bookings
- Access: `/rooms`, `/bookings`

### 2. **Staff - Admin** (`role: "staff"`, `staffRole: "admin"`)
- Full system access
- Can create/edit/delete rooms
- Can view all bookings
- Can manage all rooms including cleaning status
- Can manage other staff
- Access: `/rooms`, `/staff` (Full dashboard)
- Navbar: No "My Bookings", shows "Staff Dashboard"

### 3. **Staff - Receptionist** (`role: "staff"`, `staffRole: "receptionist"`)
- Can toggle room availability (check in/out guests)
- Can view all bookings
- Can see booking details and timeline
- Cannot create/delete rooms
- Cannot manage cleaning
- Access: `/rooms` (view only with availability toggle), `/staff` (bookings view)
- Navbar: No "My Bookings", shows "Staff Dashboard"

### 4. **Staff - Cleaner** (`role: "staff"`, `staffRole: "cleaner"`)
- Can view rooms needing cleaning
- Can mark rooms as cleaned
- Can mark rooms as needing cleaning
- Limited booking visibility (upcoming check-ins only)
- Cannot edit room details or bookings
- Access: `/rooms` (cleaning view only), `/staff` (cleaning tasks only)
- Navbar: No "My Bookings", shows "Staff Dashboard"

---

## Room Status Fields

```javascript
{
  id: "room123",
  name: "Room 101",
  floor: 1,
  price: 100,
  available: true,                  // Can book/check in
  cleaningStatus: "clean",          // clean | dirty | in-progress
  needsCleaning: false,             // Flag for cleaner
  lastCleanedBy: "cleaner@email",   // Email of cleaner
  lastCleanedAt: Timestamp,         // When last cleaned
  createdBy: "admin@email",         // Who created room
  createdAt: Timestamp
}
```

---

## User Profile Fields

```javascript
{
  uid: "firebase-uid",
  email: "user@example.com",
  role: "customer" | "staff",
  staffRole: null | "admin" | "receptionist" | "cleaner",
  profileImage: "base64-string",
  createdAt: Timestamp
}
```

---

## How to Promote/Demote Staff

### Via Firebase Console:
1. Go to Firestore → users collection
2. Find user document
3. Update fields:
   - Set `role: "staff"` 
   - Set `staffRole: "admin"` | `"receptionist"` | `"cleaner"`
4. Refresh app to see changes

### Example Users:

| Email | Password | Role | Staff Type | Purpose |
|-------|----------|------|-----------|---------|
| testguest@example.com | password123 | customer | - | Test booking system |
| testadmin@example.com | admin123456 | staff | admin | Manage rooms & staff |
| receptionist@example.com | recept123 | staff | receptionist | Check in/out guests |
| cleaner@example.com | clean123 | staff | cleaner | Clean & maintain rooms |

---

## Navigation & UI Changes

- **Customers**: See "Rooms" + "My Bookings"
- **Staff**: See "Rooms" + "Staff Dashboard" (no "My Bookings")
- **Navbar shows staff role**: e.g., "testadmin@example.com (admin)"
- **Room actions change by role**: Only see relevant action buttons
- **Add Room form**: Visible only to admins

---

## Future Enhancements

- [ ] Staff task assignment system
- [ ] Cleaning schedule calendar
- [ ] Guest check-in/check-out timestamps
- [ ] Room maintenance history
- [ ] Staff performance metrics
- [ ] Advanced permissions system (custom roles)
