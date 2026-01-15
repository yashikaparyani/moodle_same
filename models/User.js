// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Organization (Multi-tenancy support)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false,
    index: true
  },
  
  // Platform Admin Flag
  isPlatformAdmin: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Authentication
  email: { type: String, required: true },
  username: { type: String, sparse: true },
  password: { type: String, required: true },
  
  // Basic role (for backward compatibility)
  role: { type: String, enum: ["admin", "trainer", "candidate", "student", "teacher", "manager"], required: true },
  
  // Profile information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePicture: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Bio and social
  bio: String,
  interests: [String],
  timezone: { type: String, default: "UTC" },
  language: { type: String, default: "en" },
  
  // Account status
  status: { 
    type: String, 
    enum: ["active", "suspended", "inactive", "pending"],
    default: "active" 
  },
  
  // Email verification
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Last activity
  lastLogin: Date,
  lastActivity: Date,
  
  // Preferences
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    digestFrequency: { type: String, enum: ["never", "daily", "weekly"], default: "daily" },
    showEmail: { type: Boolean, default: false },
    showProfile: { type: Boolean, default: true },
    courseDisplayMode: { type: String, enum: ["card", "list", "summary"], default: "card" }
  },
  
  // Legacy field
  linkedCandidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  
  // OAuth providers
  oauthProviders: [{
    provider: String,
    providerId: String
  }]
  
}, { timestamps: true });

// Indexes
userSchema.index({ role: 1, status: 1 });
userSchema.index({ organizationId: 1, email: 1 }, { unique: true }); // Unique email per organization
userSchema.index({ organizationId: 1, username: 1 }, { unique: true, sparse: true }); // Unique username per organization
userSchema.index({ organizationId: 1, role: 1 });
userSchema.index({ organizationId: 1, status: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Instance method to return safe user object (without sensitive data)
userSchema.methods.toSafeObject = function() {
  return {
    _id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    username: this.username,
    phone: this.phone,
    role: this.role,
    status: this.status,
    emailVerified: this.emailVerified,
    organizationId: this.organizationId,
    isPlatformAdmin: this.isPlatformAdmin,
    profilePicture: this.profilePicture,
    bio: this.bio,
    timezone: this.timezone,
    language: this.language,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
    // Excludes: password, resetPasswordToken, emailVerificationToken, etc.
  };
};

module.exports = mongoose.model("User", userSchema);
