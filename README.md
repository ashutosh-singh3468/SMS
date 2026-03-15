# Care Pulse - Complete Hospital Appointment Booking Project

Care Pulse is a full-stack hospital appointment booking system built with the finalized stack requested:

- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Authentication:** SMTP Email Verification
- **API Architecture:** RESTful APIs

## Project Structure

```text
SMS/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── schema.sql
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    └── .env.example
```

## Features Implemented

### Authentication
- Register with name, email, and password.
- SMTP-based email verification flow (`/api/auth/verify-email?token=...`).
- Login returns JWT token after verification.

### Patient Dashboard
- Dashboard metrics (total/pending/cancelled appointments).
- View doctors with search and department filter.
- Book appointment (doctor, date, time, symptoms).
- View own appointments.
- Cancel pending appointments.

### Backend API (REST)
- `POST /api/auth/register`
- `GET /api/auth/verify-email`
- `POST /api/auth/login`
- `GET /api/doctors`
- `GET /api/appointments/mine` (auth)
- `POST /api/appointments` (auth)
- `PATCH /api/appointments/:id/cancel` (auth)
- `GET /health`

## Database

### PostgreSQL Mode
Set `DATABASE_URL` in `backend/.env` and run:

```sql
-- from backend/schema.sql
CREATE TABLE users (...);
CREATE TABLE doctors (...);
CREATE TABLE appointments (...);
```

### Memory Fallback Mode
If `DATABASE_URL` is not set, backend automatically runs with in-memory data for quick demo/testing.

## Local Setup

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## SMTP Notes
- Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in `backend/.env`.
- If SMTP is not configured, verification links are printed in backend logs so you can still test end-to-end flows.

## Future Enhancements
- Doctor/admin dashboards with role-based authorization.
- Appointment approval/rejection workflow.
- Notification center and reminder emails.
- Payment integration and reporting.
