# Task Management API Documentation

## Task Endpoints

All task endpoints require `Authorization: Bearer {accessToken}` header.

### 1. List Tasks (with pagination, filtering, search)

**GET** `/api/tasks`

Query Parameters:
- `page` (optional, default: 1) - Page number (must be > 0)
- `limit` (optional, default: 10, max: 100) - Items per page
- `status` (optional) - Filter by status: `PENDING` or `COMPLETED`
- `search` (optional) - Search by title (case-insensitive, partial match)

**Example Requests:**

```bash
# All tasks, page 1
GET /api/tasks

# Pagination
GET /api/tasks?page=2&limit=20

# Filter by status
GET /api/tasks?status=PENDING

# Search by title
GET /api/tasks?search=buy

# Combination
GET /api/tasks?page=1&limit=10&status=COMPLETED&search=project
```

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Optional description",
      "status": "PENDING",
      "createdAt": "2026-02-18T10:00:00.000Z",
      "userId": "uuid"
    }
  ],
  "total": 42,
  "page": 1,
  "totalPages": 5
}
```

---

### 2. Get Task by ID

**GET** `/api/tasks/:id`

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Optional description",
  "status": "PENDING",
  "createdAt": "2026-02-18T10:00:00.000Z",
  "userId": "uuid"
}
```

**Error (403):** Task belongs to another user
**Error (404):** Task not found

---

### 3. Create Task

**POST** `/api/tasks`

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Optional description",
  "status": "PENDING"
}
```

- `title` (required) - Non-empty string
- `description` (optional) - String
- `status` (optional, default: PENDING) - `PENDING` or `COMPLETED`

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Buy groceries",
  "description": "Optional description",
  "status": "PENDING",
  "createdAt": "2026-02-18T10:00:00.000Z",
  "userId": "uuid"
}
```

**Error (400):** Missing or invalid title

---

### 4. Update Task

**PATCH** `/api/tasks/:id`

**Request Body:**
```json
{
  "title": "Buy groceries online",
  "description": "Updated description",
  "status": "COMPLETED"
}
```

- All fields optional but at least one required
- `status` must be `PENDING` or `COMPLETED`

**Response (200):** Updated task object

**Error (400):** No valid fields provided
**Error (403):** Task belongs to another user
**Error (404):** Task not found

---

### 5. Toggle Task Status

**PATCH** `/api/tasks/:id/toggle`

Toggles status between PENDING ↔ COMPLETED (no body required)

**Response (200):** Updated task object

**Error (403):** Task belongs to another user
**Error (404):** Task not found

---

### 6. Delete Task

**DELETE** `/api/tasks/:id`

**Response (204):** No content

**Error (403):** Task belongs to another user
**Error (404):** Task not found

---

## Error Responses

All errors return JSON with `message` field:

```json
{
  "message": "Error description"
}
```

| Status | Code | Scenario |
|--------|------|----------|
| 400 | Bad Request | Invalid input (pagination, status, missing fields) |
| 401 | Unauthorized | Missing or invalid access token |
| 403 | Forbidden | Accessing another user's task |
| 404 | Not Found | Task doesn't exist |
| 500 | Server Error | Unexpected error |

---

## Example Workflow

```bash
# 1. Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'

# Response: { user, tokens: { accessToken, refreshToken } }
TOKEN="<accessToken>"

# 2. Create task
curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries"}'

# 3. List all tasks
curl http://localhost:4000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# 4. Filter by status
curl "http://localhost:4000/api/tasks?status=PENDING" \
  -H "Authorization: Bearer $TOKEN"

# 5. Search
curl "http://localhost:4000/api/tasks?search=grocery" \
  -H "Authorization: Bearer $TOKEN"

# 6. Paginate
curl "http://localhost:4000/api/tasks?page=2&limit=5" \
  -H "Authorization: Bearer $TOKEN"

# 7. Toggle status
curl -X PATCH http://localhost:4000/api/tasks/<task-id>/toggle \
  -H "Authorization: Bearer $TOKEN"

# 8. Update
curl -X PATCH http://localhost:4000/api/tasks/<task-id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED"}'

# 9. Delete
curl -X DELETE http://localhost:4000/api/tasks/<task-id> \
  -H "Authorization: Bearer $TOKEN"
```
