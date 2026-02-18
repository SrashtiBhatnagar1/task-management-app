# Testing the API

Complete examples with real requests and responses.

## Setup for Testing

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Save tokens in variables (bash):**
   ```bash
   ACCESS_TOKEN=""
   REFRESH_TOKEN=""
   TASK_ID=""
   ```

---

## Authentication Flow

### Step 1: Register

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePass123"
  }'
```

**Response (201):**
```json
{
  "user": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "email": "john@example.com"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save tokens:**
```bash
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Step 2: Login (Alternative to Register)

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePass123"
  }'
```

**Response (200):** Same format as register

---

### Step 3: Create Tasks

```bash
# Task 1: Simple task with title only
curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries"
  }'

# Response (201):
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Buy groceries",
  "description": null,
  "status": "PENDING",
  "createdAt": "2026-02-18T10:30:00.000Z",
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

**Save task ID:**
```bash
TASK_ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

```bash
# Task 2: With description and status
curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project report",
    "description": "Finish the Q1 report and send to manager",
    "status": "PENDING"
  }'
```

```bash
# Task 3: Create more tasks for filtering/search demo
curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy milk",
    "status": "COMPLETED"
  }'

curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy bread",
    "status": "PENDING"
  }'

curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "status": "PENDING"
  }'
```

---

## Task CRUD Operations

### Get Single Task

```bash
curl http://localhost:4000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Response (200):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Buy groceries",
  "description": null,
  "status": "PENDING",
  "createdAt": "2026-02-18T10:30:00.000Z",
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

---

### List All Tasks (Simple)

```bash
curl http://localhost:4000/api/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Buy groceries",
      "description": null,
      "status": "PENDING",
      "createdAt": "2026-02-18T10:30:00.000Z",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "title": "Complete project report",
      "description": "Finish the Q1 report and send to manager",
      "status": "PENDING",
      "createdAt": "2026-02-18T10:31:00.000Z",
      "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    }
  ],
  "total": 5,
  "page": 1,
  "totalPages": 1
}
```

---

## Advanced Queries (Pagination, Filter, Search)

### Pagination Only

```bash
# Page 1, 2 items per page
curl "http://localhost:4000/api/tasks?page=1&limit=2" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Page 2
curl "http://localhost:4000/api/tasks?page=2&limit=2" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

### Filter by Status

```bash
# Get completed tasks
curl "http://localhost:4000/api/tasks?status=COMPLETED" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Get pending tasks
curl "http://localhost:4000/api/tasks?status=PENDING" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

### Search by Title

```bash
# Search for "buy" (case-insensitive, partial match)
curl "http://localhost:4000/api/tasks?search=buy" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Returns tasks with "buy" in title:
# - "Buy groceries"
# - "Buy milk"
# - "Buy bread"

# Search for "project"
curl "http://localhost:4000/api/tasks?search=project" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Returns tasks with "project" in title:
# - "Complete project report"
# - "Complete project documentation"
```

---

### Combined Queries

```bash
# Pending tasks containing "buy", page 1, 10 per page
curl "http://localhost:4000/api/tasks?status=PENDING&search=buy&page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Completed tasks, page 2, 5 per page
curl "http://localhost:4000/api/tasks?status=COMPLETED&page=2&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Update Operations

### Update Task (Partial)

```bash
# Update only title
curl -X PATCH http://localhost:4000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries from Whole Foods"
  }'

# Update title and description
curl -X PATCH http://localhost:4000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy organic groceries",
    "description": "Get milk, bread, eggs from the farmers market"
  }'

# Update status only
curl -X PATCH http://localhost:4000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'

# Update all fields
curl -X PATCH http://localhost:4000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New title",
    "description": "New description",
    "status": "COMPLETED"
  }'
```

---

### Toggle Task Status

```bash
# Toggles PENDING → COMPLETED or COMPLETED → PENDING
curl -X PATCH http://localhost:4000/api/tasks/$TASK_ID/toggle \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Response (200): Updated task with toggled status
```

---

### Delete Task

```bash
curl -X DELETE http://localhost:4000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Response (204): No content (success)
```

---

## Token Management

### Refresh Access Token

When access token expires (15 minutes):

```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"

# Response (200):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Update your token:
```bash
ACCESS_TOKEN="new_token_here"
```

---

### Logout (Revoke Refresh Token)

```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }"

# Response (204): No content
# After logout, the refresh token is invalid
```

---

## Error Examples

### 400 Bad Request (Invalid Input)

```bash
# Missing email
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"password": "test123"}'

# Response (400):
{
  "message": "Valid email is required"
}
```

### 401 Unauthorized (Missing Token)

```bash
curl http://localhost:4000/api/tasks

# Response (401):
{
  "message": "Missing access token"
}
```

### 403 Forbidden (Access Denied)

```bash
# Try to access another user's task (get TASK_ID from different user)
curl http://localhost:4000/api/tasks/someone-elses-task-id \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Response (403):
{
  "message": "Access to task denied"
}
```

### 404 Not Found

```bash
curl http://localhost:4000/api/tasks/nonexistent-id \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Response (404):
{
  "message": "Task not found"
}
```

---

## Summary

The API is production-ready with:
- ✅ Full CRUD operations
- ✅ Pagination (page, limit)
- ✅ Filtering (status)
- ✅ Search (title, case-insensitive)
- ✅ JWT authentication
- ✅ Token refresh mechanism
- ✅ Ownership verification
- ✅ Comprehensive error handling
