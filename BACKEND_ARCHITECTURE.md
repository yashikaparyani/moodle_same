# 🎓 LMS Backend - Complete Architecture Analysis

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Pattern](#architecture-pattern)
3. [Multi-Tenancy Implementation](#multi-tenancy-implementation)
4. [Database Schema (45+ Models)](#database-schema)
5. [Authentication & Authorization Flow](#authentication--authorization-flow)
6. [API Organization](#api-organization)
7. [Middleware Chain](#middleware-chain)
8. [Security Features](#security-features)
9. [Caching Strategy](#caching-strategy)
10. [File Upload System](#file-upload-system)
11. [Request Flow Diagram](#request-flow-diagram)

---

## 🎯 System Overview

**Project Type**: Multi-Tenant Learning Management System (LMS)

**Technology Stack**:
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB (Mongoose 9.1.1)
- **Caching**: Redis (optional - ioredis 5.9.0)
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Security**: Helmet 7.1.0, bcrypt 3.0.3
- **Performance**: Compression 1.7.4, express-rate-limit 7.1.5
- **Logging**: Winston 3.11.0
- **API Docs**: Swagger/OpenAPI 3.0

**Key Features**:
- Multi-tenant architecture (organizations)
- Role-based access control (8 roles)
- Course management with sections & activities
- Assessment & grading system
- Badge & certificate issuance
- Calendar events & task management
- Forum & messaging system
- Attendance tracking
- Audit logging
- File upload with security

---

## 🏗️ Architecture Pattern

### **MVC (Model-View-Controller) Pattern**

```
Request Flow:
Client → Routes → Middleware → Controller → Service → Model → Database
                                    ↓
                                 Response
```

### **Directory Structure**
```
backend/
├── config/              # Configuration files
│   ├── db.js           # MongoDB connection
│   ├── redis.js        # Redis connection
│   ├── swagger.js      # API documentation
│   └── rateLimiter.js  # Rate limiting config
│
├── controllers/         # Business logic
│   ├── auth/           # Authentication controllers
│   ├── user/           # User management
│   ├── course/         # Course management
│   ├── calendar/       # Calendar & events
│   ├── organization/   # Organization management
│   ├── rbac/           # Role-based access control
│   ├── audit/          # Audit logging
│   └── cache/          # Cache management
│
├── models/             # Database schemas (45+ models)
│   ├── User.js
│   ├── Organization.js
│   ├── Course.js
│   ├── Role.js
│   └── ... (41 more models)
│
├── routes/             # API endpoints
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── course.routes.js
│   ├── organization.routes.js
│   ├── upload.routes.js
│   └── ... (9 routes files)
│
├── middleware/         # Request processors
│   ├── authMiddleware.js          # JWT validation
│   ├── roleMiddleware.js          # RBAC authorization
│   ├── organizationMiddleware.js  # Multi-tenancy
│   ├── errorHandler.js            # Global error handling
│   ├── logger.js                  # Request logging
│   └── fileUploadMiddleware.js    # File upload security
│
├── services/           # Reusable business logic
│   ├── auditService.js
│   ├── cacheService.js
│   └── organizationService.js
│
├── scripts/            # Database initialization
│   ├── runAllInitializers.js
│   ├── initializeRoles.js
│   ├── initializeSettings.js
│   ├── initializeGradeScales.js
│   └── createPlatformAdmin.js
│
├── utils/              # Helper functions
│   └── errorHandler.js
│
├── uploads/            # Uploaded files
│   ├── documents/
│   ├── images/
│   ├── videos/
│   ├── profile-pictures/
│   ├── course-materials/
│   └── assignments/
│
├── logs/               # Application logs
│   ├── app.log
│   ├── error.log
│   └── combined.log
│
└── server.js           # Application entry point
```

---

## 🏢 Multi-Tenancy Implementation

### **Two-Level Admin Structure**

**1. Platform Admin (Super Admin)**
- User model: `isPlatformAdmin: true`
- Created via script: `scripts/createPlatformAdmin.js`
- Default credentials: `admin@yourdomain.com / Admin@123`
- Can create and manage ALL organizations
- Not bound to any organization

**2. Organization Admin**
- Organization model: `superAdminId` field
- Created during organization registration
- Manages ONLY their organization's data
- Bound to specific organization

### **Data Isolation Strategy**

```javascript
// Every request with organization context adds:
req.organizationId = '<organization-id>';

// MongoDB queries automatically scoped:
Course.find({ organization: req.organizationId });
User.find({ organization: req.organizationId });
```

### **Organization Middleware Chain**
```javascript
// 1. Extract organization from request
setOrganizationContext(req, res, next)

// 2. Scope all queries to organization
scopeToOrganization(req, res, next)

// This ensures complete data isolation between organizations
```

---

## 🗄️ Database Schema (45+ Models)

### **Core Models**

#### **User Management**
1. **User** - User accounts with roles
   - Fields: name, email, password, organization, isPlatformAdmin
   - Relations: UserRole, Enrollment, Badge, Certificate

2. **Role** - System roles (8 types)
   - Types: admin, manager, teacher, student, teaching_assistant, observer, course_creator, non_editing_teacher
   - Relations: UserRole

3. **UserRole** - Many-to-many relationship
   - Links users to multiple roles

4. **Organization** - Tenant organizations
   - Fields: name, domain, settings, superAdminId
   - Relations: All models (organization field)

#### **Course Structure**
5. **Course** - Main course entity
   - Fields: name, description, category, organization, instructor
   - Relations: Section, Enrollment, Assessment, Grade

6. **Category** - Course categorization
   - Hierarchical structure (parent-child)

7. **Section** - Course sections/modules
   - Contains activities

8. **Activity** - Course content units
   - Types: video, reading, quiz, assignment

9. **Resourse** - Course resources/files

#### **Enrollment & Learning**
10. **Enrollment** - User course enrollments
    - Fields: user, course, status, completionDate

11. **ActivityCompletion** - Track activity progress

12. **Cohort** - Student groups

13. **Group** - Collaboration groups

14. **Grouping** - Group collections

15. **GroupMember** - Group memberships

16. **Batch** - Student batches

17. **BatchMember** - Batch memberships

#### **Assessment & Grading**
18. **Assessment** - Assignments, exams
    - Fields: title, type, dueDate, maxScore

19. **Quiz** - Quiz/test entity

20. **Question** - Quiz questions

21. **QuizAttempt** - Student quiz attempts

22. **Submission** - Assignment submissions

23. **Grade** - Student grades
    - Relations: GradeScale

24. **GradeScale** - Grading rubrics
    - Example: A (90-100), B (80-89)

#### **Communication**
25. **Forum** - Discussion forums

26. **ForumPost** - Forum posts/replies

27. **Message** - Direct messaging

28. **Notification** - User notifications

29. **Announcement** - Course announcements

#### **Gamification**
30. **Badge** - Achievement badges
    - Fields: name, description, criteria

31. **BadgeIssued** - Awarded badges

32. **Certificate** - Completion certificates

33. **CertificateIssued** - Awarded certificates

#### **Calendar & Tasks**
34. **CalendarEvent** - Events
    - Fields: title, startDate, endDate, type, organization

35. **Event** - Generic events

36. **Task** - To-do tasks
    - Fields: title, dueDate, priority, status

#### **Attendance & Tracking**
37. **Attendance** - Class attendance

38. **Log** - User activity logs

39. **AuditLog** - System audit trail
    - Fields: userId, action, ipAddress, userAgent

40. **Report** - Generated reports

#### **Content Management**
41. **File** - File metadata

42. **Tag** - Content tags

43. **Settings** - System settings

#### **Security**
44. **EmailVerificationToken** - Email verification

45. **PasswordResetToken** - Password reset tokens

46. **OrganizationToken** - Organization access tokens

---

## 🔐 Authentication & Authorization Flow

### **Authentication (JWT)**

```
1. Login Request
   ↓
2. Validate Credentials (bcrypt)
   ↓
3. Generate JWT Token (24h expiry)
   ↓
4. Return Token + User Data
   ↓
5. Client Stores Token
   ↓
6. Subsequent Requests Include:
   Header: Authorization: Bearer <token>
```

### **JWT Payload**
```javascript
{
  userId: "507f1f77bcf86cd799439011",
  email: "user@example.com",
  organizationId: "507f1f77bcf86cd799439012", // null for Platform Admin
  isPlatformAdmin: false,
  iat: 1704123456,
  exp: 1704209856
}
```

### **Authorization (RBAC)**

```javascript
// Middleware chain for protected routes
authenticate         // Verify JWT
↓
checkRole(['teacher', 'admin'])  // Verify role permissions
↓
Controller           // Execute business logic
```

### **Role Hierarchy**
```
Platform Admin (isPlatformAdmin: true)
├── Organization Admin (role: admin)
│   ├── Manager (role: manager)
│   │   ├── Teacher (role: teacher)
│   │   ├── Course Creator (role: course_creator)
│   │   └── Non-Editing Teacher (role: non_editing_teacher)
│   └── Teaching Assistant (role: teaching_assistant)
├── Student (role: student)
└── Observer (role: observer)
```

---

## 🌐 API Organization

### **API Versioning**
```
/api/v1/<resource>
```

### **Endpoint Categories**

**1. Authentication** (`/api/auth`)
- POST `/login` - User login
- POST `/register` - User registration
- POST `/forgot-password` - Request password reset
- POST `/reset-password` - Reset password
- POST `/verify-email` - Email verification
- POST `/refresh-token` - Refresh JWT

**2. Organizations** (`/api/v1/organizations`)
- POST `/register` - Create organization (Platform Admin)
- GET `/` - List organizations
- GET `/:id` - Get organization
- PUT `/:id` - Update organization
- DELETE `/:id` - Delete organization

**3. Users** (`/api/users`)
- POST `/` - Create user
- GET `/` - List users (scoped to organization)
- GET `/:id` - Get user
- PUT `/:id` - Update user
- DELETE `/:id` - Delete user
- POST `/:id/roles` - Assign role

**4. Courses** (`/api/courses`)
- POST `/` - Create course
- GET `/` - List courses
- GET `/:id` - Get course details
- PUT `/:id` - Update course
- DELETE `/:id` - Delete course
- POST `/:id/sections` - Add section
- POST `/:id/enroll` - Enroll student

**5. Enrollments** (`/api/enroll`)
- POST `/` - Enroll user
- GET `/user/:userId` - Get user enrollments
- GET `/course/:courseId` - Get course enrollments
- DELETE `/:id` - Unenroll

**6. Calendar** (`/api/calendar-events`)
- POST `/` - Create event
- GET `/` - List events (filtered by organization)
- GET `/:id` - Get event
- PUT `/:id` - Update event
- DELETE `/:id` - Delete event

**7. Tasks** (`/api/tasks`)
- POST `/` - Create task
- GET `/` - List tasks
- PUT `/:id` - Update task
- DELETE `/:id` - Delete task
- PATCH `/:id/complete` - Mark complete

**8. Categories** (`/api/categories`)
- POST `/` - Create category
- GET `/` - List categories
- PUT `/:id` - Update category
- DELETE `/:id` - Delete category

**9. Audit** (`/api/audit`)
- GET `/logs` - Get audit logs (admin only)
- GET `/user/:userId` - Get user activity

**10. Cache** (`/api/cache`)
- DELETE `/clear` - Clear Redis cache (admin only)
- GET `/stats` - Cache statistics

**11. File Upload** (`/api/upload`)
- POST `/profile-picture` - Upload profile picture
- POST `/image` - Upload image
- POST `/document` - Upload document
- POST `/video` - Upload video
- POST `/course-material` - Upload course files
- POST `/assignment` - Upload assignment
- DELETE `/delete` - Delete file

---

## ⚙️ Middleware Chain

### **Request Processing Order**

```javascript
1. helmet()                    // Security headers
2. cors()                      // Cross-Origin Resource Sharing
3. compression()               // Response compression
4. express.json()              // Parse JSON body
5. express.urlencoded()        // Parse URL-encoded body
6. logger                      // Winston logging
7. docsLimiter                 // Swagger docs rate limit (if /api-docs)
8. generalLimiter              // General API rate limit
9. setOrganizationContext      // Extract organization from request
10. scopeToOrganization        // Scope queries to organization
11. authenticate               // Verify JWT (if route requires)
12. checkRole()                // Verify user role (if route requires)
13. uploadLimiter              // File upload rate limit (if upload route)
14. Controller                 // Execute business logic
15. errorHandler               // Global error handling
```

### **Security Middleware Details**

**helmet()** - Sets security headers:
- Content-Security-Policy
- X-DNS-Prefetch-Control
- X-Frame-Options
- X-Download-Options
- X-Content-Type-Options
- X-XSS-Protection

**cors()** - Allows cross-origin requests:
```javascript
{
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}
```

**Rate Limiters**:
- General: 100 req/15min
- Auth: 5 req/15min
- Password Reset: 3 req/hour
- User Creation: 20 req/hour
- Upload: 10 req/hour
- Org Registration: 3 req/day
- Docs: 30 req/15min

---

## 🛡️ Security Features

### **1. Authentication Security**
- ✅ JWT with 24-hour expiry
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Email verification tokens
- ✅ Password reset tokens (1-hour expiry)
- ✅ Refresh token mechanism

### **2. Authorization Security**
- ✅ Role-based access control (RBAC)
- ✅ Organization-scoped data access
- ✅ Permission checks on every endpoint

### **3. Input Validation**
- ✅ Express body parser with size limits (50MB)
- ✅ MongoDB query sanitization (Mongoose)
- ✅ File upload validation (whitelist approach)

### **4. Rate Limiting**
- ✅ 7 specialized rate limiters
- ✅ IP-based throttling
- ✅ Per-endpoint configuration

### **5. File Upload Security**
- ✅ Whitelist file types
- ✅ Block 44+ dangerous extensions
- ✅ MIME type validation
- ✅ Size limits per category
- ✅ Filename sanitization
- ✅ Secure random filenames
- ✅ Directory traversal prevention

### **6. Infrastructure Security**
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ HTTPS ready (via reverse proxy)
- ✅ Environment variable protection (.env)

### **7. Logging & Auditing**
- ✅ Winston logging (file + console)
- ✅ Audit trail for all actions
- ✅ IP address & User-Agent tracking
- ✅ Error logging with stack traces

---

## 🚀 Caching Strategy

### **Redis Integration (Optional)**

**Cache Layers**:
1. **Session Cache** - User sessions
2. **Query Cache** - Frequent database queries
3. **API Response Cache** - Computed responses

**Cache Service** (`services/cacheService.js`):
```javascript
// Get from cache
const data = await cacheService.get('key');

// Set to cache (TTL: 1 hour)
await cacheService.set('key', data, 3600);

// Delete from cache
await cacheService.delete('key');

// Clear all cache
await cacheService.clear();
```

**Cached Endpoints**:
- Course listings
- User profiles
- Organization details
- Category trees

**Cache Invalidation**:
- On data update/delete
- Manual clear endpoint (`/api/cache/clear`)

---

## 📂 File Upload System

### **Security Architecture**

**Whitelist Approach**:
- Only explicitly allowed file types accepted
- Dangerous extensions blocked: exe, bat, sh, js, dll, etc.

**Validation Layers**:
1. File extension check
2. MIME type validation
3. File size validation
4. Filename sanitization
5. Null byte detection
6. Directory traversal prevention

**Storage Structure**:
```
uploads/
├── documents/          # PDF, DOC, DOCX (10MB max)
├── images/            # JPG, PNG, GIF (5MB max)
├── videos/            # MP4, WEBM (100MB max)
├── profile-pictures/  # User avatars (5MB max)
├── course-materials/  # Mixed content (50MB max)
└── assignments/       # Student submissions (10MB max)
```

**File Naming**:
```
Original: "My Report.pdf"
Secure: "1704123456789-a3f2c8d9e1b4f5g6.pdf"
Format: {timestamp}-{random-32-char-hex}.{extension}
```

**Access Control**:
- Static file serving: `/uploads/<category>/<filename>`
- Authentication required for upload
- Rate limiting: 10 uploads/hour

---

## 🔄 Request Flow Diagram

### **Full Request Lifecycle**

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       │ HTTP Request
       │ GET /api/courses
       │ Authorization: Bearer <JWT>
       ↓
┌──────────────────────────────────────┐
│         Express Server (5000)        │
├──────────────────────────────────────┤
│                                      │
│  1. helmet() → Security Headers      │
│     ↓                                │
│  2. cors() → CORS Check              │
│     ↓                                │
│  3. compression() → Gzip Response    │
│     ↓                                │
│  4. bodyParser → Parse JSON          │
│     ↓                                │
│  5. logger → Log Request             │
│     ↓                                │
│  6. generalLimiter → Rate Limit      │
│     ↓                                │
│  7. setOrganizationContext           │
│     → Extract org from JWT/header    │
│     ↓                                │
│  8. scopeToOrganization              │
│     → Add org filter to queries      │
│     ↓                                │
│  9. authenticate                     │
│     → Verify JWT                     │
│     → Extract user info              │
│     ↓                                │
│  10. checkRole(['teacher'])          │
│      → Verify user has permission   │
│      ↓                               │
│  11. courseController.getCourses()   │
│      ↓                               │
│  12. Course.find({ org: req.orgId }) │
│      ↓                               │
└──────┴──────────────────────────────┘
       │
       ↓
┌──────────────────┐
│  MongoDB         │
│  Query:          │
│  {               │
│    organization: │
│      "507f..."   │
│  }               │
└──────┬───────────┘
       │
       │ Results
       ↓
┌──────────────────────────────────────┐
│  Response Processing                 │
├──────────────────────────────────────┤
│                                      │
│  1. Format data                      │
│  2. Compress (gzip)                  │
│  3. Add security headers             │
│  4. Log response                     │
│  5. Return JSON                      │
│                                      │
└──────┬───────────────────────────────┘
       │
       │ HTTP Response 200 OK
       │ {
       │   success: true,
       │   data: [...courses]
       │ }
       ↓
┌─────────────┐
│   Client    │
│  Receives   │
│   Data      │
└─────────────┘
```

### **Error Flow**

```
Request → Middleware Chain
                │
                │ Error Occurs
                ↓
         errorHandler.js
                │
                ├─→ Log Error (Winston)
                │
                ├─→ Create Audit Log
                │
                └─→ Return JSON
                     {
                       success: false,
                       message: "Error description",
                       error: "Details"
                     }
```

---

## 🎯 Summary

### **What This Backend Does**

This is a **production-ready, multi-tenant Learning Management System** that provides:

1. **Organization Management**: Multiple organizations (schools, companies) can use the same system with complete data isolation

2. **User Management**: Comprehensive user system with 8 role types, email verification, password reset

3. **Course Management**: Full course creation with sections, activities, resources, and enrollment

4. **Assessment System**: Quizzes, assignments, grading, certificates, badges

5. **Communication**: Forums, messaging, notifications, announcements

6. **Calendar & Tasks**: Event management and task tracking

7. **Security**: Enterprise-grade security with JWT, RBAC, rate limiting, file upload protection

8. **Performance**: Redis caching, compression, optimized queries

9. **Monitoring**: Comprehensive logging, audit trail, error tracking

10. **API Documentation**: Swagger/OpenAPI docs at `/api-docs`

### **How It Works**

1. **Platform Admin** creates organizations
2. **Organization Admin** manages their organization
3. **Teachers** create courses and content
4. **Students** enroll, learn, and complete assessments
5. **All actions** are logged, scoped to organizations, and secured
6. **Data** is completely isolated between organizations
7. **Files** are uploaded securely with validation
8. **APIs** are rate-limited and documented

### **Production Ready**

✅ Security: Helmet, CORS, Rate Limiting, JWT, RBAC  
✅ Performance: Compression, Caching, Optimized Queries  
✅ Logging: Winston with file rotation  
✅ Error Handling: Global error handler  
✅ Documentation: Swagger/OpenAPI  
✅ Database: MongoDB with 45+ models  
✅ File Upload: Secure with malicious code protection  
✅ Multi-tenancy: Organization-based isolation  

**This system is ready for deployment and can handle thousands of users across multiple organizations!** 🚀
