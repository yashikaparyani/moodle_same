# 🧪 Phase 3 Testing Guide - Audit Logging System

## ✅ What We've Added in Phase 3

### Audit Logging System Features:
1. ✅ **AuditLog Model** - Stores all actions with details
2. ✅ **Audit Service** - Centralized logging service
3. ✅ **Automatic Logging** - Integrated in Auth & User controllers
4. ✅ **Audit APIs** - View and analyze logs

### Tracked Events:
- User registration, login, logout
- Failed login attempts & account lockouts
- User CRUD operations
- Status changes
- Role changes
- IP address & User-Agent tracking

### New Endpoints:
1. ✅ **GET /api/audit** - Get all audit logs
2. ✅ **GET /api/audit/stats** - Audit statistics
3. ✅ **GET /api/audit/recent** - Recent activity
4. ✅ **GET /api/audit/user/:userId** - User's audit history

---

## 🚀 Testing Steps

### First: Generate Some Activity to Log

#### 1. Register New Users (Creates audit logs)
```
POST http://localhost:5000/api/auth/register
Body: {
  "email": "test1@lms.com",
  "password": "Test123",
  "firstName": "Test",
  "lastName": "User1"
}

Expected: USER_CREATED audit log created
```

#### 2. Login (Creates LOGIN_SUCCESS log)
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@lms.com",
  "password": "Admin123"
}

✅ Copy ADMIN_TOKEN
Expected: LOGIN_SUCCESS audit log created
```

#### 3. Failed Login Attempt (Creates LOGIN_FAILED log)
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@lms.com",
  "password": "WrongPassword"
}

Expected: LOGIN_FAILED audit log created
```

#### 4. Create User via Admin (Creates USER_CREATED log)
```
POST http://localhost:5000/api/users
Headers: Authorization: Bearer ADMIN_TOKEN
Body: {
  "email": "created@lms.com",
  "password": "Password123",
  "firstName": "Created",
  "lastName": "User",
  "role": "teacher"
}

Expected: USER_CREATED audit log with createdBy info
```

#### 5. Update User (Creates USER_UPDATED log)
```
PUT http://localhost:5000/api/users/USER_ID
Headers: Authorization: Bearer ADMIN_TOKEN
Body: {
  "firstName": "Updated",
  "phone": "+91-9876543210"
}

Expected: USER_UPDATED audit log
```

#### 6. Change User Status (Creates USER_STATUS_CHANGED log)
```
PATCH http://localhost:5000/api/users/USER_ID/status
Headers: Authorization: Bearer ADMIN_TOKEN
Body: {
  "status": "suspended"
}

Expected: USER_STATUS_CHANGED audit log
```

---

## 📮 Now Test Audit Log APIs

### Test 1: Get All Audit Logs
```
Method: GET
URL: http://localhost:5000/api/audit
Headers: Authorization: Bearer ADMIN_TOKEN

Expected Response:
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "...",
        "action": "LOGIN_SUCCESS",
        "actorUserId": {
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@lms.com",
          "role": "admin"
        },
        "entityType": "USER",
        "ip": "::1",
        "userAgent": "PostmanRuntime/7.x.x",
        "status": "SUCCESS",
        "createdAt": "2026-01-08T...",
        "metadata": { ... }
      },
      ...
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 15,
      "limit": 50
    }
  }
}
```

### Test 2: Filter by Action Type
```
Method: GET
URL: http://localhost:5000/api/audit?action=LOGIN_SUCCESS
Headers: Authorization: Bearer ADMIN_TOKEN

Expected: Only LOGIN_SUCCESS logs
```

### Test 3: Filter by Failed Actions
```
Method: GET
URL: http://localhost:5000/api/audit?status=FAILED
Headers: Authorization: Bearer ADMIN_TOKEN

Expected: Only failed login attempts and errors
```

### Test 4: Filter by Entity Type
```
Method: GET
URL: http://localhost:5000/api/audit?entityType=USER
Headers: Authorization: Bearer ADMIN_TOKEN

Expected: Only user-related actions
```

### Test 5: Get Audit Statistics
```
Method: GET
URL: http://localhost:5000/api/audit/stats
Headers: Authorization: Bearer ADMIN_TOKEN

Expected Response:
{
  "success": true,
  "data": {
    "totalLogs": 20,
    "actionStats": [
      { "_id": "LOGIN_SUCCESS", "count": 5 },
      { "_id": "USER_CREATED", "count": 4 },
      { "_id": "LOGIN_FAILED", "count": 3 },
      ...
    ],
    "statusStats": [
      { "_id": "SUCCESS", "count": 17 },
      { "_id": "FAILED", "count": 3 }
    ],
    "recentFailed": [ ... ]
  }
}
```

### Test 6: Get Recent Activity
```
Method: GET
URL: http://localhost:5000/api/audit/recent?limit=10
Headers: Authorization: Bearer ADMIN_TOKEN

Expected: Last 10 audit logs (most recent first)
```

### Test 7: Get Specific User's Audit History
```
Method: GET
URL: http://localhost:5000/api/audit/user/USER_ID
Headers: Authorization: Bearer ADMIN_TOKEN

Expected: All logs where that user was the actor
```

### Test 8: User Accessing Own Audit Logs
```
Method: GET
URL: http://localhost:5000/api/audit/user/STUDENT_OWN_ID
Headers: Authorization: Bearer STUDENT_TOKEN

Expected: SUCCESS - Students can see their own logs
```

### Test 9: Student Trying to Access All Logs (Should Fail)
```
Method: GET
URL: http://localhost:5000/api/audit
Headers: Authorization: Bearer STUDENT_TOKEN

Expected Response:
{
  "success": false,
  "message": "Access denied. You do not have permission..."
}
```

---

## 🔍 What to Look For in Audit Logs

### Check These Fields:
- ✅ **action** - Type of event (LOGIN_SUCCESS, USER_CREATED, etc.)
- ✅ **actorUserId** - Who performed the action (populated with user details)
- ✅ **actorEmail** - Email of person who did it
- ✅ **actorRole** - Role of person (admin, student, etc.)
- ✅ **entityType** - What was affected (USER, COURSE, etc.)
- ✅ **entityId** - ID of affected entity
- ✅ **ip** - IP address of request
- ✅ **userAgent** - Browser/client info
- ✅ **metadata** - Additional context (changes made, reason, etc.)
- ✅ **status** - SUCCESS, FAILED, or WARNING
- ✅ **createdAt** - Timestamp

### Example Audit Log Entry:
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "action": "USER_STATUS_CHANGED",
  "actorUserId": {
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@lms.com",
    "role": "admin"
  },
  "actorEmail": "admin@lms.com",
  "actorRole": "admin",
  "entityType": "USER",
  "entityId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "entityName": "Test Student",
  "ip": "::1",
  "userAgent": "PostmanRuntime/7.36.0",
  "metadata": {
    "email": "student@lms.com",
    "oldStatus": "active",
    "newStatus": "suspended"
  },
  "status": "SUCCESS",
  "createdAt": "2026-01-08T10:30:00.000Z"
}
```

---

## 🎯 Testing Checklist

Yeh sab test karo:

**Audit Log Generation:**
- [ ] Registration creates USER_CREATED log
- [ ] Login creates LOGIN_SUCCESS log
- [ ] Failed login creates LOGIN_FAILED log
- [ ] 5 failed logins create ACCOUNT_LOCKED log
- [ ] User creation by admin has createdBy info
- [ ] User update creates USER_UPDATED log
- [ ] Status change creates USER_STATUS_CHANGED log
- [ ] User deletion creates USER_DELETED log
- [ ] Logout creates LOGOUT log

**Audit Log Viewing:**
- [ ] Admin can view all audit logs
- [ ] Filter by action working
- [ ] Filter by status working
- [ ] Filter by entityType working
- [ ] Pagination working
- [ ] Stats endpoint showing correct counts
- [ ] Recent activity showing latest logs
- [ ] User can view own audit logs
- [ ] Student cannot view all logs (Access denied)

**Audit Log Details:**
- [ ] IP address captured correctly
- [ ] User-Agent captured
- [ ] Metadata has relevant info (changes, reasons)
- [ ] Timestamps are correct
- [ ] Actor info populated with user details

---

## 🐛 Common Issues

### Issue: Audit logs not being created
**Solution:** Check if AuditService is imported in controllers

### Issue: actorUserId is null
**Solution:** Make sure authMiddleware runs before the controller

### Issue: Cannot view audit logs
**Solution:** Only Admin can view all logs. Use Admin token.

---

## 📊 Success Metrics

✅ Passed Tests: ____/18
❌ Failed Tests: ____/18

**Kya sab properly log ho raha hai?**
- [ ] All actions being logged
- [ ] Complete information captured (IP, user-agent, metadata)
- [ ] Admin can view and filter logs
- [ ] Statistics working correctly
- [ ] Users can view own logs
- [ ] Security events (failed logins, lockouts) tracked

---

## 🎉 What's Next?

After Phase 3 tests pass:
- **Phase 4:** Advanced Security (Email verification, Password reset, OTP)
- **Phase 5:** Redis Caching
- **Phase 6:** Docker Setup

---

## 💡 Pro Tips

1. **Check MongoDB Compass** - Open `auditlogs` collection to see raw data
2. **Filter by Date** - Use startDate & endDate query params
3. **Track Suspicious Activity** - Watch for multiple failed logins
4. **Compliance** - Audit logs are important for security compliance
5. **Performance** - Logs automatically indexed for fast queries

---

**Test complete karne ke baad mujhe batao! 🚀**

Koi doubt ho ya kuch working nahi kar raha, turant bolna!
