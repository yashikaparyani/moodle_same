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

// ========== Security & Performance Middleware ==========
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses

// ========== Body Parser Middleware ==========
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// ========== Request Logger ==========
app.use(logger);

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
// Organization routes (public and platform admin - no organization context needed)
app.use("/api/v1/organizations", require("./routes/organization.routes"));
app.use("/api/v1/organization", require("./routes/organization.routes"));

// Apply organization middleware to all other API routes
app.use("/api", setOrganizationContext, scopeToOrganization);

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/audit", require("./routes/audit.routes"));
app.use("/api/courses", require("./routes/course.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/enroll", require("./routes/enroll.routes"));
app.use("/api/cache", require("./routes/cache.routes"));

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
