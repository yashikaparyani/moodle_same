// controllers/auth/authController.js - Authentication Controller
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuditService = require('../../services/auditService');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * REGISTER - Create new user account
 * POST /api/auth/register
 * 
 * Body: { email, password, firstName, lastName, role (optional) }
 */
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      username,
      phone,
      role
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstName, and lastName are required'
      });
    }

    // Password strength check
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      username,
      phone,
      role: role || 'student', // Default role is student
      status: 'active',
      emailVerified: false
    });

    await newUser.save();

    // Log audit event
    await AuditService.logUserCreated(newUser, req, null);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return success with token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * LOGIN - Authenticate user and return JWT token
 * POST /api/auth/login
 * 
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      const remainingTime = Math.ceil((user.lockedUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({
        success: false,
        message: `Account is locked due to too many failed login attempts. Please try again in ${remainingTime} minutes.`,
        lockedUntil: user.lockedUntil
      });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact administrator.`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      await user.incrementFailedAttempts();

      // Log failed login attempt
      await AuditService.logLoginFailed(email, 'Invalid password', req);

      // Check if account got locked
      if (user.failedLoginAttempts >= 5) {
        await AuditService.logAccountLocked(user, user.failedLoginAttempts, req);
      }

      const attemptsLeft = 5 - user.failedLoginAttempts;
      const message = attemptsLeft > 0
        ? `Invalid email or password. ${attemptsLeft} attempts remaining.`
        : 'Account locked due to too many failed attempts. Try again in 3 hours.';

      return res.status(401).json({
        success: false,
        message
      });
    }

    // Reset failed attempts on successful login
    await user.resetFailedAttempts();

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIp = req.ip || req.connection.remoteAddress;
    await user.save();

    // Log successful login
    await AuditService.logLoginSuccess(user, req);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return success with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * GET CURRENT USER - Get authenticated user's profile
 * GET /api/auth/me
 * Requires: Authentication
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already attached by authMiddleware
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject()
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

/**
 * LOGOUT - Invalidate token (client-side only for JWT)
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // With JWT, logout is primarily client-side (delete token)
    // But we can update last activity
    if (req.user) {
      req.user.lastActivity = new Date();
      await req.user.save();
      
      // Log logout event
      await AuditService.logLogout(req.user, req);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};
