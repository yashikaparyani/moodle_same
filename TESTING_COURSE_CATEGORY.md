# 🧪 Course & Category Testing Guide

## ✅ **Implementation Complete!**

**New APIs Ready:**
- ✅ Course Management (7 endpoints)
- ✅ Category Management (8 endpoints)
- ✅ **WITH Redis Caching Built-in!**

---

## 🚀 **Quick Start Testing**

### **Prerequisites:**
1. Server running: `npm run dev`
2. Redis running: `docker start redis-lms`
3. Admin user created (see TESTING_PHASE2.md)

---

## 📁 **CATEGORY TESTING**

### **Test 1: Create Category (Admin)**

```http
POST http://localhost:5000/api/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Programming",
  "description": "Programming and software development courses"
}

✅ Expected: Category created successfully
```

### **Test 2: Create Subcategory**

```http
POST http://localhost:5000/api/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Web Development",
  "description": "HTML, CSS, JavaScript, React, Node.js",
  "parentId": "PARENT_CATEGORY_ID_FROM_TEST1"
}

✅ Expected: Subcategory created under Programming
```

### **Test 3: Create More Categories**

```http
POST http://localhost:5000/api/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Data Science",
  "description": "Data analysis, ML, AI courses"
}
```

```http
POST http://localhost:5000/api/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Business",
  "description": "Business and management courses"
}
```

### **Test 4: Get All Categories (Tree Structure)**

```http
GET http://localhost:5000/api/categories

✅ Expected Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Programming",
      "description": "...",
      "parentId": null,
      "children": [
        {
          "_id": "...",
          "name": "Web Development",
          "parentId": "...",
          "children": []
        }
      ]
    },
    {
      "_id": "...",
      "name": "Data Science",
      "parentId": null,
      "children": []
    }
  ],
  "count": 3
}

📌 Note: Categories with subcategories will have children array
```

### **Test 5: Get Flat List**

```http
GET http://localhost:5000/api/categories/flat

✅ Expected: All categories in flat array (no nesting)
```

### **Test 6: Get Single Category**

```http
GET http://localhost:5000/api/categories/CATEGORY_ID

✅ Expected Response:
{
  "success": true,
  "data": {
    "category": { ... },
    "courses": [],
    "courseCount": 0,
    "subcategories": [],
    "subcategoryCount": 0
  }
}
```

### **Test 7: Update Category**

```http
PUT http://localhost:5000/api/categories/CATEGORY_ID
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Programming & Development",
  "description": "Updated description"
}

✅ Expected: Category updated
```

### **Test 8: Try Delete Category (Should Fail - Has Subcategories)**

```http
DELETE http://localhost:5000/api/categories/PARENT_CATEGORY_ID
Authorization: Bearer <admin-token>

❌ Expected Error:
{
  "success": false,
  "message": "Cannot delete category. It has X subcategory(ies)."
}
```

---

## 📚 **COURSE TESTING**

### **Test 9: Get Course Stats (Empty)**

```http
GET http://localhost:5000/api/courses/stats
Authorization: Bearer <admin-token>

✅ Expected:
{
  "success": true,
  "data": {
    "totalCourses": 0,
    "activeCourses": 0,
    "hiddenCourses": 0,
    "inactiveCourses": 0,
    "categoriesUsed": 0
  }
}
```

### **Test 10: Create First Course**

```http
POST http://localhost:5000/api/courses
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "fullName": "JavaScript Fundamentals",
  "shortName": "JS101",
  "courseCode": "CS-JS-101",
  "categoryId": "WEB_DEV_CATEGORY_ID",
  "summary": "Learn JavaScript from scratch. Covers variables, functions, objects, arrays, and ES6+ features.",
  "startDate": "2024-02-01",
  "endDate": "2024-05-31",
  "visibility": "show",
  "tags": ["javascript", "programming", "beginner"],
  "showGradebook": true,
  "completionTracking": true
}

✅ Expected: Course created successfully
📌 Save the course ID for next tests
```

### **Test 11: Create More Courses**

```http
POST http://localhost:5000/api/courses
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "fullName": "React for Beginners",
  "shortName": "REACT101",
  "courseCode": "CS-REACT-101",
  "categoryId": "WEB_DEV_CATEGORY_ID",
  "summary": "Learn React library - components, hooks, state management",
  "visibility": "show",
  "tags": ["react", "javascript", "frontend"]
}
```

```http
POST http://localhost:5000/api/courses
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "fullName": "Python for Data Science",
  "shortName": "PY-DS",
  "courseCode": "DS-PY-101",
  "categoryId": "DATA_SCIENCE_CATEGORY_ID",
  "summary": "Python basics for data analysis - NumPy, Pandas, Matplotlib",
  "visibility": "show",
  "tags": ["python", "data-science", "beginner"]
}
```

```http
POST http://localhost:5000/api/courses
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "fullName": "Hidden Test Course",
  "shortName": "HIDDEN101",
  "summary": "This course is hidden",
  "visibility": "hide"
}
```

### **Test 12: Get All Courses (Public)**

```http
GET http://localhost:5000/api/courses

✅ Expected: Only visible courses (not hidden one)
📌 Response includes pagination
```

### **Test 13: Get All Courses (Admin)**

```http
GET http://localhost:5000/api/courses
Authorization: Bearer <admin-token>

✅ Expected: All courses including hidden
```

### **Test 14: Search Courses**

```http
GET http://localhost:5000/api/courses?search=javascript

✅ Expected: JS101 and REACT101 (both contain javascript)
```

### **Test 15: Filter by Category**

```http
GET http://localhost:5000/api/courses?categoryId=WEB_DEV_CATEGORY_ID

✅ Expected: Only web development courses
```

### **Test 16: Filter by Visibility**

```http
GET http://localhost:5000/api/courses?visibility=hide
Authorization: Bearer <admin-token>

✅ Expected: Only hidden courses
```

### **Test 17: Pagination Test**

```http
GET http://localhost:5000/api/courses?page=1&limit=2

✅ Expected: Only 2 courses, with pagination info
```

### **Test 18: Get Single Course**

```http
GET http://localhost:5000/api/courses/COURSE_ID

✅ Expected Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "fullName": "JavaScript Fundamentals",
    "shortName": "JS101",
    "courseCode": "CS-JS-101",
    "categoryId": {
      "_id": "...",
      "name": "Web Development",
      "description": "..."
    },
    "summary": "...",
    "visibility": "show",
    "tags": ["javascript", "programming", "beginner"],
    "createdBy": {
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@lms.com"
    },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### **Test 19: Update Course**

```http
PUT http://localhost:5000/api/courses/COURSE_ID
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "summary": "Updated: Comprehensive JavaScript course with practical projects",
  "tags": ["javascript", "programming", "beginner", "es6"],
  "showActivityReports": true
}

✅ Expected: Course updated successfully
```

### **Test 20: Get Course Stats (After Creating Courses)**

```http
GET http://localhost:5000/api/courses/stats
Authorization: Bearer <admin-token>

✅ Expected:
{
  "success": true,
  "data": {
    "totalCourses": 4,
    "activeCourses": 3,
    "hiddenCourses": 1,
    "inactiveCourses": 0,
    "categoriesUsed": 2
  }
}
```

### **Test 21: Get Category with Courses**

```http
GET http://localhost:5000/api/categories/WEB_DEV_CATEGORY_ID

✅ Expected:
{
  "success": true,
  "data": {
    "category": { "name": "Web Development", ... },
    "courses": [
      { "fullName": "JavaScript Fundamentals", ... },
      { "fullName": "React for Beginners", ... }
    ],
    "courseCount": 2,
    "subcategories": [],
    "subcategoryCount": 0
  }
}
```

### **Test 22: Get Category Courses with Pagination**

```http
GET http://localhost:5000/api/categories/WEB_DEV_CATEGORY_ID/courses?page=1&limit=5

✅ Expected: Courses in that category with pagination
```

### **Test 23: Try Duplicate Course Short Name (Should Fail)**

```http
POST http://localhost:5000/api/courses
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "fullName": "Another Course",
  "shortName": "JS101"
}

❌ Expected Error:
{
  "success": false,
  "message": "Course with this short name already exists"
}
```

### **Test 24: Student Trying to Create Course (Should Fail)**

```http
POST http://localhost:5000/api/courses
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "fullName": "Student Course",
  "shortName": "STU101"
}

❌ Expected Error:
{
  "success": false,
  "message": "Access denied. You do not have permission to perform this action.",
  "requiredRoles": ["admin", "manager", "course_creator"],
  "yourRole": "student"
}
```

### **Test 25: Delete Empty Course**

```http
DELETE http://localhost:5000/api/courses/HIDDEN_COURSE_ID
Authorization: Bearer <admin-token>

✅ Expected: Course deleted (no enrollments)
```

### **Test 26: Get Course Students (Empty)**

```http
GET http://localhost:5000/api/courses/COURSE_ID/students
Authorization: Bearer <admin-token>

✅ Expected:
{
  "success": true,
  "data": [],
  "count": 0
}
```

---

## 🗄️ **CACHE TESTING**

### **Test 27: Check Cache Stats**

```http
GET http://localhost:5000/api/cache/stats
Authorization: Bearer <admin-token>

✅ Expected: Redis connected, dbSize > 0 (courses and categories cached)
```

### **Test 28: Test Cache Hit**

**First Request:**
```http
GET http://localhost:5000/api/courses
```
📌 Response time: ~50-100ms, `"cached": false`

**Second Request (within 5 minutes):**
```http
GET http://localhost:5000/api/courses
```
📌 Response time: ~5-15ms, `"cached": true` ⚡ **10x faster!**

### **Test 29: Test Cache Invalidation**

**Step 1: Get all courses (cache it)**
```http
GET http://localhost:5000/api/courses
```

**Step 2: Create new course**
```http
POST http://localhost:5000/api/courses
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "fullName": "New Test Course",
  "shortName": "NEW101"
}
```

**Step 3: Get all courses again**
```http
GET http://localhost:5000/api/courses
```
✅ Expected: New course appears (cache was invalidated automatically!)

---

## 📊 **Testing Checklist**

### **Categories:**
- [ ] Create root category
- [ ] Create subcategory
- [ ] Get all categories (tree structure)
- [ ] Get flat list
- [ ] Get single category with details
- [ ] Update category
- [ ] Cannot delete category with subcategories
- [ ] Cannot delete category with courses
- [ ] Delete empty category

### **Courses:**
- [ ] Create course with all fields
- [ ] Create course in category
- [ ] Get all courses (public - only visible)
- [ ] Get all courses (admin - including hidden)
- [ ] Search courses
- [ ] Filter by category
- [ ] Filter by visibility
- [ ] Pagination works
- [ ] Get single course details
- [ ] Update course
- [ ] Cannot duplicate short name
- [ ] Get course stats
- [ ] Get course students
- [ ] Delete course

### **Permissions:**
- [ ] Admin can create/edit/delete courses
- [ ] Manager can create/edit/delete courses
- [ ] Course creator can create/edit own courses
- [ ] Student cannot create courses
- [ ] Teacher cannot create courses
- [ ] Public can view visible courses

### **Cache:**
- [ ] First request fetches from DB
- [ ] Second request fetches from cache (faster)
- [ ] Cache invalidates on create/update/delete
- [ ] Cache stats show connections

---

## 🎉 **Success Metrics**

**Passed Tests:** ____/29

**All Working?**
- [ ] All category CRUD operations
- [ ] All course CRUD operations
- [ ] Search and filters
- [ ] Pagination
- [ ] Permissions enforced
- [ ] Cache working (10x faster!)
- [ ] Stats endpoints working

---

## 💡 **What's Next?**

Now that Course & Category are complete:

1. **Enrollment Management** - Let students enroll in courses
2. **Section Management** - Add sections/modules to courses
3. **Activity Management** - Add content to sections
4. **Assessment System** - Quizzes, assignments
5. **Grading System** - Grade student work

---

## 🚀 **Frontend Integration Ready!**

All APIs are ready for frontend connection:

**Authentication:** ✅ Complete
**User Management:** ✅ Complete
**Course Management:** ✅ Complete
**Category Management:** ✅ Complete
**Caching:** ✅ Complete

**API Documentation:** See `API_DOCUMENTATION.md`

---

**Sab test karo aur mujhe batao! 🎯**
