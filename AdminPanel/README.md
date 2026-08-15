# One Medical Admin Panel - Authentication & Authorization System

A secure, enterprise-grade authentication and authorization framework built with **React**, **TypeScript**, **Firebase Authentication**, **Cloud Firestore**, and **Role-Based Access Control (RBAC)**.

---

## 🔒 Security Overview

- **No Hardcoded Credentials**: Passwords, secrets, and auth tokens are never committed to source control or exposed in frontend code.
- **Firestore User Storage**: Admin profiles and authorization records are persisted securely in the Cloud Firestore `admins` collection (`admins/{uid}`).
- **Primary Admin Full Control**: The primary `admin` / `superadmin` role has full, unrestricted access to all 8 core system modules: Users, Therapists, Appointments, Services, Payments, Reports, Schedules, and System Settings.
- **Mandatory First-Login Password Change**: Provisioned administrators log in with a temporary password (`mustChangePassword: true`), which immediately triggers a mandatory dialog forcing them to establish a new strong password before accessing dashboard data.

---

## 🚀 Local Credential Setup & Initial Admin Provisioning

### 1. Environment Configuration
Create a `.env` file in `AdminPanel/` using `.env.example`:

```bash
VITE_FIREBASE_API_KEY=AIzaSyYourFirebaseApiKeyHere
VITE_FIREBASE_AUTH_DOMAIN=physiotherapy-app-demo.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=physiotherapy-app-demo
VITE_FIREBASE_STORAGE_BUCKET=physiotherapy-app-demo.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:demo1234567890
```

### 2. Provisioning the Initial Admin Account (Backend CLI)
Run the backend provisioning script from `backend/user-service/`:

```bash
cd backend/user-service
INITIAL_ADMIN_EMAIL="admin@physiotherapy.com" INITIAL_ADMIN_PASSWORD="TempAdmin@2026" INITIAL_ADMIN_NAME="Dr. Sarah Smith" npm run seed-admin
```

This script:
1. Creates or updates the user in Firebase Auth.
2. Assigns custom Auth claims (`{ role: 'superadmin', admin: true }`).
3. Saves the initial profile in Firestore under `admins/{uid}` with `mustChangePassword: true`.

---

## 🔑 First Login & Temporary Password Workflow

1. Open the Admin Panel (`npm run dev`).
2. Enter the initial email (e.g. `admin@physiotherapy.com`) and temporary password (e.g. `TempAdmin@2026`).
3. Upon signing in, a modal dialog appears requesting a new password.
4. Enter a new password (min 8 characters, uppercase, lowercase, and number).
5. The system updates Firebase Auth and sets `mustChangePassword: false` in Firestore, granting full dashboard access.

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Role | Access Scope |
| :--- | :--- |
| **`superadmin` / `admin`** | **Full Unrestricted Access** (Users, Therapists, Appointments, Services, Payments, Reports, Schedules, System Settings) |
| **`clinical`** | Clinical operations, Patients, Therapists, Schedules, Programs, Exercise Library |
| **`billing`** | Financial management, Payments, Invoices, Services |
| **`frontdesk`** | Patient intake, Appointments, Schedule management |
| **`auditor`** | Read-only reporting and analytics |

---

## 🌐 Production Deployment Guidelines

1. Set production environment variables in your deployment platform (Vercel, Firebase Hosting, Netlify, Cloud Run).
2. Execute `npm run seed-admin` with secure initial environment variables or service account credentials.
3. Configure Firestore Security Rules to restrict access to `admins/{uid}` exclusively to authenticated admin tokens.
