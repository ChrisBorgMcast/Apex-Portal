# Apex Portal

A Vue 3 hotel management and booking application built for the Client-side Scripting II assignment.

## Main Features

- Firebase email/password authentication with profile image upload.
- Role-based access for customers, admins, receptionists, cleaners, maids, and maintenance staff.
- Firestore real-time data for rooms, bookings, users, cleaning tasks, and maintenance issues.
- Pinia stores for authentication, rooms, and bookings.
- Room booking with date validation, paid amenities, updates, cancellation, and Firestore deletion.
- Staff dashboard for booking management, cleaning, maintenance, staff promotion, and room image settings.
- Vuetify UI components, page transitions, list transitions, pagination, and responsive layouts.
- Public HTTP request on the home page for live Malta weather information.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

The production output is generated in `dist`.

## Firebase Hosting

This project includes `firebase.json` for static Firebase Hosting.

```bash
npm run build
firebase login
firebase init hosting
firebase deploy
```

When prompted during hosting setup, use `dist` as the public directory and keep the single-page app rewrite to `index.html`.

## Submission Note

Zip the project without the `node_modules` folder. Run `npm run build` before creating the final zip so the `dist` folder is up to date.
