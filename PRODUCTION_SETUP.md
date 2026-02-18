# Production-Ready Express + TypeScript Setup

## Architecture Overview

```
src/
├── server.ts          # Server entry point with graceful shutdown
├── app.ts             # Express app with middleware pipeline
├── controllers/       # Request handlers
├── services/          # Business logic
├── routes/            # Route handlers
├── middleware/        # Express middleware
├── utils/             # Utilities and helpers
└── types/             # TypeScript definitions
```

## Features Implemented

### Server (src/server.ts)
✅ **Environment Management**
- Loads .env variables with `dotenv`
- Validates required environment variables
- Exits gracefully if config is invalid

✅ **Port Configuration**
- Parses PORT from environment
- Validates port range (1-65535)
- Falls back to 4000 if not specified

✅ **Graceful Shutdown**
- Listens for SIGTERM and SIGINT signals
- Closes server connections cleanly
- Forces shutdown after 10 seconds timeout
- Handles uncaught exceptions and unhandled rejections

✅ **Server Output**
- Displays server startup information
- Shows health check endpoint
- Clear console logging

### App Setup (src/app.ts)
✅ **CORS Configuration**
- Configurable origin (`CORS_ORIGIN` env var)
- Credentials support enabled
- Defaults to `http://localhost:3000`

✅ **Request Parsing**
- `express.json()` for JSON payloads
- `express.urlencoded()` for form data

✅ **Request Logging**
- Logs HTTP method and path
- Includes ISO timestamp
- Useful for debugging

✅ **Health Check Endpoint**
- `GET /health` returns server status
- Includes current timestamp
- Useful for monitoring/load balancers

✅ **API Routes**
- Routes mounted on `/api` prefix
- Modular route registration

✅ **404 Handler**
- Handles unmatched routes
- Returns JSON error response

✅ **Error Handling**
- Global error handler middleware
- Catches all errors from async handlers
- Must be registered last

### Error Middleware (src/middleware/error.middleware.ts)
✅ **Error Logging**
- Logs all errors with timestamp
- Includes request method and path
- Helps with debugging

✅ **Error Classification**
- Known `AppError` instances
- JSON parse errors
- Unhandled errors (500)

✅ **Development vs Production**
- Shows error details in development
- Generic message in production

## Environment Variables

Required:
```dotenv
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/tasks_db
JWT_ACCESS_SECRET=random_secret_key
JWT_REFRESH_SECRET=random_secret_key
```

Optional:
```dotenv
CORS_ORIGIN=http://localhost:3000
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development
```

## Installation

```bash
# Install dependencies (including cors)
npm install

# Build
npm run build

# Run in development
npm run dev

# Run in production
npm start
```

## API Endpoints

**Health Check:**
```bash
GET http://localhost:4000/health
```

Response (200):
```json
{
  "status": "ok",
  "timestamp": "2026-02-18T12:00:00.000Z"
}
```

**API:**
```bash
GET http://localhost:4000/api/...
```

## Example Requests

Health check:
```bash
curl http://localhost:4000/health
```

Register user:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

List tasks:
```bash
curl http://localhost:4000/api/tasks \
  -H "Authorization: Bearer <token>"
```

## Graceful Shutdown

The server handles graceful shutdown with:

```bash
# Send SIGTERM (from load balancer, supervisor, etc)
kill -TERM <pid>

# Or Ctrl+C sends SIGINT
Ctrl+C
```

Server will:
1. Stop accepting new connections
2. Wait for existing requests to complete (max 10s)
3. Close database connections
4. Exit cleanly

## Production Deployment

For production, ensure:

```bash
# Install dependencies in production mode
npm ci --production

# Build TypeScript
npm run build

# Run production server
NODE_ENV=production npm start
```

Set environment:
```bash
export NODE_ENV=production
export PORT=3000
export DATABASE_URL=postgresql://...
export JWT_ACCESS_SECRET=<random-secret>
export JWT_REFRESH_SECRET=<random-secret>
export CORS_ORIGIN=https://yourdomain.com
```

## Monitoring

### Health Check Endpoint
Use for load balancer health checks:
```bash
curl -s http://localhost:4000/health | jq .status
```

### Request Logging
Monitor request volume and patterns:
```bash
npm run dev 2>&1 | grep "GET\|POST\|PATCH\|DELETE"
```

### Error Monitoring
Subscribe to error logs for alerting:
```bash
npm run dev 2>&1 | grep "Error on"
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with auto-reload |
| `npm run build` | Compile TypeScript to dist/ |
| `npm start` | Run compiled production build |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |

## TypeScript Configuration

Strict mode enabled in `tsconfig.json`:
- `strict: true` - All type checking enabled
- `esModuleInterop: true` - Proper ES module interop
- `forceConsistentCasingInFileNames: true` - Prevent case issues
- `skipLibCheck: true` - Skip type checking of declaration files

## Security Notes

✅ **Implemented**
- Password hashing with bcrypt
- JWT token-based auth
- Refresh token rotation
- Ownership verification
- Input validation
- Error message sanitization

🔐 **Additional for Production**
- Use HTTPS (reverse proxy: nginx, HAProxy)
- Add rate limiting (express-rate-limit)
- Add request body size limits
- Helmet.js for HTTP headers
- Request ID tracking
- API key management
- Audit logging

## Troubleshooting

**Port already in use:**
```bash
# Linux/Mac: Find process on port 4000
lsof -i :4000
kill -9 <pid>

# Windows PowerShell
Get-NetTCPConnection -LocalPort 4000
Stop-Process -Id <pid> -Force
```

**Database connection error:**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

**Missing environment variables:**
- Copy `.env.example` to `.env`
- Fill in actual values
- Restart server

**CORS issues:**
- Set `CORS_ORIGIN` to your frontend URL
- Check browser console for blocked requests
- Verify credentials: true is set in CORS config
