# 🚀 Complete LMS API Documentation

**Base URL:** `http://localhost:5000`  
**API Version:** v2.0.0  
**Last Updated:** January 13, 2026

---

## 📋 Table of Contents

1. [Admin Credentials](#admin-credentials)
2. [Authentication APIs](#1-authentication-apis)
3. [Organization Management APIs](#2-organization-management-apis)
4. [User Management APIs](#3-user-management-apis)
5. [Category Management APIs](#4-category-management-apis)
6. [Course Management APIs](#5-course-management-apis)
7. [Enrollment APIs](#6-enrollment-apis)
8. [Audit Log APIs](#7-audit-log-apis)
9. [Cache Management APIs](#8-cache-management-apis)
10. [Postman Setup Guide](#postman-setup-guide)

---

## 🔐 Admin Credentials

### Platform Super Admin
```
Email: admin@yourdomain.com
Password: Admin@123456 (default, change immediately after first login)
Role: Platform Admin
```

**To create/reset Platform Admin:**
```bash
cd backend
node scripts/createPlatformAdmin.js
```

**Custom Password Setup:**
Add to `.env` file:
```
PLATFORM_ADMIN_PASSWORD=YourSecurePassword123!
```

---

## 1. 🔐 Authentication APIs

Base Path: `/api/auth`

### 1.1 Register User
**URL:** `http://localhost:5000/api/auth/register`  
**Method:** `POST`  
**Access:** Public  
**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "phone": "+1234567890",
  "role": "student"
}
```

**Required Fields:**
- `email` (string, valid email)
- `password` (string, min 6 characters)
- `firstName` (string)
- `lastName` (string)

**Optional Fields:**
- `username` (string)
- `phone` (string)
- `role` (string: "student", "teacher", "admin", "manager", "course_creator")

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64abc123...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student",
      "organizationId": "64xyz789...",
      "isPlatformAdmin": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Postman Setup:**
- Method: POST
- URL: `{{base_url}}/api/auth/register`
- Body: raw JSON
- Tests: Save token to environment variable

---

### 1.2 Login
**URL:** `http://localhost:5000/api/auth/login`  
**Method:** `POST`  
**Access:** Public  
**Description:** Login and receive JWT token

**Request Body:**
```json
{
  "email": "admin@yourdomain.com",
  "password": "Admin@123"
}
```

**Required Fields:**
- `email` (string)
- `password` (string)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64abc123...",
      "email": "admin@yourdomain.com",
      "firstName": "Platform",
      "lastName": "Admin",
      "role": "admin",
      "isPlatformAdmin": true,
      "organizationId": "64xyz789..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Postman Setup:**
- Method: POST
- URL: `{{base_url}}/api/auth/login`
- Body: raw JSON
- Tests:
```javascript
// Save token to environment
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.data.token);
}
```

---

### 1.3 Get Current User
**URL:** `http://localhost:5000/api/auth/me`  
**Method:** `GET`  
**Access:** Private (Authenticated)  
**Description:** Get currently logged-in user's profile

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64abc123...",
    "email": "admin@yourdomain.com",
    "firstName": "Platform",
    "lastName": "Admin",
    "role": "admin",
    "isPlatformAdmin": true,
    "organizationId": "64xyz789...",
    "status": "active",
    "emailVerified": true,
    "createdAt": "2026-01-10T10:00:00.000Z"
  }
}
```

**Postman Setup:**
- Method: GET
- URL: `{{base_url}}/api/auth/me`
- Authorization: Bearer Token → `{{auth_token}}`

---

### 1.4 Logout
**URL:** `http://localhost:5000/api/auth/logout`  
**Method:** `POST`  
**Access:** Private  
**Description:** Logout user

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.5 Send Email Verification
**URL:** `http://localhost:5000/api/auth/send-verification`  
**Method:** `POST`  
**Access:** Public  
**Description:** Send email verification link

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

---

### 1.6 Verify Email
**URL:** `http://localhost:5000/api/auth/verify-email/:token`  
**Method:** `GET`  
**Access:** Public  
**Description:** Verify email with token from email link

**URL Parameters:**
- `token` (string) - Verification token from email

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### 1.7 Forgot Password
**URL:** `http://localhost:5000/api/auth/forgot-password`  
**Method:** `POST`  
**Access:** Public  
**Description:** Request password reset (sends email)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### 1.8 Reset Password
**URL:** `http://localhost:5000/api/auth/reset-password`  
**Method:** `POST`  
**Access:** Public  
**Description:** Reset password using token from email

**Request Body:**
```json
{
  "token": "abc123xyz789...",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 1.9 Change Password
**URL:** `http://localhost:5000/api/auth/change-password`  
**Method:** `POST`  
**Access:** Private  
**Description:** Change password for logged-in user

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 2. 🏢 Organization Management APIs

Base Path: `/api/v1/organizations` or `/api/v1/organization`

### 2.1 Validate Organization Token
**URL:** `http://localhost:5000/api/v1/organizations/validate-token`  
**Method:** `POST`  
**Access:** Public  
**Description:** Validate organization registration token

**Request Body:**
```json
{
  "token": "org_abc123xyz789..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "organizationName": "Acme Corporation",
    "email": "admin@acme.com",
    "expiresAt": "2026-01-20T00:00:00.000Z"
  }
}
```

---

### 2.2 Register Organization
**URL:** `http://localhost:5000/api/v1/organizations/register`  
**Method:** `POST`  
**Access:** Public  
**Description:** Register new organization using token

**Request Body:**
```json
{
  "token": "org_abc123xyz789...",
  "organization": {
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "website": "https://acme.com",
    "address": {
      "street": "123 Business Ave",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "description": "Leading education provider",
    "logo": "https://acme.com/logo.png"
  },
  "superAdmin": {
    "email": "admin@acme.com",
    "password": "SecureAdmin123!",
    "firstName": "John",
    "lastName": "Admin",
    "phone": "+1234567890"
  }
}
```

**Required Fields:**
- `token` (string)
- `organization.name` (string)
- `organization.slug` (string, unique, lowercase, no spaces)
- `organization.email` (string)
- `superAdmin.email` (string)
- `superAdmin.password` (string, min 6 characters)
- `superAdmin.firstName` (string)
- `superAdmin.lastName` (string)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Organization registered successfully",
  "data": {
    "organization": {
      "_id": "64org123...",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "email": "contact@acme.com"
    },
    "superAdmin": {
      "_id": "64user123...",
      "email": "admin@acme.com",
      "firstName": "John",
      "lastName": "Admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2.3 Generate Organization Token (Platform Admin)
**URL:** `http://localhost:5000/api/v1/organizations/platform/tokens`  
**Method:** `POST`  
**Access:** Platform Admin Only  
**Description:** Generate token for new organization registration

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Request Body:**
```json
{
  "organizationName": "Acme Corporation",
  "email": "admin@acme.com",
  "expiresInDays": 7,
  "maxUses": 1,
  "metadata": {
    "notes": "Corporate client",
    "salesRep": "John Sales"
  }
}
```

**Required Fields:**
- `organizationName` (string)
- `email` (string)

**Optional Fields:**
- `expiresInDays` (number, default: 7)
- `maxUses` (number, default: 1)
- `metadata` (object)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Organization token generated successfully",
  "token": {
    "_id": "64token123...",
    "token": "org_abc123xyz789...",
    "organizationName": "Acme Corporation",
    "maxUses": 1,
    "usedCount": 0,
    "expiresAt": "2026-01-20T00:00:00.000Z",
    "isActive": true,
    "createdBy": "64admin123...",
    "createdAt": "2026-01-13T10:00:00.000Z",
    "metadata": {
      "notes": "Corporate client"
    }
  },
  "registrationUrl": "http://localhost:3000/register?token=org_abc123xyz789..."
}
```

---

### 2.4 List All Tokens (Platform Admin)
**URL:** `http://localhost:5000/api/v1/organizations/platform/tokens`  
**Method:** `GET`  
**Access:** Platform Admin Only  
**Description:** Get all organization tokens

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string: "active", "expired", "used")

**Example:** `GET /api/v1/organizations/platform/tokens?page=1&limit=10&status=active`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "_id": "64token123...",
        "token": "org_abc123xyz789...",
        "organizationName": "Acme Corporation",
        "email": "admin@acme.com",
        "usedCount": 0,
        "maxUses": 1,
        "isActive": true,
        "expiresAt": "2026-01-20T00:00:00.000Z",
        "createdAt": "2026-01-13T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3,
      "limit": 10
    }
  }
}
```

---

### 2.5 Revoke Token (Platform Admin)
**URL:** `http://localhost:5000/api/v1/organizations/platform/tokens/:tokenId`  
**Method:** `DELETE`  
**Access:** Platform Admin Only  
**Description:** Revoke/deactivate an organization token

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `tokenId` (string) - MongoDB ObjectId of token

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token revoked successfully"
}
```

---

### 2.6 List All Organizations (Platform Admin)
**URL:** `http://localhost:5000/api/v1/organizations/platform/organizations`  
**Method:** `GET`  
**Access:** Platform Admin Only  
**Description:** Get all organizations

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string: "active", "suspended", "inactive")
- `search` (string) - Search by name or slug

**Example:** `GET /api/v1/organizations/platform/organizations?page=1&limit=10&status=active`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "organizations": [
      {
        "_id": "64org123...",
        "name": "Acme Corporation",
        "slug": "acme-corp",
        "email": "contact@acme.com",
        "status": "active",
        "isActive": true,
        "createdAt": "2026-01-10T00:00:00.000Z",
        "stats": {
          "totalUsers": 150,
          "totalCourses": 25
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 5,
      "limit": 10
    }
  }
}
```

---

### 2.7 Get Organization by ID (Platform Admin)
**URL:** `http://localhost:5000/api/v1/organizations/platform/organizations/:orgId`  
**Method:** `GET`  
**Access:** Platform Admin Only  
**Description:** Get detailed information about specific organization

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `orgId` (string) - MongoDB ObjectId of organization

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64org123...",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "website": "https://acme.com",
    "status": "active",
    "isActive": true,
    "address": {
      "street": "123 Business Ave",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "createdAt": "2026-01-10T00:00:00.000Z",
    "updatedAt": "2026-01-13T10:00:00.000Z"
  }
}
```

---

### 2.8 Get My Organization Profile
**URL:** `http://localhost:5000/api/v1/organizations/profile`  
**Method:** `GET`  
**Access:** Private (Authenticated)  
**Description:** Get current user's organization profile

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64org123...",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "email": "contact@acme.com",
    "phone": "+1234567890",
    "website": "https://acme.com",
    "description": "Leading education provider",
    "status": "active"
  }
}
```

---

### 2.9 Update Organization Profile
**URL:** `http://localhost:5000/api/v1/organizations/profile`  
**Method:** `PUT`  
**Access:** Organization Admin Only  
**Description:** Update organization profile

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Request Body:**
```json
{
  "name": "Acme Corporation Ltd",
  "email": "info@acme.com",
  "phone": "+1234567890",
  "website": "https://www.acme.com",
  "description": "Updated description",
  "address": {
    "street": "456 New Address",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "country": "USA"
  },
  "logo": "https://acme.com/new-logo.png"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "data": {
    "_id": "64org123...",
    "name": "Acme Corporation Ltd",
    "email": "info@acme.com",
    "phone": "+1234567890",
    "updatedAt": "2026-01-13T12:00:00.000Z"
  }
}
```

---

## 3. 👥 User Management APIs

Base Path: `/api/users`

### 3.1 Get All Users
**URL:** `http://localhost:5000/api/users`  
**Method:** `GET`  
**Access:** Admin, Manager  
**Description:** Get all users with pagination and filters

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `role` (string: "student", "teacher", "admin", "manager", "course_creator")
- `status` (string: "active", "suspended", "inactive")
- `search` (string) - Search by name or email
- `sortBy` (string: "createdAt", "firstName", "email")
- `sortOrder` (string: "asc", "desc", default: "desc")

**Example:** `GET /api/users?page=1&limit=10&role=student&status=active&search=john`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "64user123...",
        "email": "john.doe@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "student",
        "status": "active",
        "emailVerified": true,
        "organizationId": "64org123...",
        "createdAt": "2026-01-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 15,
      "limit": 10
    }
  }
}
```

---

### 3.2 Get User Stats
**URL:** `http://localhost:5000/api/users/stats`  
**Method:** `GET`  
**Access:** Admin, Manager  
**Description:** Get user statistics

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 500,
    "byRole": {
      "student": 400,
      "teacher": 50,
      "admin": 10,
      "manager": 30,
      "course_creator": 10
    },
    "byStatus": {
      "active": 450,
      "suspended": 20,
      "inactive": 30
    },
    "verified": 480,
    "unverified": 20,
    "recentSignups": 15
  }
}
```

---

### 3.3 Get User by ID
**URL:** `http://localhost:5000/api/users/:id`  
**Method:** `GET`  
**Access:** Admin, Manager, or Own Profile  
**Description:** Get single user details

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `id` (string) - User MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64user123...",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "phone": "+1234567890",
    "role": "student",
    "status": "active",
    "emailVerified": true,
    "organizationId": "64org123...",
    "createdAt": "2026-01-10T10:00:00.000Z",
    "updatedAt": "2026-01-13T10:00:00.000Z"
  }
}
```

---

### 3.4 Create User
**URL:** `http://localhost:5000/api/users`  
**Method:** `POST`  
**Access:** Admin, Manager  
**Description:** Create new user (by admin)

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "username": "janesmith",
  "phone": "+1234567890",
  "role": "teacher",
  "status": "active",
  "emailVerified": true
}
```

**Required Fields:**
- `email` (string)
- `password` (string, min 6 characters)
- `firstName` (string)
- `lastName` (string)
- `role` (string)

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "_id": "64user456...",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "teacher",
    "status": "active"
  }
}
```

---

### 3.5 Update User
**URL:** `http://localhost:5000/api/users/:id`  
**Method:** `PUT`  
**Access:** Admin, Manager, or Own Profile  
**Description:** Update user details

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `id` (string) - User MongoDB ObjectId

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe Updated",
  "username": "johndoe_updated",
  "phone": "+1987654321",
  "bio": "Updated bio",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Note:** Regular users can only update limited fields (firstName, lastName, username, phone, bio, avatar). Admins can update all fields including role and status.

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "64user123...",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe Updated",
    "updatedAt": "2026-01-13T12:00:00.000Z"
  }
}
```

---

### 3.6 Change User Status
**URL:** `http://localhost:5000/api/users/:id/status`  
**Method:** `PATCH`  
**Access:** Admin, Manager  
**Description:** Change user status (activate/suspend/deactivate)

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `id` (string) - User MongoDB ObjectId

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Policy violation"
}
```

**Valid Status Values:**
- `active` - User can access system
- `suspended` - Temporarily blocked
- `inactive` - Permanently deactivated

**Success Response (200):**
```json
{
  "success": true,
  "message": "User status updated to suspended",
  "data": {
    "_id": "64user123...",
    "email": "user@example.com",
    "status": "suspended",
    "updatedAt": "2026-01-13T12:00:00.000Z"
  }
}
```

---

### 3.7 Delete User
**URL:** `http://localhost:5000/api/users/:id`  
**Method:** `DELETE`  
**Access:** Admin Only  
**Description:** Delete user (soft delete - sets status to inactive)

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `id` (string) - User MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 4. 📚 Category Management APIs

Base Path: `/api/categories`

### 4.1 Get All Categories (Tree Structure)
**URL:** `http://localhost:5000/api/categories`  
**Method:** `GET`  
**Access:** Public  
**Description:** Get categories in hierarchical tree structure

**Query Parameters:**
- `visible` (boolean, default: true) - Show only visible categories

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64cat123...",
      "name": "Programming",
      "slug": "programming",
      "description": "Programming courses",
      "visible": true,
      "sortOrder": 1,
      "courseCount": 15,
      "children": [
        {
          "_id": "64cat456...",
          "name": "JavaScript",
          "slug": "javascript",
          "parent": "64cat123...",
          "visible": true,
          "courseCount": 5,
          "children": []
        }
      ]
    }
  ]
}
```

---

### 4.2 Get All Categories (Flat List)
**URL:** `http://localhost:5000/api/categories/flat`  
**Method:** `GET`  
**Access:** Public  
**Description:** Get categories as flat list

**Query Parameters:**
- `visible` (boolean)
- `parent` (string) - Filter by parent category ID

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64cat123...",
      "name": "Programming",
      "slug": "programming",
      "description": "Programming courses",
      "parent": null,
      "visible": true,
      "sortOrder": 1,
      "courseCount": 15
    },
    {
      "_id": "64cat456...",
      "name": "JavaScript",
      "slug": "javascript",
      "parent": "64cat123...",
      "visible": true,
      "sortOrder": 1,
      "courseCount": 5
    }
  ]
}
```

---

### 4.3 Get Category by ID
**URL:** `http://localhost:5000/api/categories/:id`  
**Method:** `GET`  
**Access:** Public  
**Description:** Get single category with details

**URL Parameters:**
- `id` (string) - Category MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64cat123...",
    "name": "Programming",
    "slug": "programming",
    "description": "Learn programming from basics to advanced",
    "parent": null,
    "visible": true,
    "sortOrder": 1,
    "icon": "code",
    "color": "#3B82F6",
    "courseCount": 15,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-13T10:00:00.000Z"
  }
}
```

---

### 4.4 Get Category Courses
**URL:** `http://localhost:5000/api/categories/:id/courses`  
**Method:** `GET`  
**Access:** Public  
**Description:** Get all courses in specific category

**URL Parameters:**
- `id` (string) - Category MongoDB ObjectId

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `level` (string: "beginner", "intermediate", "advanced")
- `visible` (boolean, default: true)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "64cat123...",
      "name": "Programming",
      "slug": "programming"
    },
    "courses": [
      {
        "_id": "64course123...",
        "title": "JavaScript Fundamentals",
        "slug": "javascript-fundamentals",
        "shortDescription": "Learn JavaScript basics",
        "level": "beginner",
        "duration": 40,
        "enrollmentCount": 150,
        "rating": 4.5,
        "thumbnail": "https://example.com/thumb.jpg"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "pages": 2,
      "limit": 10
    }
  }
}
```

---

### 4.5 Create Category
**URL:** `http://localhost:5000/api/categories`  
**Method:** `POST`  
**Access:** Admin, Manager  
**Description:** Create new category

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Request Body:**
```json
{
  "name": "Data Science",
  "slug": "data-science",
  "description": "Learn data science and machine learning",
  "parent": null,
  "visible": true,
  "sortOrder": 5,
  "icon": "chart-line",
  "color": "#10B981"
}
```

**Required Fields:**
- `name` (string)
- `slug` (string, unique, lowercase, hyphenated)

**Optional Fields:**
- `description` (string)
- `parent` (string, ObjectId) - Parent category for subcategory
- `visible` (boolean, default: true)
- `sortOrder` (number, default: 0)
- `icon` (string)
- `color` (string, hex color)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "64cat789...",
    "name": "Data Science",
    "slug": "data-science",
    "description": "Learn data science and machine learning",
    "visible": true,
    "sortOrder": 5,
    "createdAt": "2026-01-13T12:00:00.000Z"
  }
}
```

---

### 4.6 Update Category
**URL:** `http://localhost:5000/api/categories/:id`  
**Method:** `PUT`  
**Access:** Admin, Manager  
**Description:** Update category

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `id` (string) - Category MongoDB ObjectId

**Request Body:**
```json
{
  "name": "Data Science & AI",
  "description": "Updated description",
  "visible": true,
  "sortOrder": 3,
  "color": "#8B5CF6"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "_id": "64cat789...",
    "name": "Data Science & AI",
    "slug": "data-science",
    "description": "Updated description",
    "updatedAt": "2026-01-13T12:30:00.000Z"
  }
}
```

---

### 4.7 Delete Category
**URL:** `http://localhost:5000/api/categories/:id`  
**Method:** `DELETE`  
**Access:** Admin, Manager  
**Description:** Delete category (must have no courses)

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `id` (string) - Category MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Cannot delete category with existing courses"
}
```

---

## 5. 📖 Course Management APIs

Base Path: `/api/courses`

### 5.1 Get All Courses
**URL:** `http://localhost:5000/api/courses`  
**Method:** `GET`  
**Access:** Public (shows only visible for non-admin)  
**Description:** Get all courses with filters and pagination

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `search` (string) - Search by title or description
- `category` (string) - Category ObjectId
- `level` (string: "beginner", "intermediate", "advanced")
- `status` (string: "draft", "published", "archived")
- `visible` (boolean)
- `featured` (boolean)
- `sortBy` (string: "createdAt", "title", "enrollmentCount", "rating")
- `sortOrder` (string: "asc", "desc")

**Example:** `GET /api/courses?page=1&limit=10&category=64cat123&level=beginner&search=javascript`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "64course123...",
        "title": "JavaScript Fundamentals",
        "slug": "javascript-fundamentals",
        "shortDescription": "Master JavaScript basics",
        "category": {
          "_id": "64cat123...",
          "name": "Programming"
        },
        "level": "beginner",
        "duration": 40,
        "status": "published",
        "visible": true,
        "featured": true,
        "thumbnail": "https://example.com/thumb.jpg",
        "enrollmentCount": 150,
        "rating": 4.5,
        "price": 0,
        "instructor": {
          "_id": "64user123...",
          "firstName": "John",
          "lastName": "Teacher"
        },
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 125,
      "page": 1,
      "pages": 13,
      "limit": 10
    }
  }
}
```

---

### 5.2 Get Course Stats
**URL:** `http://localhost:5000/api/courses/stats`  
**Method:** `GET`  
**Access:** Admin, Manager  
**Description:** Get course statistics

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 125,
    "byStatus": {
      "published": 100,
      "draft": 20,
      "archived": 5
    },
    "byLevel": {
      "beginner": 50,
      "intermediate": 45,
      "advanced": 30
    },
    "featured": 15,
    "totalEnrollments": 5000,
    "averageRating": 4.3
  }
}
```

---

### 5.3 Get Course by ID
**URL:** `http://localhost:5000/api/courses/:id`  
**Method:** `GET`  
**Access:** Public (if visible)  
**Description:** Get detailed course information

**URL Parameters:**
- `id` (string) - Course MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64course123...",
    "title": "JavaScript Fundamentals",
    "slug": "javascript-fundamentals",
    "shortDescription": "Master JavaScript basics",
    "description": "Comprehensive JavaScript course covering all fundamentals...",
    "category": {
      "_id": "64cat123...",
      "name": "Programming"
    },
    "level": "beginner",
    "duration": 40,
    "language": "English",
    "status": "published",
    "visible": true,
    "featured": true,
    "thumbnail": "https://example.com/thumb.jpg",
    "video": "https://example.com/intro.mp4",
    "enrollmentCount": 150,
    "rating": 4.5,
    "reviewCount": 45,
    "price": 0,
    "currency": "USD",
    "instructor": {
      "_id": "64user123...",
      "firstName": "John",
      "lastName": "Teacher",
      "email": "john.teacher@example.com"
    },
    "requirements": ["Basic computer knowledge"],
    "objectives": ["Understand JavaScript basics", "Build web applications"],
    "tags": ["javascript", "programming", "web-development"],
    "metadata": {
      "totalLessons": 25,
      "totalQuizzes": 5,
      "certificateAvailable": true
    },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-13T10:00:00.000Z"
  }
}
```

---

### 5.4 Create Course
**URL:** `http://localhost:5000/api/courses`  
**Method:** `POST`  
**Access:** Admin, Manager, Course Creator  
**Description:** Create new course

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Request Body:**
```json
{
  "title": "Advanced React Development",
  "slug": "advanced-react-development",
  "shortDescription": "Master advanced React concepts",
  "description": "Deep dive into advanced React patterns, hooks, and optimization...",
  "category": "64cat123...",
  "level": "advanced",
  "duration": 60,
  "language": "English",
  "status": "draft",
  "visible": false,
  "featured": false,
  "thumbnail": "https://example.com/react-thumb.jpg",
  "video": "https://example.com/react-intro.mp4",
  "price": 49.99,
  "currency": "USD",
  "requirements": [
    "Solid understanding of React basics",
    "JavaScript ES6+ knowledge"
  ],
  "objectives": [
    "Master advanced React hooks",
    "Implement complex state management",
    "Optimize React performance"
  ],
  "tags": ["react", "javascript", "frontend", "advanced"],
  "metadata": {
    "certificateAvailable": true,
    "skillLevel": "Advanced"
  }
}
```

**Required Fields:**
- `title` (string)
- `slug` (string, unique, lowercase, hyphenated)
- `shortDescription` (string)
- `category` (string, ObjectId)
- `level` (string: "beginner", "intermediate", "advanced")

**Success Response (201):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "_id": "64course456...",
    "title": "Advanced React Development",
    "slug": "advanced-react-development",
    "status": "draft",
    "instructor": "64user123...",
    "createdAt": "2026-01-13T12:00:00.000Z"
  }
}
```

---

### 5.5 Update Course
**URL:** `http://localhost:5000/api/courses/:id`  
**Method:** `PUT`  
**Access:** Admin, Manager, Course Creator (own courses)  
**Description:** Update course

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `id` (string) - Course MongoDB ObjectId

**Request Body:**
```json
{
  "title": "Advanced React Development - Updated",
  "shortDescription": "Updated description",
  "description": "Updated full description...",
  "level": "advanced",
  "duration": 65,
  "status": "published",
  "visible": true,
  "featured": true,
  "price": 59.99
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "_id": "64course456...",
    "title": "Advanced React Development - Updated",
    "status": "published",
    "visible": true,
    "updatedAt": "2026-01-13T13:00:00.000Z"
  }
}
```

---

### 5.6 Delete Course
**URL:** `http://localhost:5000/api/courses/:id`  
**Method:** `DELETE`  
**Access:** Admin, Manager  
**Description:** Delete/hide course

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `id` (string) - Course MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

---

### 5.7 Get Course Students
**URL:** `http://localhost:5000/api/courses/:id/students`  
**Method:** `GET`  
**Access:** Admin, Manager, Teacher, Course Creator  
**Description:** Get list of enrolled students

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `id` (string) - Course MongoDB ObjectId

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "64course123...",
      "title": "JavaScript Fundamentals"
    },
    "students": [
      {
        "_id": "64user123...",
        "email": "student@example.com",
        "firstName": "Jane",
        "lastName": "Student",
        "enrolledAt": "2026-01-10T10:00:00.000Z",
        "progress": 45,
        "status": "active"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 15,
      "limit": 10
    }
  }
}
```

---

## 6. 📝 Enrollment APIs

Base Path: `/api/enroll`

### 6.1 Create Enrollment
**URL:** `http://localhost:5000/api/enroll`  
**Method:** `POST`  
**Access:** Authenticated  
**Description:** Enroll in a course

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Request Body:**
```json
{
  "courseId": "64course123...",
  "userId": "64user123...",
  "status": "active"
}
```

**Success Response (200):**
```json
{
  "_id": "64enroll123...",
  "courseId": "64course123...",
  "userId": "64user123...",
  "status": "active",
  "enrolledAt": "2026-01-13T12:00:00.000Z"
}
```

---

## 7. 📊 Audit Log APIs

Base Path: `/api/audit`

### 7.1 Get All Audit Logs
**URL:** `http://localhost:5000/api/audit`  
**Method:** `GET`  
**Access:** Admin Only  
**Description:** Get audit logs with filters

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)
- `action` (string) - Filter by action type
- `userId` (string) - Filter by user
- `startDate` (string, ISO date)
- `endDate` (string, ISO date)

**Example:** `GET /api/audit?page=1&limit=20&action=user_login&startDate=2026-01-01`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "64audit123...",
        "action": "user_login",
        "userId": "64user123...",
        "userName": "John Doe",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "details": {
          "success": true,
          "method": "email"
        },
        "timestamp": "2026-01-13T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1500,
      "page": 1,
      "pages": 30,
      "limit": 50
    }
  }
}
```

---

### 7.2 Get Audit Stats
**URL:** `http://localhost:5000/api/audit/stats`  
**Method:** `GET`  
**Access:** Admin Only  
**Description:** Get audit statistics

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalLogs": 15000,
    "last24Hours": 250,
    "last7Days": 1500,
    "byAction": {
      "user_login": 5000,
      "user_created": 200,
      "course_created": 50,
      "user_updated": 800
    },
    "topUsers": [
      {
        "userId": "64user123...",
        "userName": "Admin User",
        "actionCount": 150
      }
    ]
  }
}
```

---

### 7.3 Get Recent Activity
**URL:** `http://localhost:5000/api/audit/recent`  
**Method:** `GET`  
**Access:** Admin Only  
**Description:** Get recent activity

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Query Parameters:**
- `limit` (number, default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64audit123...",
      "action": "course_created",
      "userId": "64user123...",
      "userName": "Jane Teacher",
      "details": {
        "courseTitle": "New Course"
      },
      "timestamp": "2026-01-13T12:05:00.000Z"
    }
  ]
}
```

---

### 7.4 Get User Audit Logs
**URL:** `http://localhost:5000/api/audit/user/:userId`  
**Method:** `GET`  
**Access:** Admin or Own Logs  
**Description:** Get audit logs for specific user

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `userId` (string) - User MongoDB ObjectId

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64user123...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "logs": [
      {
        "_id": "64audit123...",
        "action": "user_login",
        "ipAddress": "192.168.1.1",
        "timestamp": "2026-01-13T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 85,
      "page": 1,
      "pages": 2,
      "limit": 50
    }
  }
}
```

---

## 8. 🗄️ Cache Management APIs

Base Path: `/api/cache`

### 8.1 Get Cache Stats
**URL:** `http://localhost:5000/api/cache/stats`  
**Method:** `GET`  
**Access:** Admin Only  
**Description:** Get Redis cache statistics

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "keys": 150,
    "memory": "2.5MB",
    "hitRate": 85.5,
    "stats": {
      "categories": 25,
      "courses": 100,
      "users": 25
    }
  }
}
```

---

### 8.2 Flush All Cache
**URL:** `http://localhost:5000/api/cache/flush`  
**Method:** `DELETE`  
**Access:** Admin Only  
**Description:** Delete all cache (use with caution!)

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "All cache flushed successfully"
}
```

---

### 8.3 Delete Cache Key
**URL:** `http://localhost:5000/api/cache/:key`  
**Method:** `DELETE`  
**Access:** Admin Only  
**Description:** Delete specific cache key

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `key` (string) - Cache key to delete

**Example:** `DELETE /api/cache/categories:all`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cache key deleted successfully"
}
```

---

### 8.4 Delete Cache by Pattern
**URL:** `http://localhost:5000/api/cache/pattern/:pattern`  
**Method:** `DELETE`  
**Access:** Admin Only  
**Description:** Delete multiple cache keys by pattern

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**URL Parameters:**
- `pattern` (string) - Pattern to match (e.g., "courses:*")

**Example:** `DELETE /api/cache/pattern/courses:*`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cache keys matching pattern deleted",
  "count": 15
}
```

---

### 8.5 Invalidate Cache by Type
**URL:** `http://localhost:5000/api/cache/invalidate`  
**Method:** `POST`  
**Access:** Admin, Manager  
**Description:** Invalidate specific cache types

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Request Body:**
```json
{
  "type": "courses"
}
```

**Valid Types:**
- `categories`
- `courses`
- `users`
- `all`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Course cache invalidated successfully"
}
```

---

## 📮 Postman Setup Guide

### Environment Setup

1. **Create New Environment**
   - Name: `LMS Development`
   - Variables:
     ```
     base_url: http://localhost:5000
     auth_token: (leave empty, will be set automatically)
     user_id: (leave empty)
     org_id: (leave empty)
     ```

### Collection Structure

```
LMS API Collection
├── 1. Authentication
│   ├── Register
│   ├── Login (Platform Admin)
│   ├── Login (User)
│   ├── Get Current User
│   ├── Logout
│   ├── Send Verification Email
│   ├── Forgot Password
│   ├── Reset Password
│   └── Change Password
├── 2. Organizations
│   ├── Generate Token (Platform Admin)
│   ├── List Tokens
│   ├── Validate Token
│   ├── Register Organization
│   ├── List All Organizations
│   ├── Get Organization by ID
│   ├── Get My Profile
│   └── Update Profile
├── 3. Users
│   ├── Get All Users
│   ├── Get User Stats
│   ├── Get User by ID
│   ├── Create User
│   ├── Update User
│   ├── Change User Status
│   └── Delete User
├── 4. Categories
│   ├── Get All (Tree)
│   ├── Get All (Flat)
│   ├── Get by ID
│   ├── Get Category Courses
│   ├── Create Category
│   ├── Update Category
│   └── Delete Category
├── 5. Courses
│   ├── Get All Courses
│   ├── Get Course Stats
│   ├── Get by ID
│   ├── Create Course
│   ├── Update Course
│   ├── Delete Course
│   └── Get Course Students
├── 6. Enrollments
│   └── Create Enrollment
├── 7. Audit Logs
│   ├── Get All Logs
│   ├── Get Stats
│   ├── Get Recent Activity
│   └── Get User Logs
└── 8. Cache
    ├── Get Stats
    ├── Flush All
    ├── Delete Key
    ├── Delete Pattern
    └── Invalidate Type
```

### Global Headers

Add these to Collection → Authorization:
```
Type: Bearer Token
Token: {{auth_token}}
```

### Pre-request Scripts (Collection Level)

```javascript
// Add timestamp
pm.variables.set("timestamp", new Date().toISOString());

// Log request details
console.log(`${pm.request.method} ${pm.request.url}`);
```

### Test Scripts (Collection Level)

```javascript
// Check response time
pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Check status code
pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

// Check JSON structure
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});
```

### Login Test Script (Save Token)

```javascript
// For Login endpoint
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    
    // Save token
    pm.environment.set("auth_token", jsonData.data.token);
    
    // Save user info
    pm.environment.set("user_id", jsonData.data.user._id);
    if (jsonData.data.user.organizationId) {
        pm.environment.set("org_id", jsonData.data.user.organizationId);
    }
    
    console.log("✅ Token saved:", jsonData.data.token.substring(0, 20) + "...");
}
```

### Common Query Parameters

For endpoints with pagination:
```
page: 1
limit: 10
sortBy: createdAt
sortOrder: desc
```

---

## 🔄 Typical API Usage Flow

### 1. **Initial Setup (Platform Admin)**

```
1. Run createPlatformAdmin.js script
2. POST /api/auth/login
   Body: { email: "admin@yourdomain.com", password: "Admin@123" }
3. Save received token
```

### 2. **Create Organization**

```
1. POST /api/v1/organizations/platform/tokens
   Body: { organizationName: "Acme", email: "admin@acme.com" }
2. Copy token from response
3. POST /api/v1/organizations/register
   Body: { token, organization: {...}, superAdmin: {...} }
4. Save organization admin token
```

### 3. **Manage Categories**

```
1. POST /api/categories
   Body: { name: "Programming", slug: "programming" }
2. POST /api/categories
   Body: { name: "JavaScript", slug: "javascript", parent: <programming_id> }
3. GET /api/categories (verify tree structure)
```

### 4. **Create Courses**

```
1. POST /api/courses
   Body: { title: "JS Basics", category: <cat_id>, level: "beginner", ... }
2. PUT /api/courses/:id
   Body: { status: "published", visible: true }
3. GET /api/courses (view public list)
```

### 5. **User Management**

```
1. POST /api/users (create teacher)
   Body: { email, password, firstName, lastName, role: "teacher" }
2. POST /api/users (create students)
3. GET /api/users?role=student&status=active
```

### 6. **Enrollments**

```
1. POST /api/enroll
   Body: { courseId: <course_id>, userId: <student_id> }
2. GET /api/courses/:id/students (view enrolled students)
```

---

## 🚨 Common Error Codes

```
200 - OK (Success)
201 - Created (Resource created successfully)
400 - Bad Request (Validation error, missing fields)
401 - Unauthorized (Invalid or missing token)
403 - Forbidden (Insufficient permissions)
404 - Not Found (Resource doesn't exist)
409 - Conflict (Duplicate resource, e.g., email exists)
500 - Internal Server Error (Server error)
```

---

## 📝 Important Notes

1. **Authentication:** Most endpoints require JWT token in Authorization header
2. **Organization Context:** APIs automatically scope to user's organization
3. **Pagination:** Default is page=1, limit=20
4. **Caching:** Categories and courses are cached in Redis
5. **Audit Logs:** All critical actions are logged automatically
6. **Soft Delete:** User deletion sets status to 'inactive'
7. **Email Verification:** Optional but recommended for security
8. **Password Requirements:** Minimum 6 characters
9. **Role Hierarchy:** Platform Admin > Admin > Manager > Teacher > Student
10. **Token Expiry:** JWT tokens expire in 24 hours by default

---

## 🔧 Testing Checklist

- [ ] Platform Admin login
- [ ] Generate organization token
- [ ] Register new organization
- [ ] Organization admin login
- [ ] Create categories (parent and child)
- [ ] Create course in category
- [ ] Publish course
- [ ] Create users (different roles)
- [ ] Enroll student in course
- [ ] View audit logs
- [ ] Check cache stats
- [ ] Test search and filters
- [ ] Test pagination
- [ ] Test error handling
- [ ] Test permissions (different roles)

---

**End of Documentation**

For support or issues, contact: support@yourdomain.com
