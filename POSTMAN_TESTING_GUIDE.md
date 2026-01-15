# Multi-Tenant Organization - Postman Testing Guide

## 📌 Overview
Complete Postman collection for testing the multi-tenant organization feature with step-by-step instructions.

---

## 🔧 Prerequisites

1. **Server Running**: `npm start` in backend folder
2. **MongoDB Running**: Database accessible
3. **Platform Admin Created**: Run `node scripts/createPlatformAdmin.js`
4. **Postman Installed**: Download from https://www.postman.com/

---

## 📂 Postman Environment Setup

Create a new environment in Postman with these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:5000` | `http://localhost:5000` |
| `platform_token` | (empty) | (will be set after login) |
| `org_token` | (empty) | (will be set after token generation) |
| `org_admin_token` | (empty) | (will be set after org registration) |

---

## 🚀 Step-by-Step Testing Guide

### Step 1: Platform Admin Login

**Endpoint:** `POST {{base_url}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@yourdomain.com",
  "password": "your-password-from-createPlatformAdmin"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "admin@yourdomain.com",
    "firstName": "Platform",
    "lastName": "Admin",
    "role": "admin",
    "organizationId": "...",
    "isPlatformAdmin": true
  }
}
```

**Postman Test Script (Auto-save token):**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("platform_token", jsonData.token);
    console.log("✅ Platform token saved!");
}
```

---

### Step 2: Generate Organization Token

**Endpoint:** `POST {{base_url}}/api/v1/organizations/platform/tokens`

**⚠️ Important:** Note the `/api/v1/organizations` path!

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{platform_token}}
```

**Body (raw JSON):**
```json
{
  "organizationName": "Test University",
  "email": "contact@test-university.edu",
  "maxUses": 1,
  "expiresInDays": 7,
  "metadata": {
    "createdBy": "Platform Admin",
    "purpose": "New university onboarding",
    "notes": "Testing organization creation"
  }
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Organization token generated successfully",
  "token": {
    "_id": "...",
    "token": "a1b2c3d4e5f6g7h8...",
    "organizationName": "Test University",
    "maxUses": 1,
    "usedCount": 0,
    "expiresAt": "2026-01-19T...",
    "isActive": true,
    "createdBy": "...",
    "createdAt": "2026-01-12T...",
    "metadata": {
      "createdBy": "Platform Admin",
      "purpose": "New university onboarding"
    }
  },
  "registrationUrl": "http://localhost:5000/register?token=a1b2c3d4e5f6g7h8..."
}
```

**Postman Test Script (Auto-save token):**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("org_token", jsonData.token.token);
    console.log("✅ Organization token saved:", jsonData.token.token);
}
```

---

### Step 3: Validate Organization Token

**Endpoint:** `POST {{base_url}}/api/v1/organizations/validate-token`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "token": "{{org_token}}"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "valid": true,
  "token": {
    "organizationName": "Test University",
    "expiresAt": "2026-01-19T...",
    "usesRemaining": 1,
    "metadata": {
      "createdBy": "Platform Admin",
      "purpose": "New university onboarding"
    }
  }
}
```

---

### Step 4: Register New Organization

**Endpoint:** `POST {{base_url}}/api/v1/organizations/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "token": "{{org_token}}",
  "organization": {
    "name": "Test University",
    "slug": "test-university",
    "email": "contact@test-university.edu",
    "phone": "+1-234-567-8900",
    "website": "https://test-university.edu",
    "description": "A comprehensive educational institution focused on innovation and excellence",
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

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Organization registered successfully",
  "organization": {
    "_id": "...",
    "name": "Test University",
    "slug": "test-university",
    "email": "contact@test-university.edu",
    "status": "active",
    "settings": {
      "timezone": "America/New_York",
      "language": "en"
    },
    "branding": {
      "primaryColor": "#003366"
    }
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

**Postman Test Script (Auto-save token):**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("org_admin_token", jsonData.token);
    console.log("✅ Organization admin token saved!");
}
```

---

### Step 5: Organization Admin Login

**Endpoint:** `POST {{base_url}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@test-university.edu",
  "password": "SecurePass123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "email": "admin@test-university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "organizationId": "...",
    "isPlatformAdmin": false
  }
}
```

---

### Step 6: Get Organization Profile

**Endpoint:** `GET {{base_url}}/api/v1/organizations/profile`

**Headers:**
```
Authorization: Bearer {{org_admin_token}}
```

**Expected Response (200 OK):**
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
    "description": "A comprehensive educational institution...",
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

### Step 7: Update Organization Profile

**Endpoint:** `PUT {{base_url}}/api/v1/organizations/profile`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{org_admin_token}}
```

**Body (raw JSON):**
```json
{
  "description": "Updated description for Test University - Leading in STEM education",
  "phone": "+1-234-567-8999",
  "website": "https://new-test-university.edu",
  "branding": {
    "primaryColor": "#0066CC",
    "secondaryColor": "#FF9900",
    "accentColor": "#00CC66"
  },
  "settings": {
    "timezone": "America/Los_Angeles",
    "language": "en",
    "features": {
      "allowSelfRegistration": false,
      "requireEmailVerification": true
    }
  }
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "organization": {
    "_id": "...",
    "name": "Test University",
    "description": "Updated description...",
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

### Step 8: List All Organizations (Platform Admin Only)

**Endpoint:** `GET {{base_url}}/api/v1/organizations/platform`

**Headers:**
```
Authorization: Bearer {{platform_token}}
```

**Query Parameters (Optional):**
- `page`: 1 (default)
- `limit`: 10 (default)
- `status`: active/inactive/suspended
- `search`: search term

**Example:** `GET {{base_url}}/api/v1/organizations/platform?page=1&limit=10&status=active`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "organizations": [
    {
      "_id": "...",
      "name": "Platform",
      "slug": "platform",
      "status": "active",
      "createdAt": "2026-01-12T..."
    },
    {
      "_id": "...",
      "name": "Test University",
      "slug": "test-university",
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

### Step 9: Get Specific Organization (Platform Admin Only)

**Endpoint:** `GET {{base_url}}/api/v1/organizations/platform/:organizationId`

**Headers:**
```
Authorization: Bearer {{platform_token}}
```

**Example:** `GET {{base_url}}/api/v1/organizations/platform/6964ab8317ccc51aa882abcb`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "organization": {
    "_id": "6964ab8317ccc51aa882abcb",
    "name": "Test University",
    "slug": "test-university",
    "email": "contact@test-university.edu",
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

### Step 10: List All Tokens (Platform Admin Only)

**Endpoint:** `GET {{base_url}}/api/v1/organizations/platform/tokens`

**Headers:**
```
Authorization: Bearer {{platform_token}}
```

**Query Parameters (Optional):**
- `page`: 1 (default)
- `limit`: 10 (default)
- `isActive`: true/false

**Expected Response (200 OK):**
```json
{
  "success": true,
  "tokens": [
    {
      "_id": "...",
      "token": "a1b2c3d4e5f6g7h8...",
      "organizationName": "Test University",
      "maxUses": 1,
      "usedCount": 1,
      "isActive": false,
      "expiresAt": "2026-01-19T...",
      "createdAt": "2026-01-12T..."
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

### Step 11: Revoke Token (Platform Admin Only)

**Endpoint:** `DELETE {{base_url}}/api/v1/organizations/platform/tokens/:tokenId`

**Headers:**
```
Authorization: Bearer {{platform_token}}
```

**Example:** `DELETE {{base_url}}/api/v1/organizations/platform/tokens/6964ab8317ccc51aa882abcd`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Token revoked successfully",
  "token": {
    "_id": "6964ab8317ccc51aa882abcd",
    "token": "a1b2c3d4e5f6g7h8...",
    "isActive": false,
    "revokedAt": "2026-01-12T..."
  }
}
```

---

## 🧪 Data Isolation Testing

### Test 12: Verify Data Isolation - Create Course in Organization

**Endpoint:** `POST {{base_url}}/api/courses`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{org_admin_token}}
```

**Body (raw JSON):**
```json
{
  "fullName": "Introduction to Computer Science",
  "shortName": "CS101",
  "summary": "Fundamentals of programming and computer science",
  "description": "A comprehensive introduction to computer science",
  "startDate": "2026-02-01",
  "endDate": "2026-06-15",
  "visible": true
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "course": {
    "_id": "...",
    "fullName": "Introduction to Computer Science",
    "shortName": "CS101",
    "organizationId": "...",
    "instructorId": "...",
    "createdAt": "2026-01-12T..."
  }
}
```

---

### Test 13: Verify Isolation - Try to Access Other Organization's Data

**Endpoint:** `GET {{base_url}}/api/courses`

**Headers:**
```
Authorization: Bearer {{platform_token}}
```

**Expected Result:** Platform admin sees ALL courses from ALL organizations (if allowed), but regular organization admin only sees their own courses.

---

## ❌ Error Testing

### Test 14: Invalid Token

**Endpoint:** `POST {{base_url}}/api/v1/organizations/register`

**Body:**
```json
{
  "token": "invalid-token-12345",
  "organization": { "name": "Test", "slug": "test" },
  "superAdmin": { "firstName": "Test", "lastName": "User", "email": "test@test.com", "password": "Test123" }
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### Test 15: Duplicate Slug

**Endpoint:** `POST {{base_url}}/api/v1/organizations/register`

**Body:**
```json
{
  "token": "{{org_token}}",
  "organization": {
    "name": "Another University",
    "slug": "test-university"
  },
  "superAdmin": { ... }
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Organization with slug 'test-university' already exists"
}
```

---

### Test 16: Unauthorized Access

**Endpoint:** `GET {{base_url}}/api/v1/organizations/platform`

**Headers:**
```
Authorization: Bearer {{org_admin_token}}
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied. Platform administrator privileges required."
}
```

---

## 📋 Complete Postman Collection Import

Copy and import this JSON into Postman:

```json
{
  "info": {
    "name": "LMS Multi-Tenant Organization API",
    "description": "Complete API collection for testing multi-tenant organization feature",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Platform Admin Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@yourdomain.com\",\n  \"password\": \"your-password\"\n}"
        },
        "url": {"raw": "{{base_url}}/api/auth/login"}
      },
      "event": [{
        "listen": "test",
        "script": {
          "exec": ["if (pm.response.code === 200) {", "  pm.environment.set('platform_token', pm.response.json().token);", "}"]
        }
      }]
    },
    {
      "name": "2. Generate Organization Token",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "Authorization", "value": "Bearer {{platform_token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"organizationName\": \"Test University\",\n  \"email\": \"contact@test-university.edu\",\n  \"expiresInDays\": 7\n}"
        },
        "url": {"raw": "{{base_url}}/api/v1/organizations/platform/tokens"}
      },
      "event": [{
        "listen": "test",
        "script": {
          "exec": ["if (pm.response.code === 201) {", "  pm.environment.set('org_token', pm.response.json().token.token);", "}"]
        }
      }]
    },
    {
      "name": "3. Validate Token",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"token\": \"{{org_token}}\"\n}"
        },
        "url": {"raw": "{{base_url}}/api/v1/organizations/validate-token"}
      }
    },
    {
      "name": "4. Register Organization",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"token\": \"{{org_token}}\",\n  \"organization\": {\n    \"name\": \"Test University\",\n    \"slug\": \"test-university\",\n    \"email\": \"contact@test-university.edu\",\n    \"description\": \"A test university\"\n  },\n  \"superAdmin\": {\n    \"firstName\": \"John\",\n    \"lastName\": \"Doe\",\n    \"email\": \"admin@test-university.edu\",\n    \"password\": \"SecurePass123\"\n  }\n}"
        },
        "url": {"raw": "{{base_url}}/api/v1/organizations/register"}
      },
      "event": [{
        "listen": "test",
        "script": {
          "exec": ["if (pm.response.code === 201) {", "  pm.environment.set('org_admin_token', pm.response.json().token);", "}"]
        }
      }]
    },
    {
      "name": "5. Get Organization Profile",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{org_admin_token}}"}],
        "url": {"raw": "{{base_url}}/api/v1/organizations/profile"}
      }
    },
    {
      "name": "6. Update Organization Profile",
      "request": {
        "method": "PUT",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "Authorization", "value": "Bearer {{org_admin_token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"description\": \"Updated description\",\n  \"branding\": {\n    \"primaryColor\": \"#0066CC\"\n  }\n}"
        },
        "url": {"raw": "{{base_url}}/api/v1/organizations/profile"}
      }
    },
    {
      "name": "7. List All Organizations (Platform Admin)",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{platform_token}}"}],
        "url": {"raw": "{{base_url}}/api/v1/organizations/platform?page=1&limit=10"}
      }
    },
    {
      "name": "8. List All Tokens (Platform Admin)",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{platform_token}}"}],
        "url": {"raw": "{{base_url}}/api/v1/organizations/platform/tokens"}
      }
    }
  ]
}
```

---

## 🎯 Testing Checklist

- [ ] Platform admin can login
- [ ] Platform admin can generate organization tokens
- [ ] Tokens can be validated before use
- [ ] New organizations can register with valid token
- [ ] Organization admin can login
- [ ] Organization admin can view their profile
- [ ] Organization admin can update their profile
- [ ] Platform admin can list all organizations
- [ ] Platform admin can view specific organization
- [ ] Platform admin can list all tokens
- [ ] Platform admin can revoke tokens
- [ ] Data isolation verified (courses, users, etc.)
- [ ] Invalid tokens are rejected
- [ ] Duplicate slugs are prevented
- [ ] Unauthorized access is blocked

---

## 🐛 Common Issues & Solutions

### Issue 1: 404 Not Found on `/api/organizations/...`
**Solution:** Use `/api/v1/organizations/...` (note the `/v1/` prefix)

### Issue 2: 401 Unauthorized
**Solution:** Check that:
- Token is valid and not expired
- Token is included in Authorization header
- Format is `Bearer <token>`

### Issue 3: 403 Forbidden on Platform Admin Routes
**Solution:** Ensure you're using platform admin token, not organization admin token

### Issue 4: "organizationId is required" error
**Solution:** Audit logging issue - restart server after code updates

### Issue 5: Token already used
**Solution:** Generate a new token for each organization registration

---

## 📊 Expected Results Summary

| Test | Expected Status | Expected Behavior |
|------|----------------|-------------------|
| Platform Login | 200 OK | Returns JWT with isPlatformAdmin: true |
| Generate Token | 201 Created | Returns new organization token |
| Validate Token | 200 OK | Returns token validity status |
| Register Org | 201 Created | Creates org + admin user |
| Get Profile | 200 OK | Returns organization details |
| Update Profile | 200 OK | Updates and returns new data |
| List Orgs | 200 OK | Platform admin sees all orgs |
| Invalid Token | 400/401 | Error message returned |
| Duplicate Slug | 400 | Error about existing slug |
| Unauthorized | 403 | Access denied message |

---

## 🚀 Quick Start Commands

```bash
# Start server
cd backend
npm start

# In another terminal, test with curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"your-password"}'
```

---

**Ready to test!** Import the Postman collection or follow the step-by-step guide above.

**Pro Tip:** Enable "Tests" tab in Postman requests to auto-save tokens to environment variables! 🎯
