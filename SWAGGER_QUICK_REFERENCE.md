# 🚀 Swagger Quick Reference Card

## Access Points
| Resource | URL |
|----------|-----|
| **Swagger UI** | http://localhost:5000/api-docs |
| **JSON Spec** | http://localhost:5000/api-docs.json |
| **API Root** | http://localhost:5000 |
| **Health Check** | http://localhost:5000/api/health |

## Authentication Flow
```bash
# 1. Login
POST /api/auth/login
{
  "identifier": "username_or_email",
  "password": "your_password"
}

# 2. Copy token from response
# 3. Click "Authorize" in Swagger UI
# 4. Enter: Bearer YOUR_TOKEN_HERE
```

## API Endpoints Summary

### 🔐 Authentication (9)
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |
| POST | `/api/auth/logout` | Private |
| POST | `/api/auth/send-verification` | Public |
| GET | `/api/auth/verify-email/:token` | Public |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| POST | `/api/auth/change-password` | Private |

### 🏢 Organizations (8)
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/v1/organizations/validate-token` | Public |
| POST | `/api/v1/organizations/register` | Public |
| POST | `/api/v1/organizations/platform/tokens` | Platform Admin |
| GET | `/api/v1/organizations/platform/tokens` | Platform Admin |
| DELETE | `/api/v1/organizations/platform/tokens/:tokenId` | Platform Admin |
| GET | `/api/v1/organizations/platform/organizations` | Platform Admin |
| GET | `/api/v1/organizations/platform/organizations/:orgId` | Platform Admin |
| GET | `/api/v1/organization/profile` | Authenticated |
| PUT | `/api/v1/organization/profile` | Org Admin |

### 👥 Users (7)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users/stats` | Admin/Manager |
| GET | `/api/users` | Admin/Manager |
| GET | `/api/users/:id` | Admin/Manager/Self |
| POST | `/api/users` | Admin/Manager |
| PUT | `/api/users/:id` | Admin/Manager/Self |
| PATCH | `/api/users/:id/status` | Admin/Manager |
| DELETE | `/api/users/:id` | Admin |

### 📚 Courses (7)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/courses/stats` | Admin/Manager |
| GET | `/api/courses` | Public |
| GET | `/api/courses/:id` | Public |
| POST | `/api/courses` | Admin/Manager/Creator |
| PUT | `/api/courses/:id` | Admin/Manager/Creator |
| DELETE | `/api/courses/:id` | Admin/Manager |
| GET | `/api/courses/:id/students` | Admin/Manager/Teacher |

### 📁 Categories (7)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/categories` | Public |
| GET | `/api/categories/flat` | Public |
| GET | `/api/categories/:id` | Public |
| GET | `/api/categories/:id/courses` | Public |
| POST | `/api/categories` | Admin/Manager |
| PUT | `/api/categories/:id` | Admin/Manager |
| DELETE | `/api/categories/:id` | Admin/Manager |

### 📋 Audit (4)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/audit` | Admin |
| GET | `/api/audit/stats` | Admin |
| GET | `/api/audit/recent` | Admin |
| GET | `/api/audit/user/:userId` | Admin/Self |

### 💾 Cache (5)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/cache/stats` | Admin |
| DELETE | `/api/cache/flush` | Admin |
| DELETE | `/api/cache/:key` | Admin |
| DELETE | `/api/cache/pattern/:pattern` | Admin |
| POST | `/api/cache/invalidate` | Admin/Manager |

### ✅ Enrollment (1)
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/enroll` | Authenticated |

### ❤️ Health (2)
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/` | Public |
| GET | `/api/health` | Public |

## Common Query Parameters
```
?page=1              # Page number
?limit=10            # Items per page
?search=query        # Search term
?sort=field:order    # Sort (e.g., createdAt:desc)
?status=active       # Filter by status
?role=student        # Filter by role
```

## Response Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Example Requests

### Create User
```json
POST /api/users
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

### Create Course
```json
POST /api/courses
{
  "fullName": "Web Development 101",
  "shortName": "WEB101",
  "description": "Introduction to web development",
  "category": "507f1f77bcf86cd799439011",
  "visible": true,
  "maxStudents": 30
}
```

### Create Category
```json
POST /api/categories
{
  "name": "Programming",
  "description": "Programming courses",
  "parent": null,
  "visible": true,
  "sortOrder": 1
}
```

## Export to Postman
1. In Postman: **Import** → **Link**
2. Enter: `http://localhost:5000/api-docs.json`
3. Click **Import**

## Testing Checklist
- [ ] Server is running (`npm start`)
- [ ] Swagger UI accessible at `/api-docs`
- [ ] Can register new user
- [ ] Can login and get token
- [ ] Token authorization works in Swagger UI
- [ ] Can create/read/update/delete resources
- [ ] Pagination works correctly
- [ ] Error responses are clear
- [ ] Can export to Postman

## Tips
💡 Use the "Try it out" button for each endpoint
💡 Click "Authorize" once to authenticate all requests
💡 Check the "Schemas" section for data models
💡 Use example payloads as templates
💡 Test error cases (invalid data, missing auth)
💡 Review audit logs after admin operations

**Total Endpoints: 48**
**Documentation: 100% Complete ✅**
