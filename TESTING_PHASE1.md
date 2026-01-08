# 🧪 Testing Guide - Phase 1 Complete!

## ✅ What We've Implemented

### 1. **Enhanced User Model**
- Security fields (failedLoginAttempts, lockedUntil)
- Email verification fields
- RBAC-compatible roles (6 roles)
- Profile fields
- Instance methods (isLocked, incrementFailedAttempts, etc.)

### 2. **Middleware**
- ✅ Authentication (JWT verification)
- ✅ Role-based Authorization
- ✅ Error Handler
- ✅ Request Logger

### 3. **Auth System**
- ✅ Register endpoint
- ✅ Login endpoint (with account lockout)
- ✅ Get current user endpoint
- ✅ Logout endpoint

### 4. **Server Configuration**
- ✅ Compression
- ✅ Helmet (security)
- ✅ CORS
- ✅ Enhanced logging
- ✅ Error handling

---

## 🚀 How to Test

### Step 1: Start the Server
```bash
cd d:\new_lms\backend
npm run dev
```

**Expected Output:**
```
=================================
🚀 LMS Server running on port 5000
📍 http://localhost:5000
🔐 Environment: development
=================================
```

---

## 📮 Postman Testing

### Test 1: Health Check
```
Method: GET
URL: http://localhost:5000/api/health

Expected Response:
{
  "success": true,
  "message": "Server is healthy",
  "uptime": 12.345,
  "timestamp": "2026-01-08T..."
}
```

### Test 2: Register New User (Student)
```
Method: POST
URL: http://localhost:5000/api/auth/register
Headers: Content-Type: application/json

Body (JSON):
{
  "email": "student@test.com",
  "password": "Student123",
  "firstName": "Test",
  "lastName": "Student"
}

Expected Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "email": "student@test.com",
      "firstName": "Test",
      "lastName": "Student",
      "role": "student",
      "status": "active",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test 3: Register Admin User
```
Method: POST
URL: http://localhost:5000/api/auth/register

Body (JSON):
{
  "email": "admin@test.com",
  "password": "Admin123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}

Expected Response: Success with admin role
```

### Test 4: Register Teacher
```
Method: POST
URL: http://localhost:5000/api/auth/register

Body (JSON):
{
  "email": "teacher@test.com",
  "password": "Teacher123",
  "firstName": "John",
  "lastName": "Teacher",
  "role": "teacher",
  "phone": "+91-9876543210"
}
```

### Test 5: Login with Valid Credentials
```
Method: POST
URL: http://localhost:5000/api/auth/login

Body (JSON):
{
  "email": "student@test.com",
  "password": "Student123"
}

Expected Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "..."
  }
}

✅ COPY THE TOKEN - You'll need it for next tests!
```

### Test 6: Get Current User (Protected Route)
```
Method: GET
URL: http://localhost:5000/api/auth/me
Headers: 
  Authorization: Bearer YOUR_TOKEN_HERE

Expected Response:
{
  "success": true,
  "data": {
    "user": {
      "email": "student@test.com",
      "firstName": "Test",
      "lastName": "Student",
      "role": "student"
    }
  }
}
```

### Test 7: Test Account Lockout
```
Try to login 5 times with WRONG password:

Method: POST
URL: http://localhost:5000/api/auth/login

Body (JSON):
{
  "email": "student@test.com",
  "password": "WrongPassword"
}

After 5 attempts:
Expected Response:
{
  "success": false,
  "message": "Account is locked due to too many failed login attempts..."
}
```

### Test 8: Test Without Token (Should Fail)
```
Method: GET
URL: http://localhost:5000/api/auth/me
Headers: (NO Authorization header)

Expected Response:
{
  "success": false,
  "message": "No token provided. Please login first."
}
```

### Test 9: Test Duplicate Registration
```
Method: POST
URL: http://localhost:5000/api/auth/register

Body (Use same email again):
{
  "email": "student@test.com",
  "password": "Test123",
  "firstName": "Another",
  "lastName": "User"
}

Expected Response:
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

## 🎯 Success Checklist

Test karke check karo:

- [ ] Server properly start ho raha hai
- [ ] Health check endpoint kaam kar rahi hai
- [ ] Student role se register ho sakta hai
- [ ] Admin role se register ho sakta hai
- [ ] Teacher role se register ho sakta hai
- [ ] Login karne par JWT token milta hai
- [ ] Token ke saath /api/auth/me endpoint kaam karti hai
- [ ] Bina token ke protected route access nahi hoti
- [ ] 5 wrong passwords ke baad account lock hota hai
- [ ] Duplicate email se register nahi ho sakta
- [ ] Console mein proper logs dikh rahe hain (✅ aur ❌ symbols)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot GET /"
**Solution:** Server start karo: `npm run dev`

### Issue 2: "JWT_SECRET not defined"
**Solution:** Check `.env` file mein `JWT_SECRET` hai ya nahi

### Issue 3: "Cannot connect to MongoDB"
**Solution:** 
- MongoDB running hai? Check with: `mongosh`
- `.env` mein correct MONGO_URI hai?

### Issue 4: "Validation Error"
**Solution:** Required fields (email, password, firstName, lastName) send kiye?

### Issue 5: "Invalid token"
**Solution:** 
- Token copy kiya properly?
- Format: `Authorization: Bearer YOUR_TOKEN` (Bearer ke baad space hai!)

---

## 📊 Testing Results

**Test Karne Ke Baad Yahan Note Karo:**

✅ Passed Tests: ____/9
❌ Failed Tests: ____/9

**Issues Found:**
1. 
2. 
3. 

---

## 🎉 Next Steps (After Testing)

Once sab tests pass ho jaye:
1. User Management Controllers (getAllUsers, updateUser, etc.)
2. RBAC System (Role Assignment)
3. Audit Logging
4. Advanced Security (Email verification, Password reset)
5. Redis Caching
6. Docker Setup

---

**Jab tests complete ho jaye, mujhe batao! Then we'll move to Phase 2! 🚀**
