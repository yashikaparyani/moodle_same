# Swagger API Documentation Guide

## 📚 Overview

Your LMS Backend now has comprehensive interactive API documentation powered by Swagger/OpenAPI 3.0. This documentation covers all **48 API endpoints** across all modules.

## 🌐 Accessing the Documentation

### Live Interactive Documentation
**URL:** `http://localhost:5000/api-docs`

Open this URL in your browser to access the interactive Swagger UI where you can:
- Browse all available endpoints
- Test API calls directly from the browser
- View request/response schemas
- Authenticate with JWT tokens

### JSON Specification
**URL:** `http://localhost:5000/api-docs.json`

Download the OpenAPI specification in JSON format for:
- Importing into Postman
- Importing into Insomnia
- API client generation
- Documentation sharing

## 📋 Documented API Modules

### 1. **Authentication** (9 endpoints)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/send-verification` - Send email verification
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)

### 2. **Organizations** (8 endpoints)
- `POST /api/v1/organizations/validate-token` - Validate org token
- `POST /api/v1/organizations/register` - Register organization
- `POST /api/v1/organizations/platform/tokens` - Generate token (Platform Admin)
- `GET /api/v1/organizations/platform/tokens` - List all tokens (Platform Admin)
- `DELETE /api/v1/organizations/platform/tokens/:tokenId` - Revoke token
- `GET /api/v1/organizations/platform/organizations` - List all organizations
- `GET /api/v1/organizations/platform/organizations/:orgId` - Get organization by ID
- `GET /api/v1/organization/profile` - Get my organization profile
- `PUT /api/v1/organization/profile` - Update organization profile

### 3. **Users** (7 endpoints)
- `GET /api/users/stats` - Get user statistics
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `PATCH /api/users/:id/status` - Change user status
- `DELETE /api/users/:id` - Delete user

### 4. **Courses** (7 endpoints)
- `GET /api/courses/stats` - Get course statistics
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/:id/students` - Get enrolled students

### 5. **Categories** (7 endpoints)
- `GET /api/categories` - Get all categories (tree)
- `GET /api/categories/flat` - Get all categories (flat)
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/courses` - Get category courses
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### 6. **Audit** (4 endpoints)
- `GET /api/audit` - Get all audit logs
- `GET /api/audit/stats` - Get audit statistics
- `GET /api/audit/recent` - Get recent activity
- `GET /api/audit/user/:userId` - Get user audit logs

### 7. **Cache** (5 endpoints)
- `GET /api/cache/stats` - Get cache statistics
- `DELETE /api/cache/flush` - Flush all cache
- `DELETE /api/cache/:key` - Delete cache key
- `DELETE /api/cache/pattern/:pattern` - Delete by pattern
- `POST /api/cache/invalidate` - Invalidate cache by type

### 8. **Enrollment** (1 endpoint)
- `POST /api/enroll` - Create enrollment

### 9. **Health** (2 endpoints)
- `GET /` - API root information
- `GET /api/health` - Health check

## 🔐 Authentication in Swagger UI

### Step 1: Login to Get Token
1. Navigate to **Authentication** section in Swagger UI
2. Expand `POST /api/auth/login`
3. Click **"Try it out"**
4. Enter your credentials:
   ```json
   {
     "identifier": "your_username_or_email",
     "password": "your_password"
   }
   ```
5. Click **"Execute"**
6. Copy the `token` from the response

### Step 2: Authorize Swagger UI
1. Click the **"Authorize"** button (🔒 icon) at the top of the page
2. In the **BearerAuth** field, enter: `Bearer YOUR_TOKEN_HERE`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click **"Authorize"**
4. Click **"Close"**

### Step 3: Test Protected Endpoints
Now all authenticated endpoints will automatically include your JWT token in the `Authorization` header.

## 🧪 Testing APIs with Swagger UI

### Basic Workflow
1. **Expand an endpoint** - Click on any API endpoint to expand it
2. **Click "Try it out"** - Enables the form for testing
3. **Fill in parameters** - Enter path parameters, query parameters, or request body
4. **Click "Execute"** - Sends the request to your API
5. **View response** - See the response status, headers, and body

### Example: Create a Course

1. Navigate to **Courses** section
2. Expand `POST /api/courses`
3. Click **"Try it out"**
4. Fill in the request body:
   ```json
   {
     "fullName": "Introduction to Python",
     "shortName": "PY101",
     "description": "Learn Python programming from scratch",
     "category": "507f1f77bcf86cd799439011",
     "visible": true,
     "maxStudents": 30
   }
   ```
5. Click **"Execute"**
6. View the response with the created course

## 📤 Exporting to Postman/Insomnia

### For Postman
1. Open Postman
2. Click **Import**
3. Select **Link** tab
4. Enter: `http://localhost:5000/api-docs.json`
5. Click **Continue** → **Import**

### For Insomnia
1. Open Insomnia
2. Click **Create** → **Import From**
3. Select **URL**
4. Enter: `http://localhost:5000/api-docs.json`
5. Click **Fetch and Import**

## 🎨 Swagger UI Features

### Tags Organization
All endpoints are organized by module tags:
- 🔐 Authentication
- 🏢 Organizations
- 👥 Users
- 📚 Courses
- 📁 Categories
- 📋 Audit
- 💾 Cache
- ✅ Enrollment
- ❤️ Health

### Schema Explorer
Click on any schema (e.g., `User`, `Course`, `Category`) to see:
- All properties
- Data types
- Required fields
- Example values
- Nested structures

### Response Examples
Each endpoint shows:
- Success responses (200, 201)
- Error responses (400, 401, 403, 404, 500)
- Response schemas
- Example payloads

## 🔧 Configuration Files

### Swagger Configuration
**File:** `config/swagger.js`
- OpenAPI 3.0 specification
- Security schemes (JWT Bearer)
- Reusable components and schemas
- Response templates
- Parameter definitions

### Route Documentation
Each route file contains inline JSDoc comments:
- `routes/auth.routes.js`
- `routes/organization.routes.js`
- `routes/user.routes.js`
- `routes/course.routes.js`
- `routes/category.routes.js`
- `routes/audit.routes.js`
- `routes/cache.routes.js`
- `routes/enroll.routes.js`

## 🚀 Quick Start Testing Guide

### 1. Start the Server
```bash
npm start
```

### 2. Open Swagger UI
```
http://localhost:5000/api-docs
```

### 3. Test Public Endpoints (No Auth Required)
- `POST /api/auth/register` - Create an account
- `POST /api/auth/login` - Login to get token
- `GET /api/courses` - Browse courses
- `GET /api/categories` - Browse categories

### 4. Test Protected Endpoints (Auth Required)
1. Login via Swagger UI to get token
2. Click "Authorize" button and enter token
3. Test any protected endpoint:
   - User management
   - Course creation
   - Organization management
   - Audit logs

## 📊 Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Filtering
- `search` - Search query string
- `sort` - Sort field and order (e.g., `createdAt:desc`)
- `status` - Filter by status
- `role` - Filter by role

### Examples
```
GET /api/users?page=2&limit=20&role=student&status=active
GET /api/courses?search=python&sort=createdAt:desc
GET /api/audit?startDate=2024-01-01&endDate=2024-12-31
```

## 🔒 Security Schemes

### Bearer Authentication
- **Type:** HTTP Bearer
- **Scheme:** bearer
- **Format:** JWT
- **Header:** `Authorization: Bearer <token>`

### Organization Context
- **Type:** API Key
- **Header:** `x-organization-id`
- **Usage:** Multi-tenant operations (optional)

## 📝 Response Formats

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
  "message": "Error message",
  "error": "Detailed error description"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🎯 Best Practices

1. **Always authorize first** for protected endpoints
2. **Check response schemas** before making requests
3. **Use example payloads** as templates
4. **Test error scenarios** (invalid data, unauthorized access)
5. **Export to Postman** for automated testing
6. **Review audit logs** after testing admin operations

## 🐛 Troubleshooting

### Token Not Working
- Ensure token is prefixed with `Bearer `
- Check token hasn't expired
- Verify user has required permissions

### Endpoint Not Found
- Check if server is running on port 5000
- Verify route prefix (`/api` vs `/api/v1`)
- Ensure organization context is set if required

### CORS Issues
- CORS is enabled by default
- Check browser console for specific errors
- Verify request headers

## 📚 Additional Resources

- **OpenAPI Specification:** https://swagger.io/specification/
- **Swagger UI Documentation:** https://swagger.io/tools/swagger-ui/
- **JWT.io:** https://jwt.io/ (for token debugging)

## 🎉 Summary

You now have:
- ✅ **48 fully documented endpoints**
- ✅ **Interactive testing interface**
- ✅ **JWT authentication support**
- ✅ **Request/response schemas**
- ✅ **Export to Postman/Insomnia**
- ✅ **Comprehensive examples**
- ✅ **Multi-tenant support**

**Happy API Testing! 🚀**
