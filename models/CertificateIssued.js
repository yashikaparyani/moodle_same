// models/CertificateIssued.js
const mongoose = require("mongoose");

const certificateIssuedSchema = new mongoose.Schema({
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Certificate",
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },

  // Certificate details
  certificateCode: {
    type: String,
    unique: true,
    required: true
  },

  issuedAt: {
    type: Date,
    default: Date.now
  },

  expiresAt: Date,

  // Certificate file
  pdfUrl: String,

  // Verification
  verificationUrl: String,
  qrCodeUrl: String,

  // Grade at time of issuance
  finalGrade: Number,
  gradePercentage: Number,

  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // Revocation
  isRevoked: {
    type: Boolean,
    default: false
  },

  revokedAt: Date,
  revocationReason: String

}, { timestamps: true });

// Indexes
certificateIssuedSchema.index({ userId: 1, courseId: 1 });
certificateIssuedSchema.index({ certificateCode: 1 });

module.exports = mongoose.model("CertificateIssued", certificateIssuedSchema);
