# Authentication API Documentation

## Auth Endpoints

### 1. Register

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

- `email` (required) - Valid email format, must be unique
- `password` (required) - Non-empty string

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error (400):** Invalid email or email already in use

---

### 2. Login

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error (401):** Invalid email or password

---

### 3. Refresh Tokens

**POST** `/api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Issues new access token using valid refresh token. Refresh token remains the same.

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error (401):** Invalid refresh token
**Error (403):** Refresh token revoked or expired

---

### 4. Logout

**POST** `/api/auth/logout`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Revokes the refresh token (deletes from database).

**Response (204):** No content

---

## Token Details

**Access Token:**
- Expiry: 15 minutes
- Use in `Authorization: Bearer {accessToken}` header
- Required for all protected endpoints (task routes)

**Refresh Token:**
- Expiry: 7 days
- Stored in database
- Use to get new access token when expired
- Deleted on logout

---

## Example Auth Flow

```bash
# 1. Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secure123"}'

# Store the tokens
ACCESS_TOKEN="<accessToken>"
REFRESH_TOKEN="<refreshToken>"

# 2. Use access token for requests
curl http://localhost:4000/api/tasks \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. When access token expires (15 min), refresh it
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"

# 4. Logout (revoke refresh token)
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

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
| 400 | Bad Request | Invalid email/password format |
| 401 | Unauthorized | Invalid credentials or token |
| 403 | Forbidden | Token revoked or expired |
| 500 | Server Error | Unexpected error |
