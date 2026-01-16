# 🎓 LMS Backend - Learning Management System

A comprehensive, production-ready Learning Management System backend built with Node.js, Express, MongoDB, and Redis.

## 📚 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Multi-Tenancy](#multi-tenancy)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Features
- ✅ **User Management** - Complete user CRUD with role-based access control
- ✅ **Course Management** - Create, organize, and manage courses
- ✅ **Category System** - Hierarchical course categorization
- ✅ **Organization Support** - Multi-tenant architecture
- ✅ **Enrollment System** - Student course enrollments
- ✅ **Audit Logging** - Complete activity tracking and audit trails
- ✅ **Cache Management** - Redis-based caching for performance

### Authentication & Security
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Email Verification** - Email confirmation workflow
- ✅ **Password Reset** - Secure password reset mechanism
- ✅ **Role-Based Access Control** - Fine-grained permissions
- ✅ **Multi-Factor Organization** - Organization-scoped access

### Documentation
- ✅ **Interactive API Docs** - Swagger/OpenAPI 3.0 documentation
- ✅ **48 Documented Endpoints** - Complete API coverage
- ✅ **Try It Out** - Test APIs directly from browser
- ✅ **Export Support** - Postman/Insomnia ready

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database:** MongoDB with Mongoose ODM
- **Cache:** Redis (optional)
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, bcryptjs
- **Logging:** Winston, Morgan
- **Documentation:** Swagger UI Express, swagger-jsdoc
- **Utilities:** compression, dotenv

---

## 📖 API Documentation

### 🌐 Interactive Swagger UI
Access comprehensive, interactive API documentation at:

```
http://localhost:5000/api-docs
```

### 📄 Documentation Files
- **[SWAGGER_DOCUMENTATION.md](SWAGGER_DOCUMENTATION.md)** - Complete usage guide
- **[SWAGGER_QUICK_REFERENCE.md](SWAGGER_QUICK_REFERENCE.md)** - Quick reference card
- **[SWAGGER_IMPLEMENTATION_SUMMARY.md](SWAGGER_IMPLEMENTATION_SUMMARY.md)** - Implementation details

### Export OpenAPI Specification
```
http://localhost:5000/api-docs.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Start Redis (optional)**
   ```bash
   # If you want caching enabled
   redis-server
   ```

6. **Initialize database**
   ```bash
   # Run all initializers (roles, settings, etc.)
   npm run seed:all
   
   # Or run individually
   npm run seed:roles
   npm run seed:admin
   ```

7. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

8. **Access the application**
   - API: http://localhost:5000
   - Swagger UI: http://localhost:5000/api-docs
   - Health Check: http://localhost:5000/api/health

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── redis.js           # Redis connection
│   └── swagger.js         # Swagger/OpenAPI configuration
├── controllers/
│   ├── auth/              # Authentication controllers
│   ├── audit/             # Audit log controllers
│   ├── cache/             # Cache management controllers
│   ├── course/            # Course & category controllers
│   ├── organization/      # Organization controllers
│   └── user/              # User management controllers
├── middleware/
│   ├── authMiddleware.js  # JWT authentication
│   ├── roleMiddleware.js  # Role-based access control
│   ├── organizationMiddleware.js # Multi-tenant support
│   ├── errorHandler.js    # Global error handling
│   └── logger.js          # Request logging
├── models/
│   ├── User.js            # User schema
│   ├── Course.js          # Course schema
│   ├── Category.js        # Category schema
│   ├── Organization.js    # Organization schema
│   ├── Enrollment.js      # Enrollment schema
│   ├── AuditLog.js        # Audit log schema
│   └── ...                # Other models
├── routes/
│   ├── auth.routes.js     # Authentication routes
│   ├── user.routes.js     # User management routes
│   ├── course.routes.js   # Course routes
│   ├── category.routes.js # Category routes
│   ├── organization.routes.js # Organization routes
│   ├── audit.routes.js    # Audit routes
│   ├── cache.routes.js    # Cache routes
│   └── enroll.routes.js   # Enrollment routes
├── scripts/
│   ├── initializeRoles.js # Initialize default roles
│   ├── createPlatformAdmin.js # Create platform admin
│   └── runAllInitializers.js # Run all setup scripts
├── services/
│   ├── auditService.js    # Audit logging service
│   ├── cacheService.js    # Cache service
│   └── organizationService.js # Organization service
├── utils/
│   └── errorHandler.js    # Error handling utilities
├── logs/                  # Application logs
├── .env                   # Environment variables
├── .env.example           # Environment template
├── server.js              # Application entry point
├── package.json           # Dependencies
└── README.md             # This file
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/lms_database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (if using email features)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@yourdomain.com

# Application URLs
FRONTEND_URL=http://localhost:3000
```

---

## 📜 Available Scripts

```bash
# Start server in production mode
npm start

# Start server in development mode (with nodemon)
npm run dev

# Initialize database roles
npm run seed:roles

# Create platform admin user
npm run seed:admin

# Run all initialization scripts
npm run seed:all

# Run tests (to be implemented)
npm test
```

---

## 🔗 API Endpoints

### Overview
**Total Endpoints:** 48

| Module | Endpoints | Documentation |
|--------|-----------|---------------|
| Authentication | 9 | User registration, login, password reset |
| Organizations | 8 | Multi-tenant organization management |
| Users | 7 | User CRUD and management |
| Courses | 7 | Course creation and management |
| Categories | 7 | Course categorization |
| Audit | 4 | Activity logging and tracking |
| Cache | 5 | Cache management |
| Enrollment | 1 | Course enrollments |
| Health | 2 | Server health checks |

### Quick Reference

#### Authentication
```
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # Login
GET    /api/auth/me                 # Get current user
POST   /api/auth/logout             # Logout
POST   /api/auth/send-verification  # Send email verification
GET    /api/auth/verify-email/:token # Verify email
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password
POST   /api/auth/change-password    # Change password
```

#### Users
```
GET    /api/users                   # List all users
GET    /api/users/:id               # Get user by ID
POST   /api/users                   # Create user
PUT    /api/users/:id               # Update user
DELETE /api/users/:id               # Delete user
PATCH  /api/users/:id/status        # Change user status
GET    /api/users/stats             # Get user statistics
```

#### Courses
```
GET    /api/courses                 # List all courses
GET    /api/courses/:id             # Get course by ID
POST   /api/courses                 # Create course
PUT    /api/courses/:id             # Update course
DELETE /api/courses/:id             # Delete course
GET    /api/courses/:id/students    # Get enrolled students
GET    /api/courses/stats           # Get course statistics
```

#### Categories
```
GET    /api/categories              # Get all categories (tree)
GET    /api/categories/flat         # Get all categories (flat)
GET    /api/categories/:id          # Get category by ID
GET    /api/categories/:id/courses  # Get category courses
POST   /api/categories              # Create category
PUT    /api/categories/:id          # Update category
DELETE /api/categories/:id          # Delete category
```

For complete endpoint documentation, visit: **http://localhost:5000/api-docs**

---

## 🔐 Authentication

### JWT Token-Based Authentication

1. **Register/Login** to receive a JWT token
   ```bash
   POST /api/auth/login
   {
     "identifier": "username_or_email",
     "password": "your_password"
   }
   ```

2. **Include token in requests**
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### User Roles
- **Platform Admin** - Full system access
- **Organization Admin** - Organization-level admin
- **Manager** - User and content management
- **Course Creator** - Course creation and management
- **Teacher** - Course teaching and student management
- **Student** - Course enrollment and learning

---

## 🏢 Multi-Tenancy

### Organization-Based Architecture

The system supports multiple organizations with isolated data:

1. **Organization Registration**
   - Platform admin generates registration token
   - Organization registers using token
   - Automatic organization context for all operations

2. **Organization Context**
   - Header: `x-organization-id`
   - Automatically scoped queries
   - Data isolation between organizations

---

## 🧪 Testing with Swagger UI

1. **Open Swagger UI:** http://localhost:5000/api-docs
2. **Login to get token:**
   - Navigate to Authentication section
   - Test `POST /api/auth/login`
   - Copy the returned token
3. **Authorize:**
   - Click "Authorize" button (🔒)
   - Enter: `Bearer YOUR_TOKEN`
   - Click "Authorize"
4. **Test endpoints:**
   - Click "Try it out" on any endpoint
   - Fill in required parameters
   - Click "Execute"
   - View response

---

## 📊 Logging & Monitoring

### Application Logs
- **Location:** `./logs/` directory
- **Rotation:** Daily rotation
- **Levels:** error, warn, info, debug

### Audit Logs
- Complete activity tracking
- User action logging
- API endpoint: `/api/audit`

### Health Check
```bash
GET /api/health
```

---

## 🔄 Cache Management

### Redis Integration
- Optional but recommended for production
- Improves API response times
- Cache endpoints available at `/api/cache`

### Cache Operations
```bash
GET    /api/cache/stats            # Cache statistics
DELETE /api/cache/flush            # Clear all cache
DELETE /api/cache/:key             # Delete specific key
POST   /api/cache/invalidate       # Invalidate by type
```

---

## 🚢 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production MongoDB URI
- [ ] Set up Redis for caching
- [ ] Configure email service
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Regular backups

---

## 📚 Additional Documentation

- **API Documentation:** http://localhost:5000/api-docs
- **Swagger Guide:** [SWAGGER_DOCUMENTATION.md](SWAGGER_DOCUMENTATION.md)
- **Quick Reference:** [SWAGGER_QUICK_REFERENCE.md](SWAGGER_QUICK_REFERENCE.md)
- **Implementation Summary:** [SWAGGER_IMPLEMENTATION_SUMMARY.md](SWAGGER_IMPLEMENTATION_SUMMARY.md)
- **Postman Collection:** Export from http://localhost:5000/api-docs.json

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- Swagger/OpenAPI for API documentation standards
- MongoDB team for the powerful database
- All contributors and users

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the API documentation: http://localhost:5000/api-docs
- Review the documentation files in this repository

---

**Built with ❤️ for education**

**Version:** 2.0.0  
**Last Updated:** January 16, 2026  
**Status:** ✅ Production Ready
