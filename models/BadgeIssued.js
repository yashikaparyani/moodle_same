// models/BadgeIssued.js
const mongoose = require("mongoose");

const badgeIssuedSchema = new mongoose.Schema({
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Badge",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  issuedAt: {
    type: Date,
    default: Date.now
  },

  expiresAt: Date,

  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // For verification
  uniqueHash: {
    type: String,
    unique: true
  },

  // Visibility
  isPublic: {
    type: Boolean,
    default: true
  },

  // Revocation
  isRevoked: {
    type: Boolean,
    default: false
  },

  revokedAt: Date,
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  revocationReason: String

}, { timestamps: true });

// Indexes
badgeIssuedSchema.index({ userId: 1, badgeId: 1 });
badgeIssuedSchema.index({ uniqueHash: 1 });

module.exports = mongoose.model("BadgeIssued", badgeIssuedSchema);
