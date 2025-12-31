// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Authentication
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, sparse: true },
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
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, status: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", userSchema);
