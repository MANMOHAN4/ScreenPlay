# ScreenPlay

ScreenPlay is a full-stack video streaming platform built as an academic project. It offers a Netflix-style experience for viewers (browse, stream, and maintain a personal watchlist) and a management console for administrators (upload, publish, and monitor videos and users). The backend is a stateless REST API built with Spring Boot and secured with JWT; the frontend is a single-page application built with React and Vite.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Application Screenshots](#application-screenshots)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Configuration Reference](#configuration-reference)
9. [REST API Reference](#rest-api-reference)
10. [Data Model](#data-model)
11. [Security Design](#security-design)
12. [Design Documentation](#design-documentation)
13. [Frontend Routes](#frontend-routes)
14. [Author](#author)

---

## Overview

ScreenPlay separates responsibilities into two independently runnable applications:

| Module          | Directory           | Description                                                                                                                                     |
| --------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend API     | `com.screenplay`    | Spring Boot 4 service exposing REST endpoints for authentication, user administration, video management, file upload/streaming, and watchlists. |
| Frontend client | `screenplay-client` | React 19 single-page application with role-aware routing for public visitors, registered users, and administrators.                             |

The platform supports two roles, `USER` and `ADMIN`. Access to every protected resource is enforced on the server through Spring Security and method-level authorization, and mirrored on the client through protected routes.

---

## Key Features

### For Viewers

- Account registration with email verification before first login
- Secure login using JWT bearer tokens
- Forgot-password and reset-password flow delivered by email
- Browse the published video catalogue and featured titles
- In-browser video streaming with trailer playback
- Personal watchlist: add and remove titles at any time
- Profile page and password change

### For Administrators

- Dashboard with platform statistics on videos and users
- Upload videos and poster images with metadata (title, description, year, rating, duration, categories)
- Edit, delete, and publish or unpublish videos
- Monitor all videos and all registered users
- Activate or deactivate accounts, change user roles, create, update, and delete users

### Platform

- Stateless authentication (no server-side sessions)
- BCrypt password hashing
- Time-limited verification and password-reset tokens
- Configurable CORS origins and upload directories
- Global exception handling with meaningful error responses
- Request and form validation on both backend and frontend

---

## Tech Stack

### Backend

| Area        | Technology                           |
| ----------- | ------------------------------------ |
| Language    | Java 21                              |
| Framework   | Spring Boot 4.0.3 (Web MVC)          |
| Persistence | Spring Data JPA / Hibernate          |
| Database    | MySQL                                |
| Security    | Spring Security, JJWT 0.12.3, BCrypt |
| Email       | Spring Boot Starter Mail (SMTP)      |
| Validation  | Spring Boot Starter Validation       |
| Utilities   | Lombok                               |
| Build tool  | Maven (Maven Wrapper included)       |

### Frontend

| Area                 | Technology                                       |
| -------------------- | ------------------------------------------------ |
| Library              | React 19                                         |
| Build tool           | Vite 8                                           |
| Routing              | React Router 7                                   |
| Server state         | TanStack React Query 5                           |
| HTTP client          | Axios (with request and response interceptors)   |
| Forms and validation | React Hook Form, Zod                             |
| Styling              | Tailwind CSS 3, tailwindcss-animate              |
| UI primitives        | Radix UI (shadcn/ui pattern), lucide-react icons |
| Notifications        | react-hot-toast                                  |

---

## System Architecture

<img src="Docs/System Architecture.svg" alt="Project Architecture">

The backend follows a layered architecture: `controller` (HTTP layer), `service` and `serviceImpl` (business logic), `dao` (repositories), `entity` (JPA models), `dto` (request and response contracts), `security` (JWT filter and utility), `config` (security and CORS), `exception` (custom exceptions and global handler), and `util` (file, pagination, and service helpers).

---

## Application Screenshots

### Landing Page

The public entry point of the application.

![Landing Page](Docs/Screenshots/00.%20landing_page.png)

### Registration and Email Verification

New users create an account and must verify their email address through a link sent to their inbox before they can sign in.

**Create account**

![Create Account](Docs/Screenshots/01.%20create_account.png)

**Verification link received in the inbox**

![Verification Email](Docs/Screenshots/02.%20verify_email_link_recieved_in_inbox.png)

### Sign In

![Sign In](Docs/Screenshots/03.%20sign-in_page.png)

### Forgot and Reset Password

Users who forget their password request a reset link by email, follow it, set a new password, and are redirected back to sign in.

**Request a reset link**

![Forgot Password](Docs/Screenshots/08.%20user_forgot_password_send-resent_link.png)

**Check your inbox confirmation**

![Check Your Inbox](Docs/Screenshots/09.%20check_your_inbox.png)

**Reset link received in Gmail**

![Reset Email](Docs/Screenshots/10.%20opened_gmail_recieved_resent_link.png)

**Set a new password**

![Reset Password](Docs/Screenshots/11.%20reset_password.png)

**Password updated and redirecting**

![Password Updated](Docs/Screenshots/12.%20password_updated_redirecting_screen.png)

### User Experience

**Home screen after login**

![App Home Screen](Docs/Screenshots/04.%20app_home_screen.png)

**Browse movies**

![Browse Movies](Docs/Screenshots/06.%20browse_movie.png)

**Streaming a trailer**

![Streaming Trailer](Docs/Screenshots/13.%20streaming_trailer_video.png)

**Watchlist**

![User Watchlist](Docs/Screenshots/07.%20user_watchlist.png)

**User profile**

![User Profile](Docs/Screenshots/05.%20user_profile.png)

### Administrator Experience

**Admin dashboard**

![Admin Dashboard](Docs/Screenshots/16%20admin_dashboard.png)

**Upload a video**

![Admin Upload Video](Docs/Screenshots/15.%20admin_upload_video.png)

**Monitor videos**

![Admin Videos](Docs/Screenshots/18.%20admin_monitoring_videos_page.png)

**Monitor users**

![Admin Users](Docs/Screenshots/17.%20admin_monitoring_users_page.png)

**Admin profile**

![Admin Profile](Docs/Screenshots/14.%20admin_profile.png)

---

## Project Structure

```
ScreenPlay/
|-- Docs/
|   |-- Screenshots/              Application screenshots
|   |-- Use-Case Diagrams/        Five use-case diagrams
|   |-- Activity Diagrams/        Six activity diagrams
|   |-- State Diagrams/           Seven state diagrams
|   |-- Class Diagram/            Class diagram (PNG and PDF)
|   `-- ScreenPLAY_Presentation.pptx
|
|-- com.screenplay/               Backend (Spring Boot, Maven)
|   |-- pom.xml
|   |-- mvnw, mvnw.cmd
|   `-- src/main/java/com/screenplay/
|       |-- Application.java
|       |-- config/               SecurityConfig, CorsConfig
|       |-- controller/           Auth, User, Video, Watchlist, FileUpload
|       |-- dao/                  UserRepository, VideoRepository
|       |-- dto/                  request/ and response/ objects
|       |-- entity/               User, Video
|       |-- enums/                Role
|       |-- exception/            Custom exceptions, GlobalExceptionHandler
|       |-- security/             JwtAuthenticationFilter, JwtUtil
|       |-- service/              Service interfaces
|       |-- serviceImpl/          Service implementations
|       `-- util/                 FileHandlerUtil, PaginationUtils, ServiceUtils
|
`-- screenplay-client/            Frontend (React, Vite)
    |-- package.json
    |-- vite.config.js
    |-- tailwind.config.js
    `-- src/
        |-- api/                  Axios instance and API modules
        |-- components/           shared/ and ui/ components
        |-- context/              AuthContext
        |-- hooks/                useVideos
        |-- pages/                public/, user/, admin/
        |-- router/               AppRouter
        `-- lib/                  Utilities
```

---

## Getting Started

### Prerequisites

- JDK 21 or later
- Node.js 18 or later and npm
- MySQL 8 or later
- An SMTP account (for example a Gmail account with an app password) for verification and password-reset emails

### 1. Clone the repository

```bash
git clone https://github.com/MANMOHAN4/ScreenPlay.git
cd ScreenPlay
```

### 2. Create the database

```sql
CREATE DATABASE screenplay;
```

The database name is your choice; it must match the datasource URL you configure in the next step.

### 3. Configure and run the backend

Create `com.screenplay/src/main/resources/application.properties` (it is not committed to the repository) using the template below, then adjust the values.

```properties
spring.application.name=screenplay
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/screenplay
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Mail (SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL_ADDRESS
spring.mail.password=YOUR_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Application
jwt.secret=REPLACE_WITH_A_LONG_RANDOM_SECRET
app.frontend.url=http://localhost:5173
app.cors.allowed-origins=http://localhost:5173
file.upload.video-dir=uploads/videos
file.upload.image-dir=uploads/images

# Allow large video uploads
spring.servlet.multipart.max-file-size=1GB
spring.servlet.multipart.max-request-size=1GB
```

Start the API:

```bash
cd com.screenplay

# macOS / Linux
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

The API is now available at `http://localhost:8080`.

### 4. Run the frontend

```bash
cd screenplay-client
npm install
npm run dev
```

The application is now available at `http://localhost:5173`.

### 5. Create an administrator

New accounts are created with the `USER` role. To obtain the first administrator, register a normal account, verify the email address, and then change the `role` column of that row in the `users` table to `ADMIN`:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

Once one administrator exists, further role changes can be made from the Users page of the admin console.

### Production build (frontend)

```bash
cd screenplay-client
npm run build      # outputs to dist/
npm run preview    # serves the built bundle locally
```

### Useful scripts

| Location            | Command                  | Purpose                                |
| ------------------- | ------------------------ | -------------------------------------- |
| `screenplay-client` | `npm run dev`            | Start the Vite dev server on port 5173 |
| `screenplay-client` | `npm run build`          | Create an optimized production build   |
| `screenplay-client` | `npm run lint`           | Run ESLint                             |
| `screenplay-client` | `npm run preview`        | Preview the production build           |
| `com.screenplay`    | `./mvnw spring-boot:run` | Run the API                            |
| `com.screenplay`    | `./mvnw test`            | Run backend tests                      |
| `com.screenplay`    | `./mvnw clean package`   | Build the executable JAR               |

---

## Configuration Reference

| Property                   | Default                         | Description                                                               |
| -------------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| `jwt.secret`               | `defaultSecretKeyForScreenplay` | Secret used to sign JWTs. Always override this outside local development. |
| `app.cors.allowed-origins` | `http://localhost:5173`         | Comma-separated list of origins allowed by CORS.                          |
| `app.frontend.url`         | `http://localhost:5173`         | Base URL used to build links in verification and reset emails.            |
| `file.upload.video-dir`    | `uploads/videos`                | Directory where uploaded videos are stored.                               |
| `file.upload.image-dir`    | `uploads/images`                | Directory where uploaded poster images are stored.                        |
| `spring.mail.username`     | none (required)                 | SMTP account; also used as the sender address.                            |

The frontend Axios instance targets `http://localhost:8080`, and the Vite dev server additionally proxies `/api` to the same address.

---

## REST API Reference

All endpoints are prefixed with `/api`. Protected endpoints require the header `Authorization: Bearer <token>`.

### Authentication (`/api/auth`) - public

| Method | Endpoint               | Description                                          |
| ------ | ---------------------- | ---------------------------------------------------- |
| POST   | `/signup`              | Register a new account and send a verification email |
| POST   | `/login`               | Authenticate and receive a JWT                       |
| GET    | `/validate-email`      | Check whether an email address is available          |
| GET    | `/verify-email`        | Verify an email address using the emailed token      |
| POST   | `/resend-verification` | Resend the verification email                        |
| POST   | `/forgot-password`     | Send a password-reset link                           |
| POST   | `/reset-password`      | Set a new password using a reset token               |
| POST   | `/change-password`     | Change the password of the signed-in user            |
| GET    | `/current-user`        | Return the currently authenticated user              |

### Videos (`/api/videos`)

| Method | Endpoint              | Access        | Description                                 |
| ------ | --------------------- | ------------- | ------------------------------------------- |
| GET    | `/published`          | Authenticated | List published videos                       |
| GET    | `/featured`           | Authenticated | List featured videos                        |
| POST   | `/admin`              | Admin         | Create a video record                       |
| GET    | `/admin`              | Admin         | List all videos (published and unpublished) |
| PUT    | `/admin/{id}`         | Admin         | Update a video                              |
| DELETE | `/admin/{id}`         | Admin         | Delete a video                              |
| PATCH  | `/admin/{id}/publish` | Admin         | Publish or unpublish a video                |
| GET    | `/admin/stats`        | Admin         | Video statistics for the dashboard          |

### Watchlist (`/api/watchlist`) - authenticated

| Method | Endpoint     | Description                       |
| ------ | ------------ | --------------------------------- |
| GET    | `/`          | Get the current user's watchlist  |
| POST   | `/{videoId}` | Add a video to the watchlist      |
| DELETE | `/{videoId}` | Remove a video from the watchlist |

### Files (`/api/files`)

| Method | Endpoint        | Description                                |
| ------ | --------------- | ------------------------------------------ |
| POST   | `/upload/video` | Upload a video file and receive its UUID   |
| POST   | `/upload/image` | Upload a poster image and receive its UUID |
| GET    | `/video/{uuid}` | Stream a video by UUID                     |
| GET    | `/image/{uuid}` | Retrieve an image by UUID                  |

### Users (`/api/users`) - admin only

| Method | Endpoint              | Description                       |
| ------ | --------------------- | --------------------------------- |
| POST   | `/`                   | Create a user                     |
| GET    | `/`                   | List users (paginated)            |
| PUT    | `/{id}`               | Update a user                     |
| DELETE | `/{id}`               | Delete a user                     |
| PUT    | `/{id}/toggle-status` | Activate or deactivate an account |
| PUT    | `/{id}/change-role`   | Change a user's role              |

---

## Data Model

### `users`

| Column                                                | Type                  | Notes                       |
| ----------------------------------------------------- | --------------------- | --------------------------- |
| `id`                                                  | BIGINT                | Primary key, auto-increment |
| `email`                                               | VARCHAR               | Unique, required            |
| `password`                                            | VARCHAR               | BCrypt hash                 |
| `full_name`                                           | VARCHAR               | Required                    |
| `role`                                                | ENUM(`USER`, `ADMIN`) | Defaults to `USER`          |
| `active`                                              | BOOLEAN               | Defaults to true            |
| `email_verified`                                      | BOOLEAN               | Defaults to false           |
| `verification_token`, `verification_token_expiry`     | VARCHAR, TIMESTAMP    | Email verification          |
| `password_reset_token`, `password_reset_token_expiry` | VARCHAR, TIMESTAMP    | Password reset              |
| `created_at`, `updated_at`                            | TIMESTAMP             | Managed automatically       |

### `videos`

| Column                       | Type              | Notes                                      |
| ---------------------------- | ----------------- | ------------------------------------------ |
| `id`                         | BIGINT            | Primary key, auto-increment                |
| `title`                      | VARCHAR           | Required                                   |
| `description`                | VARCHAR(4000)     | Optional                                   |
| `year`, `rating`, `duration` | INT, VARCHAR, INT | Metadata                                   |
| `src`, `poster`              | VARCHAR           | UUIDs of the stored video and poster files |
| `published`                  | BOOLEAN           | Defaults to false                          |
| `created_at`, `updated_at`   | TIMESTAMP         | Managed automatically                      |

### Supporting tables

- `video_categories` (`video_id`, `category`): element collection holding the categories of each video
- `user_watchlist` (`user_id`, `video_id`): many-to-many join table between users and videos

The API returns fully qualified URLs for `src` and `poster` (for example `http://localhost:8080/api/files/video/{uuid}`), built from the stored UUIDs.

---

## Security Design

- **Stateless JWT authentication.** A `JwtAuthenticationFilter` runs before the standard username/password filter, validates the bearer token, and populates the security context. Sessions are disabled.
- **Role-based authorization.** Method security (`@PreAuthorize("hasRole('ADMIN')")`) protects administrative controllers and endpoints. All routes other than `/api/auth/**` and `/api/files/**` require authentication.
- **Password storage.** Passwords are hashed with BCrypt.
- **Email verification.** Accounts cannot sign in until the emailed verification token has been used; tokens expire.
- **Password reset.** Reset tokens are single-purpose and time-limited.
- **Account control.** Administrators can deactivate accounts; deactivated users are rejected at login.
- **Client behavior.** The Axios interceptor attaches the token to each request and, on a `401` response, clears local auth state and redirects to the login page.
- **CORS.** Allowed origins are configurable through `app.cors.allowed-origins`.

Before any real deployment, set a strong `jwt.secret`, restrict CORS origins, and review the public status of `/api/files/**`.

---

## Design Documentation

The `Docs` folder contains the UML and design artefacts produced for the project.

### Use-Case Diagrams

| Diagram                             | File                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| Authentication and Account          | [View](Docs/Use-Case%20Diagrams/01.%20Authentication%20%26%20Account.png)              |
| Video Browsing and Streaming        | [View](Docs/Use-Case%20Diagrams/02.%20Video%20Browsing%20%26%20Streaming.png)          |
| Watchlist Management                | [View](Docs/Use-Case%20Diagrams/03.%20Watchlist%20Management.png)                      |
| Admin Video Management              | [View](Docs/Use-Case%20Diagrams/04.%20Admin%20Video%20Management.png)                  |
| Admin User Management and Dashboard | [View](Docs/Use-Case%20Diagrams/05.%20Admin%20User%20Management%20%26%20Dashboard.png) |

### Activity Diagrams

| Diagram                                  | File                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| User Registration and Email Verification | [View](Docs/Activity%20Diagrams/01.%20User%20Registration%20%26%20Email%20Verification.png) |
| User Login and JWT Issuance              | [View](Docs/Activity%20Diagrams/02.%20User%20Login%20%26%20JWT%20Issuance.png)              |
| Admin Video Upload and Publish           | [View](Docs/Activity%20Diagrams/03.%20Admin%20Video%20Upload%20%26%20Publish.png)           |
| User Browse and Stream Video             | [View](Docs/Activity%20Diagrams/04.%20User%20Browse%20%26%20Stream%20Video.png)             |
| User Watchlist Management                | [View](Docs/Activity%20Diagrams/05.%20User%20Watchlist%20Management.png)                    |
| Admin User Management                    | [View](Docs/Activity%20Diagrams/06.%20Admin%20User%20Management.png)                        |

### State Diagrams

| Diagram                           | File                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------- |
| User Account Lifecycle            | [View](Docs/State%20Diagrams/01.%20User%20Account%20Lifecycle.png)                |
| Video Lifecycle                   | [View](Docs/State%20Diagrams/02.%20Video%20Lifecycle.png)                         |
| JWT Request Authentication        | [View](Docs/State%20Diagrams/03.%20JWT%20Request%20Authentication.png)            |
| File Upload and Linkage Lifecycle | [View](Docs/State%20Diagrams/04.%20File%20Upload%20%26%20Linkage%20Lifecycle.png) |
| User Role Transition              | [View](Docs/State%20Diagrams/05.%20User%20Role%20Transition.png)                  |
| Watchlist Entry State             | [View](Docs/State%20Diagrams/06.%20Watchlist%20Entry%20State.png)                 |
| Email Notification Lifecycle      | [View](Docs/State%20Diagrams/07.%20Email%20Notification%20Lifecycle.png)          |

### Class Diagram

![Class Diagram](Docs/Class%20Diagram/Class-Diagram.png)

A PDF version is available at [`Docs/Class Diagram/Class-Diagram.pdf`](Docs/Class%20Diagram/Class-Diagram.pdf).

### Project Presentation

The slide deck used to present the project is available at [`Docs/ScreenPLAY_Presentation.pptx`](Docs/ScreenPLAY_Presentation.pptx).

---

## Frontend Routes

| Route                  | Access | Page                       |
| ---------------------- | ------ | -------------------------- |
| `/`                    | Public | Landing page               |
| `/login`               | Public | Sign in                    |
| `/signup`              | Public | Create account             |
| `/verify-email`        | Public | Email verification handler |
| `/resend-verification` | Public | Resend verification email  |
| `/forgot-password`     | Public | Request password reset     |
| `/reset-password`      | Public | Set a new password         |
| `/browse`              | User   | Browse and stream videos   |
| `/watchlist`           | User   | Personal watchlist         |
| `/profile`             | User   | User profile               |
| `/admin`               | Admin  | Dashboard                  |
| `/admin/videos`        | Admin  | Video management           |
| `/admin/users`         | Admin  | User management            |
| `/admin/profile`       | Admin  | Admin profile              |
