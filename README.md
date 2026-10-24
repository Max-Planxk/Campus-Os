# CampusOS — Unified Campus Operating System

One platform with shared users, roles, and academic data, replacing fragmented spreadsheets, messaging groups, and manual processes.

Built as a **modular monolith**:
- **Backend**: Java 21 / 25, Spring Boot 3, Spring Security (Stateless JWT), Spring Data JPA, H2 Database (PostgreSQL mode)
- **Frontend**: React, Vite, custom design system (off-white base, deep navy text, indigo accents, rounded cards)
- **Database**: Relational schema with primary keys, foreign keys, unique constraints, and indexes.

---

## Quick Start

### 1. Start the Java Backend
```bash
cd backend
mvn spring-boot:run
```
The backend initializes the relational database with realistic university seed data (students, faculty, administrators, lecture halls, courses, timetable slots, clubs, and hackathons).
- API Server: `http://localhost:8080`
- H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:campusosdb`, User: `sa`)

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## Demo Accounts & Official Administrator Credentials

You can toggle between roles instantly in the top bar or sign in directly:
- **System Administrator (Manas)**: `manas123@gmail.com` / `@123456789` (Admin ID: `ADM-MANAS`)
- **Admin**: `admin@campusos.edu` / `admin123` (Dean Marcus Vance, `ADM-001`)
- **Faculty / Staff**: `suraj.khurana@campusos.edu` / `faculty123` (Dr. Suraj Singh Khurana, Staff ID: `23120`)
- **Student**: College ID `CS2023-042` / Date of Birth `2004-03-15` (Alex Rivera)

### Live Database Registration
All registrations (Student, Staff, and Admin) and new users created in the Admin Console are persisted directly into the relational database table `users` with BCrypt-hashed passwords, role security constraints, and relational integrity.

---

## Six Modules Implemented

1. **Dashboard**: Role-tailored metrics, today's schedule, upcoming events, attendance % indicator, admin approvals queue.
2. **Attendance**: Faculty marking sheet with Present/Late/Absent toggles, `POST /api/attendance/sessions/{id}/records`, student compliance reports, and 15-minute QR self check-in.
3. **Timetable**: 5-day weekly grid, color-coded course blocks, faculty and room allocation, and interactive conflict detection engine.
4. **Events**: Workshop & Hackathon registrations, capacity enforcement, duplicate prevention, and organizer attendee lists.
5. **Clubs**: Student societies, membership request flow, club lead approvals, and announcement boards.
6. **Room Booking**: Facility catalog with capacities and equipment, overlap prevention ("Never double-booked"), and administrative approval workflow.
