// models/UserRole.js
const mongoose = require("mongoose");

const userRoleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true
  },

  // Context (where the role applies)
  contextType: {
    type: String,
    enum: ["system", "course", "category"],
    required: true
  },

  // Context ID (courseId, categoryId, or null for system-wide)
  contextId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  assignedAt: {
    type: Date,
    default: Date.now
  },

  validFrom: Date,
  validUntil: Date

}, { timestamps: true });

// Compound index to ensure unique role assignment
userRoleSchema.index({ userId: 1, roleId: 1, contextType: 1, contextId: 1 }, { unique: true });

module.exports = mongoose.model("UserRole", userRoleSchema);
