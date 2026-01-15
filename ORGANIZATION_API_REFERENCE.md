# Organization API Reference

Quick reference guide for all organization-related API endpoints.

---

## 🔐 Authentication APIs

### 1. Platform Admin Login
**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@yourdomain.com",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "admin@yourdomain.com",
    "isPlatformAdmin": true
  }
}
```

---

## 🎫 Token Management APIs (Platform Admin Only)

### 2. Generate Organization Token
**Endpoint:** `POST /api/v1/organizations/platform/tokens`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {platform_admin_token}
```

**Request Body:**
```json
{
  "organizationName": "Test University",
  "email": "contact@test-university.edu",
  "expiresInDays": 7
}
```

**Optional Fields:**
```json
{
  "maxUses": 1,
  "metadata": {
    "purpose": "New university onboarding",
    "notes": "Any additional notes"
  }
}
```

**Response:**
```json
{
  "success": true,
  "token": {
    "token": "a1b2c3d4e5f6g7h8...",
    "organizationName": "Test University",
    "email": "contact@test-university.edu",
    "expiresAt": "2026-01-19T...",
    "isActive": true
  }
}
```

---

### 3. List All Tokens
**Endpoint:** `GET /api/v1/organizations/platform/tokens`

**Headers:**
```
Authorization: Bearer {platform_admin_token}
```

**Query Parameters (Optional):**
- `page=1`
- `limit=10`
- `isActive=true` or `isActive=false`

**Response:**
```json
{
  "success": true,
  "tokens": [
    {
      "_id": "...",
      "token": "a1b2c3d4e5f6g7h8...",
      "organizationName": "Test University",
      "isActive": true,
      "expiresAt": "2026-01-19T..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalTokens": 1
  }
}
```

---

### 4. Revoke Token
**Endpoint:** `DELETE /api/v1/organizations/platform/tokens/{tokenId}`

**Headers:**
```
Authorization: Bearer {platform_admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Token revoked successfully"
}
```

---

## 🏢 Organization Registration APIs (Public)

### 5. Validate Token
**Endpoint:** `POST /api/v1/organizations/validate-token`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6g7h8..."
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "token": {
    "organizationName": "Test University",
    "expiresAt": "2026-01-19T..."
  }
}
```

---

### 6. Register Organization
**Endpoint:** `POST /api/v1/organizations/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body (Required Fields):**
```json
{
  "token": "a1b2c3d4e5f6g7h8...",
  "organization": {
    "name": "Test University",
    "slug": "test-university",
    "email": "contact@test-university.edu"
  },
  "superAdmin": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "admin@test-university.edu",
    "password": "SecurePass123"
  }
}
```

**Request Body (With Optional Fields):**
```json
{
  "token": "a1b2c3d4e5f6g7h8...",
  "organization": {
    "name": "Test University",
    "slug": "test-university",
    "email": "contact@test-university.edu",
    "phone": "+1-234-567-8900",
    "website": "https://test-university.edu",
    "description": "A comprehensive educational institution",
    "settings": {
      "timezone": "America/New_York",
      "language": "en",
      "features": {
        "allowSelfRegistration": true,
        "requireEmailVerification": true
      }
    },
    "branding": {
      "primaryColor": "#003366",
      "secondaryColor": "#FFD700",
      "logo": "https://test-university.edu/logo.png"
    }
  },
  "superAdmin": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "admin@test-university.edu",
    "password": "SecurePass123",
    "phone": "+1-234-567-8901"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization registered successfully",
  "organization": {
    "_id": "...",
    "name": "Test University",
    "slug": "test-university",
    "email": "contact@test-university.edu",
    "status": "active"
  },
  "superAdmin": {
    "_id": "...",
    "email": "admin@test-university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "organizationId": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🏢 Organization Profile APIs (Organization Admin)

### 7. Get Organization Profile
**Endpoint:** `GET /api/v1/organizations/profile`

**Headers:**
```
Authorization: Bearer {organization_admin_token}
```

**Response:**
```json
{
  "success": true,
  "organization": {
    "_id": "...",
    "name": "Test University",
    "slug": "test-university",
    "email": "contact@test-university.edu",
    "phone": "+1-234-567-8900",
    "website": "https://test-university.edu",
    "description": "A comprehensive educational institution",
    "status": "active",
    "settings": {
      "timezone": "America/New_York",
      "language": "en",
      "features": {
        "allowSelfRegistration": true,
        "requireEmailVerification": true
      }
    },
    "branding": {
      "primaryColor": "#003366",
      "secondaryColor": "#FFD700"
    },
    "createdAt": "2026-01-12T...",
    "updatedAt": "2026-01-12T..."
  }
}
```

---

### 8. Update Organization Profile
**Endpoint:** `PUT /api/v1/organizations/profile`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {organization_admin_token}
```

**Request Body (Update Any Fields):**
```json
{
  "description": "Updated description for Test University",
  "phone": "+1-234-567-8999",
  "website": "https://new-test-university.edu",
  "settings": {
    "timezone": "America/Los_Angeles",
    "language": "en",
    "features": {
      "allowSelfRegistration": false,
      "requireEmailVerification": true
    }
  },
  "branding": {
    "primaryColor": "#0066CC",
    "secondaryColor": "#FF9900",
    "accentColor": "#00CC66"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "organization": {
    "_id": "...",
    "name": "Test University",
    "description": "Updated description for Test University",
    "phone": "+1-234-567-8999",
    "branding": {
      "primaryColor": "#0066CC",
      "secondaryColor": "#FF9900"
    },
    "updatedAt": "2026-01-12T..."
  }
}
```

---

## 🔍 Organization Management APIs (Platform Admin Only)

### 9. List All Organizations
**Endpoint:** `GET /api/v1/organizations/platform`

**Headers:**
```
Authorization: Bearer {platform_admin_token}
```

**Query Parameters (Optional):**
- `page=1`
- `limit=10`
- `status=active` or `status=inactive` or `status=suspended`
- `search=university`

**Response:**
```json
{
  "success": true,
  "organizations": [
    {
      "_id": "...",
      "name": "Platform",
      "slug": "platform",
      "email": "admin@platform.com",
      "status": "active",
      "createdAt": "2026-01-12T..."
    },
    {
      "_id": "...",
      "name": "Test University",
      "slug": "test-university",
      "email": "contact@test-university.edu",
      "status": "active",
      "createdAt": "2026-01-12T..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalOrganizations": 2,
    "limit": 10
  }
}
```

---

### 10. Get Specific Organization
**Endpoint:** `GET /api/v1/organizations/platform/{organizationId}`
//wrong addresss
**Headers:**
```
Authorization: Bearer {platform_admin_token}
```

**Response:**
```json
{
  "success": true,
  "organization": {
    "_id": "...",
    "name": "Test University",
    "slug": "test-university",
    "email": "contact@test-university.edu",
    "phone": "+1-234-567-8900",
    "website": "https://test-university.edu",
    "status": "active",
    "stats": {
      "userCount": 1,
      "courseCount": 0,
      "enrollmentCount": 0
    },
    "createdAt": "2026-01-12T...",
    "updatedAt": "2026-01-12T..."
  }
}
```

---

## 📝 Field Descriptions

### Organization Fields
- `name` - Organization name (required, 2-200 characters)
- `slug` - URL-friendly identifier (auto-generated from name if not provided)
- `email` - Organization contact email (required, valid email format)
- `phone` - Contact phone number (optional)
- `website` - Organization website URL (optional)
- `description` - Organization description (optional, max 1000 characters)
- `status` - Organization status: `active`, `inactive`, or `suspended`

### Settings Fields
- `timezone` - Timezone (e.g., "America/New_York")
- `language` - Language code (e.g., "en")
- `features.allowSelfRegistration` - Allow users to self-register (boolean)
- `features.requireEmailVerification` - Require email verification (boolean)

### Branding Fields
- `primaryColor` - Primary brand color (hex format)
- `secondaryColor` - Secondary brand color (hex format)
- `accentColor` - Accent color (hex format)
- `logo` - Logo image URL

### SuperAdmin Fields
- `firstName` - First name (required)
- `lastName` - Last name (required)
- `email` - Email address (required, must be unique)
- `password` - Password (required, min 6 characters)
- `phone` - Phone number (optional)

---

## 🔑 Authentication Requirements

| API | Authentication | Required Role |
|-----|---------------|---------------|
| Login | None | - |
| Generate Token | Bearer Token | Platform Admin |
| List Tokens | Bearer Token | Platform Admin |
| Revoke Token | Bearer Token | Platform Admin |
| Validate Token | None | - |
| Register Organization | None (requires valid token) | - |
| Get Profile | Bearer Token | Organization Admin |
| Update Profile | Bearer Token | Organization Admin |
| List Organizations | Bearer Token | Platform Admin |
| Get Organization | Bearer Token | Platform Admin |

---

## ⚠️ Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Organization name and email are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Platform administrator privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Organization not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Organization with slug 'test-university' already exists"
}
```

---

## 🚀 Quick Usage Examples

### Example 1: Complete Organization Setup Flow
```bash
# Step 1: Login as platform admin
POST /api/auth/login
Body: { "email": "admin@platform.com", "password": "admin123" }

# Step 2: Generate token
POST /api/v1/organizations/platform/tokens
Headers: Authorization: Bearer {token_from_step_1}
Body: { "organizationName": "New Org", "email": "contact@neworg.com", "expiresInDays": 7 }

# Step 3: Register organization
POST /api/v1/organizations/register
Body: {
  "token": "{token_from_step_2}",
  "organization": { "name": "New Org", "slug": "new-org", "email": "contact@neworg.com" },
  "superAdmin": { "firstName": "John", "lastName": "Doe", "email": "admin@neworg.com", "password": "pass123" }
}

# Step 4: Login as organization admin
POST /api/auth/login
Body: { "email": "admin@neworg.com", "password": "pass123" }

# Step 5: View organization profile
GET /api/v1/organizations/profile
Headers: Authorization: Bearer {token_from_step_4}
```

---

## 📌 Important Notes

1. **Token Expiry**: Organization tokens expire after specified days (default 7 days)
2. **Slug Auto-generation**: If slug not provided, it's auto-generated from organization name
3. **Unique Constraints**: Email, slug, and superAdmin email must be unique
4. **Platform Admin**: First admin created via `createPlatformAdmin.js` script
5. **Password**: Minimum 6 characters required for all user accounts
6. **Bearer Token**: Always use format `Bearer {token}` in Authorization header

---

**Need help?** Refer to [POSTMAN_TESTING_GUIDE.md](./POSTMAN_TESTING_GUIDE.md) for detailed testing instructions.
