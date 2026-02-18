# Task Management System Backend

Production-ready Node.js + Express + TypeScript backend with PostgreSQL and Prisma ORM.

## ✅ Implemented Features

### Authentication (JWT)
- User registration (bcrypt password hashing)
- Login with email/password
- Access token (15 min expiry)
- Refresh token (7 days expiry, stored in DB)
- Token refresh endpoint
- Logout (revoke refresh token)
- JWT verification middleware

### Task Management (CRUD + Advanced Queries)
- List tasks with pagination (page, limit)
- Filter by status (PENDING, COMPLETED)
- Search by title (case-insensitive)
- Combine pagination + filtering + search
- Get single task
- Create task
- Update task
- Toggle task status
- Delete task
- Ownership checks (users can only access their own tasks)

### Architecture
- **MVC Pattern**: Controllers, Services, Routes
- **Middleware**: Error handling, Auth guards, Validation
- **Utils**: JWT helpers, Error classes, Response formatting
- **Database**: Prisma ORM with PostgreSQL
- **Types**: Full TypeScript strict mode
- **Error Handling**: Custom AppError with HTTP status codes

## Error Handling
- 400: Bad Request (invalid input)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (access denied)
- 404: Not Found (resource missing)
- 500: Internal Server Error

## Project Structure

```
src/
├── controllers/        # Request handlers
│   ├── auth.controller.ts
│   └── task.controller.ts
├── services/          # Business logic
│   ├── auth.service.ts
│   └── task.service.ts
├── routes/            # Express routes
│   ├── index.ts
│   ├── auth.routes.ts
│   └── task.routes.ts
├── middleware/        # Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validate.middleware.ts
├── utils/             # Helpers
│   ├── jwt.ts
│   ├── errors.ts
│   ├── response.ts
│   ├── pagination.ts
│   ├── env.ts
│   ├── prisma.ts
│   └── async-handler.ts
├── types/             # TypeScript declarations
│   └── express.d.ts
├── app.ts             # Express app setup
└── server.ts          # Server bootstrap
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env with your values:**
   ```dotenv
   PORT=4000
   DATABASE_URL=postgresql://user:password@localhost:5432/tasks_db
   JWT_ACCESS_SECRET=your-secret-key-here
   JWT_REFRESH_SECRET=your-refresh-secret-here
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_SALT_ROUNDS=10
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Setup database:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

Server will run on http://localhost:4000

## API Documentation

See [AUTH_API.md](AUTH_API.md) for authentication endpoints.

See [TASK_API.md](TASK_API.md) for task management endpoints.

## Available Scripts

- `npm run dev` - Start in development mode with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma migrations
