// models/File.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  // File information
  filename: {
    type: String,
    required: true
  },

  originalName: {
    type: String,
    required: true
  },

  url: {
    type: String,
    required: true
  },

  path: String, // Server path if stored locally

  // File details
  size: {
    type: Number,
    required: true
  },

  mimeType: String,
  extension: String,

  // Context
  contextType: {
    type: String,
    enum: ["course", "activity", "user_profile", "submission", "forum", "message", "announcement", "certificate"],
    required: true
  },

  contextId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // Ownership
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  uploadedAt: {
    type: Date,
    default: Date.now
  },

  // Access control
  visibility: {
    type: String,
    enum: ["public", "course", "private"],
    default: "private"
  },

  // For course files
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  // File metadata
  description: String,
  tags: [String],

  // Download tracking
  downloadCount: {
    type: Number,
    default: 0
  },

  // Virus scan
  scanned: {
    type: Boolean,
    default: false
  },

  scanResult: {
    type: String,
    enum: ["clean", "infected", "suspicious", "pending"]
  },

  // Status
  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: Date

}, { timestamps: true });

// Indexes
fileSchema.index({ contextType: 1, contextId: 1 });
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ courseId: 1 });

module.exports = mongoose.model("File", fileSchema);
