# Assignment & Submission Management System

A role-based school/college assignment management system with Admin, Teacher, and Student portals. Built with ASP.NET Core 8 Web API backend and Next.js 14 frontend.

## Features

### Admin
- Dashboard with system-wide statistics (users, classes, subjects, assignments, submissions)
- Manage users (create, edit, delete with role-based access)
- Manage classes and sections
- Manage subjects, assign teachers to subjects and classes

### Teacher
- Dashboard with assignment and submission overview
- Create, edit, publish/unpublish, and delete assignments
- View and grade student submissions
- Provide marks and feedback

### Student
- Dashboard with upcoming deadlines and submission status
- View published assignments for enrolled class
- Submit answers with optional file attachments (PDF, DOC, DOCX, XLS, XLSX)
- Update submissions before the deadline
- View grades and feedback from teachers

## Tech Stack

### Backend
- ASP.NET Core 8 Web API
- Entity Framework Core with PostgreSQL
- JWT authentication with role-based authorization (Admin/Teacher/Student)
- Swagger/OpenAPI documentation
- File upload support (10MB limit, .pdf/.doc/.docx/.xls/.xlsx)
- Exception middleware for consistent error handling
- Auto-migration on startup

### Frontend
- Next.js 14 (App Router)
- React 18 with TypeScript
- Tailwind CSS for styling
- Axios HTTP client with JWT interceptor
- Context API for authentication state
- Role-based route protection
- Responsive design

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd submission-system/Backend
   ```

2. Configure the database connection in `appsettings.json` or set environment variables:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=assignment_system;Username=postgres;Password=your_password"
   }
   ```
   Or copy `.env.example` to `.env` in the root:
   ```bash
   cp submission-system/Backend/.env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

3. Run the backend:
   ```bash
   dotnet run
   ```
   The API starts on:
   - HTTP: `http://localhost:5238`
   - HTTPS: `https://localhost:7281`
   - Swagger UI: `http://localhost:5238/swagger`

4. The application auto-migrates the database and seeds demo users on first run.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and configure the API URL:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend runs at `http://localhost:3000`.

## Demo Credentials

| Role    | Login ID      | Password    |
|---------|---------------|-------------|
| Admin   | ADM-26-0001   | Admin@123   |
| Teacher | TCH-26-0001   | Teacher@123 |
| Student | STU-26-0001   | Student@123 |

## API Endpoints

### Authentication
| Method | Endpoint                | Auth       | Description          |
|--------|-------------------------|------------|----------------------|
| POST   | `/api/auth/login`       | Public     | User login           |
| POST   | `/api/auth/register`    | Admin      | Create new user      |
| PUT    | `/api/auth/change-password` | Authenticated | Change password |

### Users
| Method | Endpoint                | Auth       | Description          |
|--------|-------------------------|------------|----------------------|
| GET    | `/api/users`            | Admin      | List all users       |
| GET    | `/api/users/{id}`       | Admin      | Get user by ID       |
| PUT    | `/api/users/{id}`       | Admin      | Update user          |
| DELETE | `/api/users/{id}`       | Admin      | Delete user          |

### Classes
| Method | Endpoint                | Auth       | Description          |
|--------|-------------------------|------------|----------------------|
| GET    | `/api/classes`          | Authenticated | List all classes  |
| GET    | `/api/classes/{id}`     | Authenticated | Get class by ID   |
| POST   | `/api/classes`          | Admin      | Create class         |
| PUT    | `/api/classes/{id}`     | Admin      | Update class         |
| DELETE | `/api/classes/{id}`     | Admin      | Delete class         |

### Subjects
| Method | Endpoint                | Auth       | Description          |
|--------|-------------------------|------------|----------------------|
| GET    | `/api/subjects`         | Authenticated | List all subjects |
| GET    | `/api/subjects/{id}`    | Authenticated | Get subject by ID |
| POST   | `/api/subjects`         | Admin      | Create subject       |
| PUT    | `/api/subjects/{id}`    | Admin      | Update subject       |
| DELETE | `/api/subjects/{id}`    | Admin      | Delete subject       |

### Assignments
| Method | Endpoint                     | Auth       | Description              |
|--------|------------------------------|------------|--------------------------|
| GET    | `/api/assignments`           | Authenticated | List assignments (role-filtered) |
| GET    | `/api/assignments/{id}`      | Authenticated | Get assignment by ID     |
| POST   | `/api/assignments`           | Teacher    | Create assignment        |
| PUT    | `/api/assignments/{id}`      | Teacher    | Update assignment        |
| PUT    | `/api/assignments/{id}/publish` | Teacher | Toggle publish/draft     |
| DELETE | `/api/assignments/{id}`      | Teacher    | Delete assignment        |

### Submissions
| Method | Endpoint                     | Auth       | Description              |
|--------|------------------------------|------------|--------------------------|
| GET    | `/api/submissions`           | Authenticated | List submissions (role-filtered) |
| GET    | `/api/submissions/{id}`      | Authenticated | Get submission by ID     |
| POST   | `/api/submissions`           | Student    | Create submission        |
| PUT    | `/api/submissions/{id}`      | Student    | Update submission        |
| PUT    | `/api/submissions/{id}/grade` | Teacher   | Grade submission         |
| GET    | `/api/submissions/{id}/file` | Authenticated | Download submitted file |

## Project Structure

```
submission-management-system/
├── frontend/                    # Next.js frontend
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── login/           # Login page
│   │   │   └── dashboard/       # Dashboard pages
│   │   │       ├── admin/       # Admin dashboard
│   │   │       ├── teacher/     # Teacher dashboard
│   │   │       └── student/     # Student dashboard
│   │   ├── components/          # Reusable components
│   │   │   └── ui/              # UI primitives
│   │   ├── contexts/            # React contexts
│   │   └── lib/                 # Utilities, types, API
│   ├── package.json
│   └── .env.example
│
├── submission-system/           # ASP.NET Core backend
│   ├── Backend/
│   │   ├── Controllers/         # API controllers
│   │   ├── DTOs/                # Request/Response DTOs
│   │   ├── Models/              # Entity models
│   │   ├── Data/                # DbContext & migrations
│   │   ├── Services/            # Business logic
│   │   └── Properties/          # Launch settings
│   ├── Backend.Tests/           # Unit tests
│   └── .github/workflows/       # CI pipeline
│
├── .env                         # Local environment variables (gitignored)
├── .env.example                 # Environment variable template
└── README.md
```

## Security

- JWT tokens with role-based authorization
- Passwords hashed with BCrypt
- File upload validation (extension + size limits)
- Admin-only endpoints for user/subject/class management
- Teacher-only ownership enforcement for assignments and grading
- Student-only access to own submissions
- `.env` and `appsettings.Development.json` excluded from version control

## Submission

Git repository: [https://github.com/Asgorreaj/submission-system.git](https://github.com/Asgorreaj/submission-system.git)
