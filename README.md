# Assignment & Submission Management System — Backend

ASP.NET Core 8 Web API with JWT auth, PostgreSQL, file uploads, and role-based access.

## Quick Start

```bash
cd Backend
# Edit appsettings.json with your PostgreSQL connection string
dotnet run
```

API runs on `http://localhost:5238` and Swagger at `/swagger`.

## Demo Credentials

| Role | Login ID | Password |
|------|----------|----------|
| Admin | ADM-26-0001 | Admin@123 |
| Teacher | TCH-26-0001 | Teacher@123 |
| Student | STU-26-0001 | Student@123 |

## Tests

```bash
cd Backend.Tests
dotnet test
```

Full project documentation: see root README.md.