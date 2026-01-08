# 🧪 Phase 2 Testing Guide - User Management

## ✅ What We've Added in Phase 2

### New User Management Endpoints:
1. ✅ **GET /api/users** - Get all users (with pagination, search, filters)
2. ✅ **GET /api/users/:id** - Get single user
3. ✅ **POST /api/users** - Create user (Admin/Manager only)
4. ✅ **PUT /api/users/:id** - Update user
5. ✅ **PATCH /api/users/:id/status** - Change user status
6. ✅ **DELETE /api/users/:id** - Delete user (Admin only)
7. ✅ **GET /api/users/stats** - Get user statistics

---

## 🚀 Testing Steps

### Setup: First Create Test Users

#### 1. Create Admin User
```
POST http://localhost:5000/api/auth/register
Body:
{
  "email": "admin@lms.com",
  "password": "Admin123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}

✅ Copy the TOKEN from response
```

#### 2. Create Manager User
```
POST http://localhost:5000/api/auth/register
Body:
{
  "email": "manager@lms.com",
  "password": "Manager123",
  "firstName": "Manager",
  "lastName": "User",
  "role": "manager"
}
```

#### 3. Create Teacher User
```
POST http://localhost:5000/api/auth/register
Body:
{
  "email": "teacher@lms.com",
  "password": "Teacher123",
  "firstName": "John",
  "lastName": "Teacher",
  "role": "teacher"
}
```

#### 4. Create Some Students
```
POST http://localhost:5000/api/auth/register
Body:
{
  "email": "student1@lms.com",
  "password": "Student123",
  "firstName": "Alice",
  "lastName": "Student"
}
```

```
POST http://localhost:5000/api/auth/register
Body:
{
  "email": "student2@lms.com",
  "password": "Student123",
  "firstName": "Bob",
  "lastName": "Student"
}
```

---

## 📮 Now Test User Management APIs

### Test 1: Get All Users (Admin)
```
Method: GET
URL: http://localhost:5000/api/users
Headers: 
  Authorization: Bearer ADMIN_TOKEN_HERE

Expected Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "email": "admin@lms.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "admin",
        "status": "active",
        ...
      },
      ...
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 5,
      "limit": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Test 2: Get All Users with Search
```
Method: GET
URL: http://localhost:5000/api/users?search=Alice
Headers: Authorization: Bearer ADMIN_TOKEN_HERE

Expected: Only Alice should appear in results
```

### Test 3: Filter by Role
```
Method: GET
URL: http://localhost:5000/api/users?role=student
Headers: Authorization: Bearer ADMIN_TOKEN_HERE

Expected: Only students should appear
```

### Test 4: Pagination Test
```
Method: GET
URL: http://localhost:5000/api/users?page=1&limit=2
Headers: Authorization: Bearer ADMIN_TOKEN_HERE

Expected: Only 2 users per page
```

### Test 5: Get User Stats
```
Method: GET
URL: http://localhost:5000/api/users/stats
Headers: Authorization: Bearer ADMIN_TOKEN_HERE

Expected Response:
{
  "success": true,
  "data": {
    "totalUsers": 5,
    "activeUsers": 5,
    "suspendedUsers": 0,
    "inactiveUsers": 0,
    "adminCount": 1,
    "teacherCount": 1,
    "studentCount": 3
  }
}
```

### Test 6: Get Single User by ID
```
Method: GET
URL: http://localhost:5000/api/users/USER_ID_HERE
Headers: Authorization: Bearer ADMIN_TOKEN_HERE

Expected: Single user details
```

### Test 7: Create New User (Admin)
```
Method: POST
URL: http://localhost:5000/api/users
Headers: 
  Authorization: Bearer ADMIN_TOKEN_HERE
  Content-Type: application/json
Body:
{
  "email": "newstudent@lms.com",
  "password": "Password123",
  "firstName": "New",
  "lastName": "Student",
  "role": "student",
  "phone": "+91-9876543210"
}

Expected Response:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": { ... }
  }
}
```

### Test 8: Update User Details
```
Method: PUT
URL: http://localhost:5000/api/users/USER_ID_HERE
Headers: 
  Authorization: Bearer ADMIN_TOKEN_HERE
  Content-Type: application/json
Body:
{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+91-1234567890"
}

Expected: User updated successfully
```

### Test 9: Change User Status
```
Method: PATCH
URL: http://localhost:5000/api/users/USER_ID_HERE/status
Headers: 
  Authorization: Bearer ADMIN_TOKEN_HERE
  Content-Type: application/json
Body:
{
  "status": "suspended"
}

Expected Response:
{
  "success": true,
  "message": "User status changed to suspended"
}
```

### Test 10: Try Suspended User Login
```
Method: POST
URL: http://localhost:5000/api/auth/login
Body:
{
  "email": "SUSPENDED_USER_EMAIL",
  "password": "PASSWORD"
}

Expected Response:
{
  "success": false,
  "message": "Account is suspended. Please contact administrator."
}
```

### Test 11: Delete User (Admin Only)
```
Method: DELETE
URL: http://localhost:5000/api/users/USER_ID_HERE
Headers: Authorization: Bearer ADMIN_TOKEN_HERE

Expected:
{
  "success": true,
  "message": "User deleted successfully"
}

Note: This is soft delete - status changes to "inactive"
```

---

## 🔒 Permission Tests

### Test 12: Student Trying to Access User List (Should Fail)
```
Method: GET
URL: http://localhost:5000/api/users
Headers: Authorization: Bearer STUDENT_TOKEN_HERE

Expected Response:
{
  "success": false,
  "message": "Access denied. You do not have permission to perform this action.",
  "requiredRoles": ["admin", "manager"],
  "yourRole": "student"
}
```

### Test 13: Student Accessing Own Profile (Should Work)
```
Method: GET
URL: http://localhost:5000/api/users/STUDENT_OWN_ID
Headers: Authorization: Bearer STUDENT_TOKEN_HERE

Expected: Own profile details (SUCCESS)
```

### Test 14: Student Updating Own Profile (Should Work)
```
Method: PUT
URL: http://localhost:5000/api/users/STUDENT_OWN_ID
Headers: Authorization: Bearer STUDENT_TOKEN_HERE
Body:
{
  "firstName": "UpdatedFirstName",
  "bio": "This is my bio"
}

Expected: Profile updated successfully
```

### Test 15: Student Trying to Change Own Role (Should Fail)
```
Method: PUT
URL: http://localhost:5000/api/users/STUDENT_OWN_ID
Headers: Authorization: Bearer STUDENT_TOKEN_HERE
Body:
{
  "role": "admin"
}

Expected: Role field will be ignored (only admin can change roles)
```

### Test 16: Manager Trying to Modify Admin (Should Fail)
```
Method: PUT
URL: http://localhost:5000/api/users/ADMIN_USER_ID
Headers: Authorization: Bearer MANAGER_TOKEN_HERE
Body:
{
  "firstName": "Changed"
}

Expected Response:
{
  "success": false,
  "message": "Managers cannot modify admin users"
}
```

### Test 17: Teacher Accessing User List (Should Fail)
```
Method: GET
URL: http://localhost:5000/api/users
Headers: Authorization: Bearer TEACHER_TOKEN_HERE

Expected: Access denied (only Admin/Manager can access)
```

---

## 🎯 Testing Checklist

Test karne ke baad check karo:

**Basic CRUD:**
- [ ] Get all users working (Admin)
- [ ] Get single user working
- [ ] Create user working (Admin)
- [ ] Update user working
- [ ] Delete user working (Admin)
- [ ] Get stats working

**Search & Filter:**
- [ ] Search by name/email working
- [ ] Filter by role working
- [ ] Filter by status working
- [ ] Pagination working

**Permissions:**
- [ ] Admin can access all endpoints
- [ ] Manager can access user management (except delete)
- [ ] Students can only access own profile
- [ ] Manager cannot modify admin users
- [ ] Only admin can delete users
- [ ] Suspended users cannot login

**Edge Cases:**
- [ ] Cannot delete own account
- [ ] Cannot change own status
- [ ] Duplicate email validation working
- [ ] Password not returned in responses

---

## 🐛 Common Issues

### Issue: "Access denied"
**Solution:** Check if you're using correct token with proper role

### Issue: "User not found"
**Solution:** Make sure USER_ID is correct MongoDB ObjectId

### Issue: Cannot update user
**Solution:** Check if you have permission (admin/manager or own profile)

---

## 📊 Success Metrics

✅ Passed Tests: ____/17
❌ Failed Tests: ____/17

**Kya sab kaam kar raha hai?**
- [ ] All CRUD operations working
- [ ] Permissions properly enforced
- [ ] Search and filters working
- [ ] Pagination working
- [ ] Stats endpoint working

---

## 🎉 Next Phase

Sab tests pass hone ke baad:
- **Phase 3:** Audit Logging System
- **Phase 4:** Advanced Security (Email verification, Password reset)
- **Phase 5:** Redis Caching
- **Phase 6:** Docker Setup

**Test complete hone ke baad mujhe batao! 🚀**
