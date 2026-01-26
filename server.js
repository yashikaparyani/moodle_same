// server.js - Enhanced LMS Backend Server
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Import configuration
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { 
  generalLimiter, 
  authLimiter, 
  passwordResetLimiter,
  userCreationLimiter,
  docsLimiter,
  orgRegistrationLimiter,
  uploadLimiter
} = require("./config/rateLimiter");

// Import middleware
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const { setOrganizationContext, scopeToOrganization } = require("./middleware/organizationMiddleware");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Connect to Redis (optional - server continues if Redis fails)
connectRedis();

// ========== Static File Serving ==========
// Serve uploaded files (must be before other middleware that might interfere)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== CORS Configuration ==========
// Secure CORS setup with origin whitelist
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',      // React frontend (development)
      'http://localhost:5173',      // Vite frontend (development)
      'http://127.0.0.1:3000',      // Alternative localhost
      'http://127.0.0.1:5173'       // Alternative localhost
    ];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from unauthorized origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,                    // Allow cookies and authorization headers
  optionsSuccessStatus: 200,           // For legacy browsers (IE11)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-organization-id',
    'x-requested-with',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Total-Count'],
  maxAge: 600                          // Cache preflight requests for 10 minutes
};

// ========== Security & Performance Middleware ==========
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // Enable CORS with security
app.use(compression()); // Compress responses

// ========== Body Parser Middleware ==========
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// ========== Request Logger ==========
app.use(logger);

// ========== Rate Limiting ==========
// Apply to Swagger docs (relaxed limit)
app.use("/api-docs", docsLimiter);

// ========== Swagger API Documentation ==========
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "LMS API Documentation",
  customfavIcon: "/favicon.ico"
}));

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// ========== API Routes ==========
// Apply strict limiter for organization registration
const orgRoutes = require("./routes/organization.routes");
app.use("/api/v1/organizations", orgRoutes);
app.use("/api/v1/organization", orgRoutes);

// Apply organization middleware to all other API routes
app.use("/api", setOrganizationContext, scopeToOrganization);

// Apply general rate limiter to all API routes
app.use("/api", generalLimiter);

// Authentication routes with strict limiter
const authRoutes = require("./routes/auth.routes");
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", passwordResetLimiter);
app.use("/api/auth/reset-password", passwordResetLimiter);
app.use("/api/auth", authRoutes);

// User routes with creation limiter
const userRoutes = require("./routes/user.routes");
app.post("/api/users", userCreationLimiter); // Apply to user creation only
app.use("/api/users", userRoutes);

// Other routes
app.use("/api/audit", require("./routes/audit.routes"));
app.use("/api/courses", require("./routes/course.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/enroll", require("./routes/enroll.routes"));
app.use("/api/cache", require("./routes/cache.routes"));
app.use("/api/tasks", require("./routes/task.routes"));
app.use("/api/calendar-events", require("./routes/calendarEvent.routes"));

// File upload routes with upload limiter
const uploadRoutes = require("./routes/upload.routes");
app.use("/api/upload", uploadLimiter, uploadRoutes);

// ========== Health Check Route ==========
/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     description: Get basic API information and documentation link
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "LMS Backend API is running"
 *                 version:
 *                   type: string
 *                   example: "2.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 documentation:
 *                   type: string
 *                   example: "http://localhost:5000/api-docs"
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LMS Backend API is running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    documentation: `${req.protocol}://${req.get('host')}/api-docs`
  });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the server is healthy and running
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is healthy"
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 *                   description: "Server uptime in seconds"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ========== Error Handler (must be last) ==========
app.use(errorHandler);

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 LMS Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log("=================================");
});
