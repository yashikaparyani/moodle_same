// models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  // Event information
  eventType: {
    type: String,
    enum: [
      "user_login",
      "user_logout",
      "course_viewed",
      "activity_viewed",
      "activity_completed",
      "quiz_attempt_started",
      "quiz_attempt_submitted",
      "assignment_submitted",
      "forum_post_created",
      "forum_post_viewed",
      "message_sent",
      "user_created",
      "user_updated",
      "course_created",
      "course_updated",
      "enrollment_created",
      "enrollment_deleted",
      "grade_updated",
      "file_uploaded",
      "file_downloaded",
      "error",
      "system"
    ],
    required: true
  },

  // User who performed the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // Context
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  },

  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity"
  },

  // Related entity
  relatedType: String,
  relatedId: mongoose.Schema.Types.ObjectId,

  // Action details
  action: String,
  description: String,

  // Request information
  ipAddress: String,
  userAgent: String,
  method: String, // GET, POST, etc.
  url: String,
  statusCode: Number,

  // Data
  data: mongoose.Schema.Types.Mixed,

  // Error information (if eventType is 'error')
  errorMessage: String,
  errorStack: String,

  // Performance
  responseTime: Number, // in milliseconds

  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }

}, { timestamps: true });

// Indexes for efficient querying
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ eventType: 1, timestamp: -1 });
logSchema.index({ courseId: 1, timestamp: -1 });
logSchema.index({ timestamp: -1 });

// TTL index to automatically delete old logs after 90 days
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model("Log", logSchema);
