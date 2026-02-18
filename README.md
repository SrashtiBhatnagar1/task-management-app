# ✨ Mini Notion - Task Management System

A modern, full-stack task management application built with Next.js and Node.js. Think of it as a lightweight Notion clone focused on task tracking with a premium dark theme interface.

## 🎯 What This Project Does

This is a complete task management system where users can organize their work with style. You get a beautiful dashboard to create, update, and track tasks with different statuses. The interface is clean, fast, and feels premium with its dark theme and smooth animations.

The app handles everything from user authentication to real-time task updates, all wrapped in a responsive design that works on any device. It's the kind of tool you'd actually want to use daily.

## ✨ Key Features

### 🔐 Authentication & Security
- **Gmail-only registration** - Only Gmail addresses can sign up (by design)
- **Secure JWT authentication** - Access tokens (15 min) + refresh tokens (7 days)
- **Automatic token refresh** - Seamless experience with request queuing during token refresh
- **Password visibility toggle** - Eye icon to show/hide passwords while typing
- **Protected routes** - Automatic redirect to login for unauthorized access

### 📋 Task Management
- **Full CRUD operations** - Create, read, update, and delete tasks effortlessly
- **Status tracking** - TODO → IN_PROGRESS → DONE with one-click toggle
- **Real-time search** - Find tasks instantly as you type
- **Status filtering** - Filter by ALL, TODO, IN_PROGRESS, or DONE
- **Smart pagination** - Navigate through tasks with page numbers
- **Task statistics** - Dashboard shows total tasks, completion rate, and status breakdown

### 🎨 Premium UI/UX
- **Dark theme elegance** - Black background (#0a0a0a) with gold accents
- **Responsive design** - Adapts perfectly from mobile to desktop
- **Smooth animations** - Staggered card entrance, hover effects, floating elements
- **Toast notifications** - Instant feedback for all actions (success/error)
- **Modal forms** - Clean, centered modals for creating and editing tasks
- **Status badges** - Color-coded badges (amber/cyan/emerald) for quick visual scanning

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with Server Components
- **TypeScript** - Type-safe code throughout
- **Tailwind CSS 4** - Utility-first styling with custom animations
- **Axios** - HTTP client with interceptors
- **react-hot-toast** - Beautiful notification system

### Backend
- **Node.js + Express** - Fast, unopinionated web framework
- **TypeScript** - End-to-end type safety
- **Prisma ORM** - Modern database toolkit with migrations
- **PostgreSQL** - Robust relational database
- **JWT** - Secure token-based authentication
- **bcrypt** - Industry-standard password hashing

### Architecture Highlights
- **MVC Pattern** - Clean separation of concerns
- **Custom middleware** - Authentication, validation, error handling
- **Request/Response interceptors** - Automatic token management
- **Database migrations** - Version-controlled schema changes
- **Environment-based config** - Easy deployment across environments

## 📁 Project Structure

```
mini-notion/
├── task-management-frontend/     # Next.js frontend
│   ├── app/
│   │   ├── dashboard/            # Main task dashboard
│   │   │   └── page.tsx          # Statistics, grid, CRUD operations
│   │   ├── login/                # Login page with password toggle
│   │   ├── register/             # Registration with Gmail validation
│   │   ├── layout.tsx            # Root layout with Toaster
│   │   └── globals.css           # Custom animations (shimmer, float, fadeIn)
│   └── lib/
│       └── api.ts                # Axios instance with token refresh logic
│
├── src/                          # Backend Express server
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.ts    # Register, login, refresh, logout
│   │   └── task.controller.ts    # Task CRUD operations
│   ├── services/                 # Business logic layer
│   │   ├── auth.service.ts       # JWT creation, validation, token cleanup
│   │   └── task.service.ts       # Database operations via Prisma
│   ├── routes/                   # API route definitions
│   ├── middleware/               # Auth guards, validators, error handlers
│   └── utils/                    # JWT helpers, error classes, pagination
│
└── prisma/
    ├── schema.prisma             # Database schema (User, Task, RefreshToken)
    └── migrations/               # Version-controlled migrations
```

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have these installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 12+** - [Get PostgreSQL](https://www.postgresql.org/download/)
- **npm or yarn** - Comes with Node.js

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd mini-notion
```

#### 2️⃣ Backend Setup

```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/tasks_db
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

**Important:** Replace the JWT secrets with your own random strings. You can generate them using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npx prisma migrate dev --name init

# Start backend server
npm run dev
```

Backend will run on **http://localhost:4000**

#### 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd task-management-frontend

# Install frontend dependencies
npm install

# Start Next.js development server
npm run dev
```

Frontend will run on **http://localhost:3000**

### 🎉 You're All Set!

Open your browser and visit **http://localhost:3000**

1. Click "Create Account" and register with a Gmail address
2. Log in with your credentials
3. Start creating and managing tasks!

## 📚 API Documentation

The backend provides RESTful APIs for authentication and task management:

- **[AUTH_API.md](AUTH_API.md)** - Complete authentication endpoints documentation
- **[TASK_API.md](TASK_API.md)** - Task management endpoints with examples
- **[HOW_TO_RUN.md](HOW_TO_RUN.md)** - Detailed setup instructions
- **[TESTING.md](TESTING.md)** - API testing guide with cURL examples

### Quick API Overview

**Authentication:**
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Revoke refresh token

**Tasks:**
- `GET /api/tasks` - List tasks (with search, filter, pagination)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

All task endpoints require authentication via Bearer token.

## 🧪 Testing

The project includes comprehensive testing documentation:

```bash
# Backend health check
curl http://localhost:4000/health

# Test authentication flow
# See TESTING.md for complete examples

# Run Prisma studio to view database
npx prisma studio
```

## 🚢 Production Deployment

For production deployment instructions, security hardening, and optimization tips, see [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md).

Key considerations:
- Use environment variables for all secrets
- Enable CORS only for your frontend domain
- Set up database connection pooling
- Use HTTPS in production
- Implement rate limiting for API endpoints

## 🎨 Customization

### Changing Colors

Edit [task-management-frontend/app/globals.css](task-management-frontend/app/globals.css) to modify the color scheme:

```css
:root {
  --gold: #f59e0b;     /* Primary accent color */
  --background: #0a0a0a; /* Main background */
}
```

### Removing Gmail Restriction

In [task-management-frontend/app/register/page.tsx](task-management-frontend/app/register/page.tsx), remove or modify lines 28-33 in the `handleSubmit` function.

## 🐛 Troubleshooting

**Backend won't start:**
- Check PostgreSQL is running: `psql -U postgres`
- Verify DATABASE_URL in .env is correct
- Run `npx prisma migrate dev` to ensure migrations are applied

**Frontend can't connect to backend:**
- Ensure backend is running on port 4000
- Check `lib/api.ts` has correct baseURL
- Clear browser cache and localStorage

**Tasks not loading:**
- Open browser DevTools → Network tab
- Check if API calls are returning 401 (token issue)
- Try logging out and back in

## 📝 Available Scripts

### Backend
```bash
npm run dev          # Start with auto-reload (nodemon)
npm run build        # Compile TypeScript
npm start            # Run compiled server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
```

### Frontend
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm start            # Serve production build
npm run lint         # Run ESLint
```

## 🤝 Contributing

This is a personal project, but if you'd like to suggest improvements:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built as a modern take on task management applications
- Inspired by Notion's clean interface and Todoist's simplicity
- Uses the latest web technologies for optimal performance