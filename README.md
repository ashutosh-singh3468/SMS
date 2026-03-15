# Care Pulse - Professional Hospital Portal (Static + Node.js)

Care Pulse is now redesigned as a professional, hospital-themed web portal with role-based dashboards and practical healthcare workflows.

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Node.js built-in `http` server (zero dependency)
- **Data mode:** In-memory (demo-friendly)

> SMTP/email verification has been removed for now as requested.

## Role-Based Modules

### Patient Dashboard
- Search doctors by name/specialization/department
- Book appointments with symptoms and visit type
- View and cancel pending appointments
- Medical history section for completed/cancelled/rejected cases
- Personalized patient stats on dashboard

### Doctor Workspace
- View assigned appointments and patient details
- Update appointment status (Approved/Rejected/Completed/Reschedule Requested)
- Add quick clinical notes while updating status
- Manage availability slots
- Doctor-focused stats on dashboard

### Admin Overview
- System-wide insights (users, doctors, appointments, pending load)
- Access to overall operational metrics

### Profile & Notifications
- Editable user profile (name, phone, age, gender, blood group, bio)
- Notification center for appointment and workflow updates

## Design Highlights

- Hospital-themed modern UI with glassmorphism panels
- Animated background orbs and smooth view transitions
- Responsive layout for desktop and mobile
- Professional color system and role-focused content blocks

## Run

```bash
cd backend
node src/server.js
```

Open: `http://localhost:4000`

## Demo Accounts

- Doctor: `doctor1@carepulse.com` / `doctor123`
- Admin: `admin@carepulse.com` / `admin123`

You can create patient accounts from the registration form.
