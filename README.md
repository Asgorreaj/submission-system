# Assignment & Submission Management System

A role-based school/college assignment management system with Admin, Teacher, and Student portals. Built with an ASP.NET Core 8 Web API backend and a Next.js 14 frontend, for the OnnoRokom Projukti Assistant Software Engineer recruitment task.

## Overview

Admins manage users, classes, and subjects. Teachers create and grade assignments. Students submit work — as text, a file, or both — and track their results. Every account is created by an Admin; there is no public self-registration, so class assignment and role are always set correctly from the start.

## Features

### Admin
- Dashboard with system-wide statistics (users, classes, subjects, assignments, submissions)
- Create, edit, and delete users with role-based access (Admin/Teacher/Student)
- Manage classes and sections
- Manage subjects, and assign teachers to subjects and classes
- Full visibility into all assignments and submissions across the system (monitoring)

### Teacher
- Dashboard with assignment and submission overview
- Create, edit, publish/unpublish, and delete assignments (title, description, deadline, max marks)
- View submissions for their own assignments only (ownership-enforced)
- Grade submissions with marks (capped at the assignment's max marks) and written feedback

### Student
- Dashboard with upcoming deadlines and submission status
- View published assignments for their own enrolled class only
- Submit answers as text, a file attachment (PDF, DOC, DOCX, XLS, XLSX — max 10MB), or both
- Update a submission before the deadline (locked after the deadline or once graded)
- Submissions made after the deadline are automatically marked **Late**
- View grades and feedback from teachers
- Change their own password

## Tech Stack

### Backend
- ASP.NET Core 8 Web API, C#
- Entity Framework Core with PostgreSQL (Npgsql)
- JWT authentication, login via a unique **Login ID** (not email) — role-based authorization (Admin/Teacher/Student)
- Passwords hashed with BCrypt
- Swagger/OpenAPI documentation
- File upload support (10MB limit, .pdf/.doc/.docx/.xls/.xlsx), stored in the database
- Global exception middleware for consistent JSON error responses
- Structured logging (`ILogger`) for auth and key actions
- Auto-migration and demo-data seeding on startup

### Frontend
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS for styling
- Axios HTTP client with JWT interceptor
- Context API for authentication state
- Role-based route protection
- Responsive design

### DevOps
- Docker + Docker Compose (Postgres + Backend + Frontend, one-command local run)
- xUnit test suite (`Backend.Tests`)

## Quick Start (Docker — recommended)

Requires Docker Desktop installed and running.

```bash
git clone https://github.com/Asgorreaj/submission-system.git
cd submission-system
docker compose up --build
```

This starts three containers (PostgreSQL, backend API, frontend). Migrations and demo data are applied automatically on backend startup — no manual setup needed.

- Frontend: `http://localhost:3000`
- Backend Swagger: `http://localhost:8080/swagger`

## Manual Setup (without Docker)

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Configure the database connection in `appsettings.json`, or copy `.env.example` and set environment variables:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=assignment_system;Username=postgres;Password=your_password"
   }
   ```

3. Run the backend:
   ```bash
   dotnet restore
   dotnet run
   ```
   The API starts on:
   - HTTP: `http://localhost:5238`
   - HTTPS: `https://localhost:7281`
   - Swagger UI: `/swagger`

4. The database is auto-migrated and seeded with demo users on first run — no manual migration step required.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and set the API URL:
   ```bash
   cp .env.example .env.local
   # NEXT_PUBLIC_API_URL=https://localhost:7281/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Runs at `http://localhost:3000`.

## Running Tests

```bash
cd Backend.Tests
dotnet test
```
10 tests covering password hashing, role validation, submission ownership, late-submission detection, and update/grading business rules.

## Demo Credentials

| Role    | Login ID      | Password    |
|---------|---------------|-------------|
| Admin   | ADM-26-0001   | Admin@123   |
| Teacher | TCH-26-0001   | Teacher@123 |
| Student | STU-26-0001   | Student@123 |

These accounts (plus a demo class) are seeded automatically every time the backend starts, so the system is usable immediately after setup.

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | User login (by Login ID) |
| POST | `/api/auth/register` | Admin | Create new user |
| PUT | `/api/auth/change-password` | Authenticated | Change own password |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List all users (filter by `?role=`) |
| GET | `/api/users/{id}` | Admin | Get user by ID |
| PUT | `/api/users/{id}` | Admin | Update user |
| DELETE | `/api/users/{id}` | Admin | Delete user |

### Classes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/class` | Authenticated | List all classes |
| GET | `/api/class/{id}` | Authenticated | Get class by ID |
| POST | `/api/class` | Admin | Create class |
| PUT | `/api/class/{id}` | Admin | Update class |
| DELETE | `/api/class/{id}` | Admin | Delete class |

### Subjects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/subject` | Authenticated | List all subjects |
| GET | `/api/subject/{id}` | Authenticated | Get subject by ID |
| POST | `/api/subject` | Admin | Create subject (validates class + teacher exist) |
| PUT | `/api/subject/{id}` | Admin | Update subject |
| DELETE | `/api/subject/{id}` | Admin | Delete subject |

### Assignments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/assignment` | Authenticated | List assignments (role-filtered) |
| GET | `/api/assignment/{id}` | Authenticated | Get assignment by ID |
| POST | `/api/assignment` | Teacher | Create assignment (own subject only) |
| PUT | `/api/assignment/{id}` | Teacher | Update assignment (owner only) |
| PUT | `/api/assignment/{id}/publish` | Teacher | Toggle Draft/Published |
| DELETE | `/api/assignment/{id}` | Teacher | Delete assignment (owner only) |

### Submissions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/submission` | Authenticated | List submissions (role-filtered) |
| GET | `/api/submission/{id}` | Authenticated | Get submission by ID |
| POST | `/api/submission` | Student | Submit answer text and/or file |
| PUT | `/api/submission/{id}` | Student | Update submission (before deadline, not yet graded) |
| PUT | `/api/submission/{id}/grade` | Teacher | Grade submission (marks + feedback) |
| GET | `/api/submission/{id}/file` | Authenticated | Download submitted file |

## Project Structure

```
submission-system/
├── Frontend/                    # Next.js frontend
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── login/           # Login page
│   │   │   └── dashboard/       # Dashboard pages
│   │   │       ├── admin/       # Admin dashboard
│   │   │       ├── teacher/     # Teacher dashboard
│   │   │       └── student/     # Student dashboard
│   │   ├── components/          # Reusable components
│   │   │   └── ui/              # UI primitives
│   │   ├── contexts/            # React contexts (auth state)
│   │   └── lib/                 # Utilities, types, API client
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── Backend/                     # ASP.NET Core Web API
│   ├── Controllers/             # Auth, Users, Class, Subject, Assignment, Submission
│   ├── DTOs/                    # Request/response shapes
│   ├── Models/                  # EF Core entities
│   ├── Services/                # AuthService (hashing, JWT, Login ID generation)
│   ├── Middleware/              # Global exception handling
│   ├── Data/                    # AppDbContext
│   ├── Migrations/              # EF Core migrations
│   ├── Dockerfile
│   └── .env.example
│
├── Backend.Tests/               # xUnit test suite
├── docker-compose.yml           # Runs Postgres + Backend + Frontend together
└── README.md
```

## Key Design Decisions

- **Login by Login ID, not email.** Each user gets an auto-generated, human-readable ID (`ADM-26-0001`, `TCH-26-0001`, `STU-26-0001` — role prefix + year + sequence) used for login instead of email. This makes users easy to identify and search in lists (grading, class rosters) compared to raw database IDs, and sequence numbers reset per calendar year like typical roll-number/ID-card systems.
- **Admin-only account creation.** Public self-registration is disabled. Only an Admin can create Teacher/Student/Admin accounts, and a Class must be assigned when creating a Student. This matches the brief's "Admin: Manage users" responsibility and prevents students from ending up in the wrong class.
- **Files stored in the database, not on disk.** Since the app targets free-tier hosting without persistent disk storage, submission files are stored as bytes (`bytea`) in PostgreSQL rather than the local filesystem, so they survive server restarts and redeploys.
- **Simplified layered architecture.** Complex logic (auth, password hashing, JWT, Login ID generation) lives in a Service layer; simpler CRUD (Class/Subject/Assignment/Submission) is handled directly in controllers via EF Core, keeping the codebase lean within the project timeline.
- **Global exception middleware** returns clean JSON error responses instead of raw stack traces for any unhandled exception.

## Security

- JWT tokens with role-based authorization
- Passwords hashed with BCrypt
- File upload validation (extension allow-list + 10MB size limit)
- Admin-only endpoints for user/subject/class management
- Teacher-only ownership enforcement for assignments and grading
- Student-only access to their own submissions and own class's assignments
- `.env`, `.env.local`, and `appsettings.Development.json` excluded from version control

## Known Limitations / Assumptions

- The seeded demo Admin/Teacher/Student accounts have their password reset to the documented demo values every time the backend restarts (intentional, so the demo credentials above always work for evaluation).
- File upload is limited to PDF, DOC, DOCX, XLS, XLSX (max 10MB) to match common assignment submission formats.
- No email notifications are implemented (out of scope for the project timeline).
- A production system would likely add pagination and rate-limiting on list endpoints; both were left out to focus on core functionality within the deadline.

## Optional Additions Included

- Docker Compose setup for one-command local run of the full stack
- Swagger/OpenAPI documentation
- File upload/download for submissions
- Password change endpoint (self-service, any role)
- Unit test suite (10 tests, xUnit)

## Submission

Git repository: [https://github.com/Asgorreaj/submission-system.git](https://github.com/Asgorreaj/submission-system.git)
