# Padh.ai Backend Roadmap

This document outlines a strategic roadmap for transitioning the Padh.ai backend from its current mock implementation to a robust, production-ready system.

## Guiding Principles

- **Iterative Development:** We will replace mock services one by one, ensuring the application remains functional at each stage.
- **Schema-Driven:** The `database/schemas/schema.sql` file is our source of truth for the data model. Services should be built to interact with this schema.
- **Security First:** Authentication and authorization are the foundation. We will build this service first.

---

## Phase 1: Building the Authentication Service (`auth-service`)

This is the most critical first step. The goal is to replace the mock `auth-service` with a real service that connects to the PostgreSQL database.

### Key Steps:

1.  **Establish Database Connection:**
    -   In the `services/auth-service` directory, add a Node.js PostgreSQL client library (e.g., `pg`).
    -   Update the service's configuration to read database credentials from environment variables (provided by `docker-compose.yaml`).
    -   Implement logic to connect to the `padhaidb` database.

2.  **Implement User Registration (`POST /api/auth/register`):**
    -   Create a new route and handler for user registration.
    -   The handler should receive user data (email, password, name).
    -   **Password Hashing:** Use a library like `bcrypt` to securely hash the user's password before storing it.
    -   Insert the new user record into the `users` table in the database.

3.  **Implement User Login (`POST /api/auth/login`):**
    -   Update the existing `/login` route.
    -   Fetch the user from the database by email.
    -   Use `bcrypt` to compare the provided password with the stored hash.
    -   **Token Generation:** If the credentials are valid, generate a JWT (JSON Web Token) access token and a refresh token. The `jsonwebtoken` library is a good choice.
    -   Return the tokens to the client. The frontend is already set up to handle them.

4.  **Implement Token Refresh (`POST /api/auth/refresh`):**
    -   Create a route to handle token refreshes.
    -   This endpoint will receive a valid refresh token and issue a new access token. This allows users to stay logged in without having to re-enter their credentials.

5.  **Secure the API Gateway:**
    -   The `api-gateway` will be responsible for validating JWTs on incoming requests.
    -   Create a middleware in the API gateway that checks for a valid access token in the `Authorization` header.
    -   Protect routes for other services (e.g., `/api/pdfs/*`, `/api/notifications/*`) by applying this middleware. Requests without a valid token should be rejected.

---

## Phase 2: Core Feature Implementation

Once authentication is solid, you can start building the core application features.

1.  **PDF Hosting & Management (`pdf-hosting-service`):**
    -   This service seems to be partially implemented in Go. The next step is to connect it to the database.
    -   It should handle uploading, storing, and serving PDF files.
    -   The database schema includes tables like `content` and `courses`. This service should create records in these tables when a new PDF is uploaded, linking the content to a user and potentially a course.

2.  **Course & Content Service (New Service):**
    -   The schema (`courses`, `modules`, `lessons`) suggests a rich content structure. A dedicated service should manage this.
    -   **Functionality:** Create, Read, Update, and Delete (CRUD) operations for courses, modules, and lessons.
    -   This service will be used by the frontend to display course content and by instructors/admins to create it.

---

## Phase 3: Expanding Functionality

With the core in place, you can build out the more advanced, real-time features.

1.  **Notification Service (`notification-service`):**
    -   Replace the mock Go service with a real implementation.
    -   **Real-time Communication:** Use WebSockets (the frontend is already configured with `socket.io-client`).
    -   **Message Broker:** For a scalable system, use a message broker like Redis (a `redis` service is already defined in `docker-compose.yaml`). Other services can publish events to Redis (e.g., "new quiz result"), and the notification service will listen for these events, process them, and push notifications to the correct users via WebSockets.

2.  **Future Services:**
    -   The database schema includes tables for `hackathons`, `faculty_profiles`, and `components`. Each of these can be built out as a dedicated microservice when the time comes.
    -   By following this phased approach, you can systematically build a large-scale, maintainable, and secure application.
