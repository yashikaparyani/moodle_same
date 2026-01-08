# 📚 LMS Backend - Complete API Documentation

**Base URL:** `http://localhost:5000`

---

## 🔐 Authentication APIs

### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "phone": "+91-9876543210",
  "role": "student"  // Optional: admin, manager, course_creator, teacher, non_editing_teacher, student
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@lms.com",
  "password": "Admin123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "email": "admin@lms.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "admin@lms.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "emailVerified": false
  }
}
```

### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5. Send Email Verification
```http
POST /api/auth/send-verification
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "Verification email sent"
}
```

### 6. Verify Email
```http
GET /api/auth/verify-email/:token

Response: 200 OK
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 7. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

### 8. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 9. Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 👥 User Management APIs

### 1. Get All Users (Admin/Manager)
```http
GET /api/users
Authorization: Bearer <admin-token>

Query Params:
  - page=1
  - limit=10
  - role=student
  - status=active
  - search=john

Response: 200 OK
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get User Stats
```http
GET /api/users/stats
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "activeUsers": 95,
    "suspendedUsers": 3,
    "inactiveUsers": 2,
    "adminCount": 2,
    "managerCount": 5,
    "teacherCount": 15,
    "studentCount": 78
  }
}
```

### 3. Get Single User
```http
GET /api/users/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "status": "active"
  }
}
```

### 4. Create User (Admin/Manager)
```http
POST /api/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "role": "student",
  "phone": "+91-9876543210"
}

Response: 201 Created
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": { ... }
  }
}
```

### 5. Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+91-1234567890",
  "bio": "My bio"
}

Response: 200 OK
{
  "success": true,
  "message": "User updated successfully",
  "data": { ... }
}
```

### 6. Change User Status (Admin/Manager)
```http
PATCH /api/users/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "suspended"  // active, suspended, inactive
}

Response: 200 OK
{
  "success": true,
  "message": "User status changed to suspended"
}
```

### 7. Delete User (Admin)
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 📝 Audit Log APIs

### 1. Get Audit Logs (Admin)
```http
GET /api/audit
Authorization: Bearer <admin-token>

Query Params:
  - page=1
  - limit=20
  - userId=...
  - action=user_created
  - resourceType=user
  - startDate=2024-01-01
  - endDate=2024-12-31

Response: 200 OK
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "...",
        "userId": { "email": "admin@lms.com" },
        "action": "user_created",
        "resourceType": "user",
        "ipAddress": "127.0.0.1",
        "timestamp": "2024-01-08T10:30:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### 2. Get User's Audit Logs
```http
GET /api/audit/user/:userId
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "data": [...audit logs...]
}
```

---

## 🗄️ Cache Management APIs (Admin Only)

### 1. Get Cache Stats
```http
GET /api/cache/stats
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "data": {
    "connected": true,
    "dbSize": 42,
    "info": "..."
  }
}
```

### 2. Flush All Cache
```http
DELETE /api/cache/flush
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "message": "All cache cleared successfully"
}
```

### 3. Delete Cache Key
```http
DELETE /api/cache/:key
Authorization: Bearer <admin-token>

Example: DELETE /api/cache/user:123

Response: 200 OK
{
  "success": true,
  "message": "Cache key deleted successfully"
}
```

### 4. Delete Cache Pattern
```http
DELETE /api/cache/pattern/:pattern
Authorization: Bearer <admin-token>

Example: DELETE /api/cache/pattern/user:*

Response: 200 OK
{
  "success": true,
  "message": "Cache pattern deleted successfully"
}
```

### 5. Invalidate Cache by Type
```http
POST /api/cache/invalidate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "user",  // user, course, enrollment, category, all
  "id": "123"      // Optional
}

Response: 200 OK
{
  "success": true,
  "message": "Cache invalidated for type: user"
}
```

---

## 📚 Course Management APIs (TO BE IMPLEMENTED)

### 1. Get All Courses
```http
GET /api/courses
Query Params:
  - page=1
  - limit=10
  - visibility=show
  - categoryId=...
  - search=javascript

Response: 200 OK
{
  "success": true,
  "data": [...courses...],
  "pagination": { ... }
}
```

### 2. Get Course by ID
```http
GET /api/courses/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "...",
    "fullName": "JavaScript Fundamentals",
    "shortName": "JS101",
    "courseCode": "CS101",
    "summary": "Learn JavaScript basics",
    "categoryId": { ... },
    "visibility": "show"
  }
}
```

### 3. Create Course (Admin/Manager/Course Creator)
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "JavaScript Fundamentals",
  "shortName": "JS101",
  "courseCode": "CS101",
  "categoryId": "category_id_here",
  "summary": "Learn JavaScript basics",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "visibility": "show"
}

Response: 201 Created
{
  "success": true,
  "message": "Course created successfully",
  "data": { ... }
}
```

### 4. Update Course
```http
PUT /api/courses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "Updated Course Name",
  "summary": "Updated summary"
}

Response: 200 OK
{
  "success": true,
  "message": "Course updated successfully",
  "data": { ... }
}
```

### 5. Delete Course (Admin/Manager)
```http
DELETE /api/courses/:id
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "message": "Course deleted successfully"
}
```

### 6. Get Course Students
```http
GET /api/courses/:id/students
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [...enrolled students...],
  "count": 25
}
```

---

## 📁 Category Management APIs (TO BE IMPLEMENTED)

### 1. Get All Categories
```http
GET /api/categories

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Programming",
      "description": "Programming courses",
      "parentId": null,
      "children": [
        {
          "_id": "...",
          "name": "Web Development",
          "parentId": "...",
          "children": []
        }
      ]
    }
  ],
  "count": 10
}
```

### 2. Get Category by ID
```http
GET /api/categories/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "category": { ... },
    "courses": [...courses in this category...],
    "courseCount": 5
  }
}
```

### 3. Create Category (Admin/Manager)
```http
POST /api/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Programming",
  "description": "Programming courses",
  "parentId": null  // Optional: for subcategory
}

Response: 201 Created
{
  "success": true,
  "message": "Category created successfully",
  "data": { ... }
}
```

### 4. Update Category
```http
PUT /api/categories/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Category Name",
  "description": "Updated description"
}

Response: 200 OK
{
  "success": true,
  "message": "Category updated successfully",
  "data": { ... }
}
```

### 5. Delete Category (Admin/Manager)
```http
DELETE /api/categories/:id
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "message": "Category deleted successfully"
}

Note: Cannot delete if category has courses or subcategories
```

---

## 🎓 Enrollment APIs (TO BE IMPLEMENTED)

### 1. Enroll User in Course
```http
POST /api/enroll
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "course_id_here",
  "userId": "user_id_here"  // Optional: defaults to current user
}

Response: 201 Created
{
  "success": true,
  "message": "Enrolled successfully",
  "data": { ... }
}
```

### 2. Get My Enrolled Courses
```http
GET /api/enroll/my-courses
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "enrollment_id",
      "courseId": {
        "fullName": "JavaScript Fundamentals",
        "shortName": "JS101",
        "courseImage": "..."
      },
      "status": "active",
      "enrolledAt": "2024-01-08T10:00:00Z"
    }
  ],
  "count": 5
}
```

### 3. Get Course Enrollments (Teacher/Admin)
```http
GET /api/enroll/course/:courseId/enrollments
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [...enrollments...],
  "count": 25
}
```

### 4. Unenroll User
```http
DELETE /api/enroll/:enrollmentId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Unenrolled successfully"
}
```

---

## 🔑 Role-Based Access

| Role | Permissions |
|------|-------------|
| **admin** | Full access to everything |
| **manager** | User management, course management, reports |
| **course_creator** | Create/edit courses, view enrollments |
| **teacher** | View/grade students, manage course content |
| **non_editing_teacher** | View/grade only, cannot edit |
| **student** | Enroll in courses, view content, submit work |

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (development only)"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ]
}
```

---

## 🧪 Testing with Postman

### 1. Create Environment
- Variable: `baseUrl` = `http://localhost:5000`
- Variable: `token` = (set after login)

### 2. Login Flow
1. POST `{{baseUrl}}/api/auth/login`
2. Copy token from response
3. Set `token` variable
4. Use `{{token}}` in Authorization headers

### 3. Sample Collection Structure
```
LMS API
├── Auth
│   ├── Register
│   ├── Login
│   ├── Get Me
│   └── Logout
├── Users
│   ├── Get All Users
│   ├── Get User Stats
│   ├── Create User
│   └── Update User
├── Courses
│   ├── Get All Courses
│   ├── Create Course
│   └── Get Course Details
└── Categories
    ├── Get All Categories
    └── Create Category
```

---

## 🚀 Quick Start

**1. Login as Admin:**
```bash
POST /api/auth/login
{
  "email": "admin@lms.com",
  "password": "Admin123"
}
```

**2. Get Users:**
```bash
GET /api/users
Authorization: Bearer <token>
```

**3. Create Course:**
```bash
POST /api/courses
Authorization: Bearer <token>
{
  "fullName": "My First Course",
  "shortName": "COURSE101"
}
```

---

## 📝 Notes

- All authenticated routes require `Authorization: Bearer <token>` header
- Admin credentials: `admin@lms.com` / `Admin123`
- Timestamps are in ISO 8601 format (UTC)
- MongoDB ObjectIds are used for all IDs
- Passwords are never returned in responses
- All dates accept ISO format: `2024-01-08T10:30:00Z`

---

**✅ Implemented APIs:** 25+
**🔄 In Progress:** Course & Category Management
**📋 Planned:** Quiz, Assignments, Grading, Forums

**Server:** `http://localhost:5000`
**Status:** ✅ Running with MongoDB + Redis
