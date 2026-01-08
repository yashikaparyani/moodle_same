// models/User.js - Enhanced User Model with Security Features
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // ========== Authentication Fields ==========
  email: { 
    type: String, 
    unique: true, 
    required: true,
    lowercase: true,
    trim: true
  },
  username: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  
  // ========== Role-Based Access Control ==========
  // Standard LMS roles (Moodle-compatible)
  role: { 
    type: String, 
    enum: ["admin", "manager", "course_creator", "teacher", "non_editing_teacher", "student"],
    default: "student",
    required: true 
  },
  
  // ========== Profile Information ==========
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true
  },
  profilePicture: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // ========== Bio and Interests ==========
  bio: String,
  interests: [String],
  timezone: { type: String, default: "UTC" },
  language: { type: String, default: "en" },
  
  // ========== Account Status & Security ==========
  status: { 
    type: String, 
    enum: ["active", "suspended", "inactive", "pending"],
    default: "active" 
  },
  
  // Security: Account Lockout Protection
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date,
    default: null
  },
  
  // ========== Email Verification ==========
  emailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // ========== Password Reset ==========
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // ========== Last Activity Tracking ==========
  lastLogin: Date,
  lastLoginIp: String,
  lastActivity: Date,
  
  // ========== Audit Fields ==========
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  
  // ========== User Preferences ==========
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    digestFrequency: { type: String, enum: ["never", "daily", "weekly"], default: "daily" },
    showEmail: { type: Boolean, default: false },
    showProfile: { type: Boolean, default: true },
    courseDisplayMode: { type: String, enum: ["card", "list", "summary"], default: "card" }
  },
  
  // ========== Legacy & OAuth Fields ==========
  linkedCandidateId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Candidate" 
  },
  oauthProviders: [{
    provider: String,
    providerId: String
  }]
  
}, { 
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========== Indexes for Performance ==========
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ lastLogin: -1 });

// ========== Virtual Fields ==========
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// ========== Instance Methods ==========

/**
 * Check if account is locked
 * @returns {boolean} True if account is currently locked
 */
userSchema.methods.isLocked = function() {
  return this.lockedUntil && this.lockedUntil > Date.now();
};

/**
 * Increment failed login attempts and lock if needed
 * Locks account for 3 hours after 5 failed attempts
 */
userSchema.methods.incrementFailedAttempts = async function() {
  this.failedLoginAttempts += 1;
  
  // Lock account after 5 failed attempts for 3 hours
  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours
  }
  
  await this.save();
};

/**
 * Reset failed attempts on successful login
 */
userSchema.methods.resetFailedAttempts = async function() {
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
  this.lastLogin = new Date();
  await this.save();
};

/**
 * Get safe user object (without sensitive data)
 * @returns {Object} User object without password and sensitive fields
 */
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.emailVerificationToken;
  delete obj.failedLoginAttempts;
  delete obj.lockedUntil;
  return obj;
};

// ========== Export Model ==========
module.exports = mongoose.model("User", userSchema);
