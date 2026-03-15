# Care Pulse — Hospital Appointment Booking System

## Introduction
In today’s fast-paced digital world, hospitals and clinics still face challenges in managing patient appointments efficiently. Traditional appointment booking methods often lead to long waiting times, scheduling conflicts, and poor record management.

**Care Pulse** is a web-based hospital appointment booking system designed to solve these problems by allowing patients to book appointments online while enabling hospital staff to manage doctors, schedules, and patient data in a secure and organized way.

## Finalized Technology Stack
- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Authentication & Security:** SMTP Email Verification
- **API Architecture:** RESTful APIs

## Objectives
- Provide an online platform for patients to book hospital appointments easily.
- Reduce waiting time and manual workload in hospitals.
- Manage doctor schedules and appointment slots efficiently.
- Maintain patient and appointment records securely in a database.
- Provide a responsive and visually appealing user interface.

## Scope
- Patient registration and login with email verification.
- View available doctors and their schedules.
- Online appointment booking and cancellation.
- Admin management of doctors, departments, and appointment slots.
- Secure storage and retrieval of patient and appointment data.
- Scalable architecture for future additions such as notifications, reports, and payments.

## System Overview
The proposed system follows a **client-server architecture**:
- A React + Tailwind frontend for responsive dashboards.
- A Node.js + Express backend exposing RESTful APIs.
- PostgreSQL for reliable relational data storage.
- SMTP-based email verification for secure onboarding and authentication support.

## Patient Dashboard
### Main Sections
- Dashboard Home (Welcome + Quick Actions)
- My Profile (View & Edit details)
- View Doctors (List + Search + Book button)
- Book Appointment (doctor, date, time, symptoms)
- My Appointments (status + Cancel/Reschedule)
- Medical History (past records)
- Notifications (approval/rejection/reminders)

### Layout
- **Top Navbar:** Patient Name | Notifications | Logout
- **Left Sidebar:** Dashboard | Profile | Doctors | Book Appointment | My Appointments | Medical History
- **Main Area:** Dynamic content panel

### Key Features
- Filter doctors by department/specialization
- Online appointment booking and management
- Appointment status: Pending / Approved / Rejected
- Profile management
- Symptom input at booking time
- Search doctors
- Responsive design

## Doctor Dashboard
### Core Elements
- **Today’s Schedule:** Patient name, time slot, appointment type
- **Appointment Calendar:** Date-wise Accepted / Pending / Cancelled views
- **Patient Details:** Age, gender, previous visit history, notes/diagnosis
- **Appointment Actions:** Accept / Reject / Mark Completed / Request Reschedule
- **Availability Settings:** Set available days, manage slots, request leave
- **Notifications:** New appointment and cancellation alerts

## Project Management and Collaboration
Development workflow is managed through JIRA:
- Epics for major modules (Patient, Doctor, Admin, API layer)
- User stories and tasks for clear ownership
- Kanban/Scrum tracking
- Team-wise assignment and deadline management
- Real-time tracking of bugs, enhancements, and progress

## Team Roles
- **Tejas Upreti:** Team Lead, Admin + Doctor Dashboard developer
- **Mayank Joshi:** Patient Dashboard developer
- **Davesh Pandey:** Authentication & Security developer
- **Megha Karayat:** Database engineer + UI/UX designer

## Advantages
- Saves time for patients and hospital staff
- Reduces manual scheduling errors
- Improves user experience with responsive UI
- Ensures secure and reliable data handling
- Easy to scale and maintain

## Conclusion
The Hospital Appointment Booking System is a practical solution for modern healthcare scheduling. Using React.js, Tailwind CSS, Node.js, Express.js, PostgreSQL, and SMTP-based verification, the platform improves operational efficiency and patient satisfaction while remaining extensible for future enhancements.
