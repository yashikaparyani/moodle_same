// routes/auth.routes.js - Authentication Routes
const express = require("express");
const router = express.Router();

// Import controllers
const authController = require("../controllers/auth/authController");
const emailVerificationController = require("../controllers/auth/emailVerificationController");
const passwordResetController = require("../controllers/auth/passwordResetController");

// Import middleware
const { authenticate } = require("../middleware/authMiddleware");

// ========== Basic Authentication ==========

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user's profile
 * @access  Private
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

// ========== Email Verification ==========

/**
 * @route   POST /api/auth/send-verification
 * @desc    Send email verification link
 * @access  Public
 */
router.post("/send-verification", emailVerificationController.sendVerificationEmail);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email with token
 * @access  Public
 */
router.get("/verify-email/:token", emailVerificationController.verifyEmail);

// ========== Password Reset ==========

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (sends email with reset link)
 * @access  Public
 */
router.post("/forgot-password", passwordResetController.requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/reset-password", passwordResetController.resetPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (for logged-in users)
 * @access  Private
 */
router.post("/change-password", authenticate, passwordResetController.changePassword);

module.exports = router;

