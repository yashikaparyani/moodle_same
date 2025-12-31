// models/Cohort.js
const mongoose = require("mongoose");

const cohortSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  description: String,

  idNumber: String, // External ID for integration

  // Membership type
  membershipType: {
    type: String,
    enum: ["manual", "dynamic"],
    default: "manual"
  },

  // For dynamic cohorts (rule-based)
  rules: [{
    field: String, // e.g., "email", "department", "customField"
    operator: String, // e.g., "contains", "equals", "startsWith"
    value: String
  }],

  // Manual members (for manual cohorts)
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  // Context
  contextType: {
    type: String,
    enum: ["system", "category"],
    default: "system"
  },

  contextId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  },

  // Visibility
  visible: {
    type: Boolean,
    default: true
  },

  // Sync settings
  syncEnabled: {
    type: Boolean,
    default: false
  },

  lastSyncAt: Date,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Cohort", cohortSchema);
